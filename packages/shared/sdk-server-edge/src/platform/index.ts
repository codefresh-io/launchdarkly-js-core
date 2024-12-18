import type { Crypto, Info, Platform, Requests } from '@launchdarkly/js-server-sdk-common';

import EdgeCrypto from './crypto';
import EdgeRequests from './requests';

export default class EdgePlatform implements Platform {
  info: Info;

  crypto: Crypto = new EdgeCrypto();

  requests: Requests;

  constructor(info: Info, edgeRequestsOptions: Record<string, string> = {}) {
    this.info = info;
    this.requests = new EdgeRequests({ additionalFetchOptions: edgeRequestsOptions });
  }
}
