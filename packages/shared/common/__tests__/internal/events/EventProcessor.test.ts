import { Context } from '../../../src';
import { LDDeliveryStatus, LDEventType } from '../../../src/api/subsystem';
import { EventProcessor, InputIdentifyEvent } from '../../../src/internal';
import { EventProcessorOptions } from '../../../src/internal/events/EventProcessor';
import { clientContext } from '../../../src/mocks';
import ContextDeduplicator from '../../../src/mocks/contextDeduplicator';

const mockSendEventData = jest.fn(() =>
  Promise.resolve({
    status: LDDeliveryStatus.Succeeded,
  }),
);

jest.mock('../../../src/internal/events/EventSender', () => ({
  default: jest.fn(() => ({
    sendEventData: mockSendEventData,
  })),
}));

const user = { key: 'userKey', name: 'Red' };
const userWithFilteredName = {
  key: 'userKey',
  kind: 'user',
  name: 'Red',
  _meta: { privateAttributes: ['name'] },
};
const anonUser = { key: 'anon-user', name: 'Anon', anonymous: true };
const filteredUser = { key: 'userKey', kind: 'user', _meta: { redactedAttributes: ['name'] } };

const testIndexEvent = { context: { ...user, kind: 'user' }, creationDate: 1000, kind: 'index' };
function makeSummary(start: number, end: number, count: number, version: number): any {
  return {
    endDate: end,
    features: {
      flagkey: {
        contextKinds: ['user'],
        counters: [
          {
            count,
            value: 'value',
            variation: 1,
            version,
          },
        ],
        default: 'default',
      },
    },
    kind: 'summary',
    startDate: start,
  };
}

function makeFeatureEvent(
  date: number,
  version: number,
  debug: boolean = false,
  key: string = 'flagkey',
  variation: number = 1,
  def: string = 'default',
  value: string = 'value',
): any {
  return {
    kind: debug ? 'debug' : 'feature',
    key,
    creationDate: date,
    version,
    variation,
    value,
    default: def,
    ...(debug
      ? {
          context: {
            key: 'userKey',
            name: 'Red',
            kind: 'user',
          },
        }
      : {
          contextKeys: {
            user: 'userKey',
          },
        }),
  };
}

describe('given an event processor', () => {
  let contextDeduplicator: ContextDeduplicator;
  let eventProcessor: EventProcessor;

  const eventProcessorConfig: EventProcessorOptions = {
    allAttributesPrivate: false,
    privateAttributes: [],
    eventsCapacity: 1000,
    flushInterval: 300,
    diagnosticRecordingInterval: 900,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    contextDeduplicator = new ContextDeduplicator();
    eventProcessor = new EventProcessor(eventProcessorConfig, clientContext, contextDeduplicator);
  });

  afterEach(() => {
    eventProcessor.close();
  });

  it('queues an identify event', async () => {
    Date.now = jest.fn(() => 1000);
    eventProcessor.sendEvent(new InputIdentifyEvent(Context.fromLDContext(user)));

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      {
        context: { ...user, kind: 'user' },
        creationDate: 1000,
        kind: 'identify',
      },
    ]);
  });

  it('filters user in identify event', async () => {
    Date.now = jest.fn(() => 1000);
    eventProcessor.sendEvent(new InputIdentifyEvent(Context.fromLDContext(userWithFilteredName)));

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      {
        context: { ...filteredUser, kind: 'user' },
        creationDate: 1000,
        kind: 'identify',
      },
    ]);
  });

  it('stringifies user attributes in identify event', async () => {
    Date.now = jest.fn(() => 1000);
    eventProcessor.sendEvent(
      new InputIdentifyEvent(
        Context.fromLDContext({
          key: 1,
          ip: 3,
          country: 4,
          email: 5,
          firstName: 6,
          lastName: 7,
          avatar: 8,
          name: 9,
          anonymous: false,
          custom: { age: 99 },
        } as any),
      ),
    );

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      {
        context: {
          kind: 'user',
          key: '1',
          ip: '3',
          country: '4',
          email: '5',
          firstName: '6',
          lastName: '7',
          avatar: '8',
          name: '9',
          age: 99,
          anonymous: false,
        },
        creationDate: 1000,
        kind: 'identify',
      },
    ]);
  });

  it('queues individual feature event with index event', async () => {
    Date.now = jest.fn(() => 1000);
    eventProcessor.sendEvent({
      kind: 'feature',
      creationDate: 1000,
      context: Context.fromLDContext(user),
      key: 'flagkey',
      version: 11,
      variation: 1,
      value: 'value',
      trackEvents: true,
      default: 'default',
    });

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      testIndexEvent,
      makeFeatureEvent(1000, 11),
      makeSummary(1000, 1000, 1, 11),
    ]);
  });

  it('handles the version being 0', async () => {
    Date.now = jest.fn(() => 1000);
    eventProcessor.sendEvent({
      kind: 'feature',
      creationDate: 1000,
      context: Context.fromLDContext(user),
      key: 'flagkey',
      version: 0,
      variation: 1,
      value: 'value',
      trackEvents: true,
      default: 'default',
    });

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      testIndexEvent,
      makeFeatureEvent(1000, 0),
      makeSummary(1000, 1000, 1, 0),
    ]);
  });

  it('sets event kind to debug if event is temporarily in debug mode', async () => {
    Date.now = jest.fn(() => 1000);
    eventProcessor.sendEvent({
      kind: 'feature',
      creationDate: 1000,
      context: Context.fromLDContext(user),
      key: 'flagkey',
      version: 11,
      variation: 1,
      value: 'value',
      trackEvents: false,
      debugEventsUntilDate: 2000,
      default: 'default',
    });

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      testIndexEvent,
      makeFeatureEvent(1000, 11, true),
      makeSummary(1000, 1000, 1, 11),
    ]);
  });

  it('can both track and debug an event', async () => {
    Date.now = jest.fn(() => 1000);
    eventProcessor.sendEvent({
      kind: 'feature',
      creationDate: 1000,
      context: Context.fromLDContext(user),
      key: 'flagkey',
      version: 11,
      variation: 1,
      value: 'value',
      trackEvents: true,
      debugEventsUntilDate: 2000,
      default: 'default',
    });

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      testIndexEvent,
      makeFeatureEvent(1000, 11, false),
      makeFeatureEvent(1000, 11, true),
      makeSummary(1000, 1000, 1, 11),
    ]);
  });

  it('expires debug mode based on client time if client time is later than server time', async () => {
    Date.now = jest.fn(() => 2000);

    eventProcessor.sendEvent({
      kind: 'feature',
      creationDate: 1400,
      context: Context.fromLDContext(user),
      key: 'flagkey',
      version: 11,
      variation: 1,
      value: 'value',
      trackEvents: false,
      debugEventsUntilDate: 1500,
      default: 'default',
    });

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      {
        kind: 'index',
        creationDate: 1400,
        context: { ...user, kind: 'user' },
      },
      makeSummary(1400, 1400, 1, 11),
    ]);
  });

  it('generates only one index event from two feature events for same user', async () => {
    Date.now = jest.fn(() => 1000);

    const context = Context.fromLDContext(user);
    eventProcessor.sendEvent({
      kind: 'feature',
      creationDate: 1000,
      context,
      key: 'flagkey1',
      version: 11,
      variation: 1,
      value: 'value',
      trackEvents: true,
      default: 'default',
    });
    eventProcessor.sendEvent({
      kind: 'feature',
      creationDate: 1000,
      context,
      key: 'flagkey2',
      version: 22,
      variation: 3,
      value: 'carrot',
      trackEvents: true,
      default: 'potato',
    });

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      {
        kind: 'index',
        creationDate: 1000,
        context: { ...user, kind: 'user' },
      },
      makeFeatureEvent(1000, 11, false, 'flagkey1'),
      makeFeatureEvent(1000, 22, false, 'flagkey2', 3, 'potato', 'carrot'),
      {
        endDate: 1000,
        features: {
          flagkey1: {
            contextKinds: ['user'],
            counters: [
              {
                count: 1,
                value: 'value',
                variation: 1,
                version: 11,
              },
            ],
            default: 'default',
          },

          flagkey2: {
            contextKinds: ['user'],
            counters: [
              {
                count: 1,
                value: 'carrot',
                variation: 3,
                version: 22,
              },
            ],
            default: 'potato',
          },
        },
        kind: 'summary',
        startDate: 1000,
      },
    ]);
  });

  it('summarizes nontracked events', async () => {
    Date.now = jest.fn(() => 1000);

    const context = Context.fromLDContext(user);
    eventProcessor.sendEvent({
      kind: 'feature',
      creationDate: 1000,
      context,
      key: 'flagkey1',
      version: 11,
      variation: 1,
      value: 'value',
      trackEvents: false,
      default: 'default',
    });
    eventProcessor.sendEvent({
      kind: 'feature',
      creationDate: 1000,
      context,
      key: 'flagkey2',
      version: 22,
      variation: 3,
      value: 'carrot',
      trackEvents: false,
      default: 'potato',
    });

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      {
        kind: 'index',
        creationDate: 1000,
        context: { ...user, kind: 'user' },
      },
      {
        endDate: 1000,
        features: {
          flagkey1: {
            contextKinds: ['user'],
            counters: [
              {
                count: 1,
                value: 'value',
                variation: 1,
                version: 11,
              },
            ],
            default: 'default',
          },

          flagkey2: {
            contextKinds: ['user'],
            counters: [
              {
                count: 1,
                value: 'carrot',
                variation: 3,
                version: 22,
              },
            ],
            default: 'potato',
          },
        },
        kind: 'summary',
        startDate: 1000,
      },
    ]);
  });

  it('queues custom event with user', async () => {
    Date.now = jest.fn(() => 1000);
    eventProcessor.sendEvent({
      kind: 'custom',
      creationDate: 1000,
      context: Context.fromLDContext(user),
      key: 'eventkey',
      data: { thing: 'stuff' },
    });

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      {
        kind: 'index',
        creationDate: 1000,
        context: { ...user, kind: 'user' },
      },
      {
        kind: 'custom',
        key: 'eventkey',
        data: { thing: 'stuff' },
        creationDate: 1000,
        contextKeys: {
          user: 'userKey',
        },
      },
    ]);
  });

  it('queues custom event with anonymous user', async () => {
    eventProcessor.sendEvent({
      kind: 'custom',
      creationDate: 1000,
      context: Context.fromLDContext(anonUser),
      key: 'eventkey',
      data: { thing: 'stuff' },
    });

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      {
        kind: 'index',
        creationDate: 1000,
        context: { ...anonUser, kind: 'user' },
      },
      {
        kind: 'custom',
        key: 'eventkey',
        data: { thing: 'stuff' },
        creationDate: 1000,
        contextKeys: {
          user: 'anon-user',
        },
      },
    ]);
  });

  it('can include metric value in custom event', async () => {
    Date.now = jest.fn(() => 1000);
    eventProcessor.sendEvent({
      kind: 'custom',
      creationDate: 1000,
      context: Context.fromLDContext(user),
      key: 'eventkey',
      data: { thing: 'stuff' },
      metricValue: 1.5,
    });

    await eventProcessor.flush();

    expect(mockSendEventData).toBeCalledWith(LDEventType.AnalyticsEvents, [
      {
        kind: 'index',
        creationDate: 1000,
        context: { ...user, kind: 'user' },
      },
      {
        kind: 'custom',
        key: 'eventkey',
        data: { thing: 'stuff' },
        creationDate: 1000,
        contextKeys: {
          user: 'userKey',
        },
        metricValue: 1.5,
      },
    ]);
  });

  it('makes no requests if there are no events to flush', async () => {
    await eventProcessor.flush();
    expect(mockSendEventData).not.toBeCalled();
  });

  it('will not shutdown after a recoverable error', async () => {
    mockSendEventData.mockImplementation(() =>
      Promise.resolve({
        status: LDDeliveryStatus.Failed,
        error: new Error('some error'),
      }),
    );

    eventProcessor.sendEvent(new InputIdentifyEvent(Context.fromLDContext(user)));
    await expect(eventProcessor.flush()).rejects.toThrow('some error');

    eventProcessor.sendEvent(new InputIdentifyEvent(Context.fromLDContext(user)));
    await expect(eventProcessor.flush()).rejects.toThrow('some error');
  });

  it('will shutdown after a non-recoverable error', async () => {
    mockSendEventData.mockImplementation(() =>
      Promise.resolve({
        status: LDDeliveryStatus.FailedAndMustShutDown,
        error: new Error('some error'),
      }),
    );

    eventProcessor.sendEvent(new InputIdentifyEvent(Context.fromLDContext(user)));
    await expect(eventProcessor.flush()).rejects.toThrow('some error');

    eventProcessor.sendEvent(new InputIdentifyEvent(Context.fromLDContext(user)));
    await expect(eventProcessor.flush()).rejects.toThrow(/SDK key is invalid/);
  });

  // TODO:
  // it('swallows errors from failed background flush', async () => {
  //   mockSendEventData.mockImplementation(() =>
  //     Promise.resolve({
  //       status: LDDeliveryStatus.Failed,
  //       error: new Error('some error'),
  //     }),
  //   );
  //
  //   // Make a new client that flushes fast.
  //   const newConfig = { ...eventProcessorConfig, flushInterval: 0.1 };
  //   eventProcessor.close();
  //   eventProcessor = new EventProcessor(newConfig, clientContext, contextDeduplicator);
  //   eventProcessor.sendEvent(new InputIdentifyEvent(Context.fromLDContext(user)));
  //
  //   eventSender.queue.take();
  // });
});
