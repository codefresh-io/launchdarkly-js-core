import { NullEventSource } from '@launchdarkly/js-server-sdk-common';
import type {
  EventSource,
  EventSourceCapabilities,
  EventSourceInitDict,
  Options,
  Requests,
  Response,
} from '@launchdarkly/js-server-sdk-common';

export interface EdgeRequestsOptions {
  additionalFetchOptions?: Record<string, string>;
}

export default class EdgeRequests implements Requests {
  private options: EdgeRequestsOptions;

  constructor(options: EdgeRequestsOptions = {}) {
    this.options = options;
  }

  fetch(url: string, options: Options = {}): Promise<Response> {
    const finalOptions = { ...options, ...this.options.additionalFetchOptions };
    console.log(finalOptions);
    console.log('Additional options', this.options.additionalFetchOptions);
    // @ts-ignore
    return fetch(url, finalOptions);
  }

  createEventSource(url: string, eventSourceInitDict: EventSourceInitDict): EventSource {
    return new NullEventSource(url, eventSourceInitDict);
  }

  getEventSourceCapabilities(): EventSourceCapabilities {
    return {
      readTimeout: false,
      headers: false,
      customMethod: false,
    };
  }
}
