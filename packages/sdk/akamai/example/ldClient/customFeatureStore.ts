import { EdgeProvider, initWithFeatureStore, LDContext } from '@launchdarkly/akamai-edgeworker-sdk';

export type { LDContext, EdgeProvider };

class MyCustomStoreProvider implements EdgeProvider {
  // root key is formatted as LD-Env-{Launchdarkly environment client ID}
  async get(rootKey: string): Promise<string> {
    // you should provide an implementation to retrieve your flags from launchdarkly's https://sdk.launchdarkly.com/sdk/latest-all endpoint.
    // see https://docs.launchdarkly.com/sdk/features/flags-from-files for more information.
    return '{"flags":{"enable-ads":{"key":"enable-ads","on":true,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":true,"usingEnvironmentId":false},"clientSide":false,"salt":"b7091ec235f54ffc81215718aa9ae0da","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":5,"deleted":false},"cliffs-trello-flag":{"key":"cliffs-trello-flag","on":false,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":false,"usingEnvironmentId":false},"clientSide":false,"salt":"aab85fe93b4843d785fa6cdca5d47b42","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":2,"deleted":false},"cloned-test-flag":{"key":"cloned-test-flag","on":false,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":false,"usingEnvironmentId":false},"clientSide":false,"salt":"3dd395704cb949fbbb42f8fa40acc5ac","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":2,"deleted":false},"enable-everything":{"key":"enable-everything","on":true,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":false,"usingEnvironmentId":false},"clientSide":false,"salt":"adc3b3e5b3c0435795a98cb874ff5943","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":7,"deleted":false},"enable-flag-links":{"key":"enable-flag-links","on":true,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[{"variation":0,"id":"e96fec93-6bef-4f6a-b105-5d9625c53993","clauses":[{"contextKind":"user","attribute":"country","op":"in","values":["testing"],"negate":false}],"trackEvents":false}],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":false,"usingEnvironmentId":false},"clientSide":false,"salt":"1948f0024e55421f87aa14e64f39684e","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":4,"deleted":false},"enable-integration-testing":{"key":"enable-integration-testing","on":false,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":false,"usingEnvironmentId":false},"clientSide":false,"salt":"d74f52fca084400dbb8d8656b6a3448d","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":6,"deleted":false},"enable-rate-limiting":{"key":"enable-rate-limiting","on":false,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":false,"usingEnvironmentId":false},"clientSide":false,"salt":"6571817c741f4e4e88e4e4c83d4f9737","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":21,"deleted":false},"jira-flag":{"key":"jira-flag","on":false,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":false,"usingEnvironmentId":false},"clientSide":false,"salt":"521af5a23835460b9b2d88f27367e5f0","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":12,"deleted":false},"local-testing-flag":{"key":"local-testing-flag","on":false,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":false,"usingEnvironmentId":false},"clientSide":false,"salt":"1f5c29c3f19a45a99fd8381181a85087","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":26,"deleted":false},"new-flag":{"key":"new-flag","on":true,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":false,"usingEnvironmentId":false},"clientSide":false,"salt":"a79b0dc15d844064b79d29a5680b0a91","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":6,"deleted":false},"newest-flag":{"key":"newest-flag","on":false,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[{"variation":0,"id":"51929294-fa8b-4b5b-bae0-390c46e0fd77","clauses":[{"contextKind":"user","attribute":"country","op":"in","values":["test","test-again"],"negate":false}],"trackEvents":false}],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":false,"usingEnvironmentId":false},"clientSide":false,"salt":"6ba94f5eecc448a98708f0223271d0f5","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":11,"deleted":false},"testing":{"key":"testing","on":true,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":false,"usingEnvironmentId":false},"clientSide":false,"salt":"6eae7b7d9c7d473983eca32b0bd6b216","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":7,"deleted":false},"testing-flag":{"key":"testing-flag","on":true,"prerequisites":[],"targets":[],"contextTargets":[],"rules":[],"fallthrough":{"variation":0},"offVariation":1,"variations":[true,false],"clientSideAvailability":{"usingMobileKey":false,"usingEnvironmentId":false},"clientSide":false,"salt":"add85730b02b4410a5c83970d302ca72","trackEvents":false,"trackEventsFallthrough":false,"debugEventsUntilDate":null,"version":3,"deleted":false}},"segments":{}}';
  }
}

export const evaluateFlagFromCustomFeatureStore = async (
  flagKey: string,
  context: LDContext,
  defaultValue: boolean
) => {
  const client = initWithFeatureStore({
    sdkKey: 'Your-launchdarkly-environment-client-id',
    featureStoreProvider: new MyCustomStoreProvider(),
  });

  return await client.variation(flagKey, context, defaultValue);
};
