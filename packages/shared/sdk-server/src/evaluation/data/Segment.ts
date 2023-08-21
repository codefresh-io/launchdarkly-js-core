import { AttributeReference } from '@launchdarkly/js-sdk-common';

import { SegmentRule } from './SegmentRule';
import { SegmentTarget } from './SegmentTarget';
import { Versioned } from './Versioned';

export interface Segment extends Versioned {
  included?: string[];
  excluded?: string[];

  includedContexts?: SegmentTarget[];
  excludedContexts?: SegmentTarget[];
  rules?: SegmentRule[];
  salt?: string;
  unbounded?: boolean;
  unboundedContextKind?: string;
  generation?: number;

  // This field is not part of the schema, but it is populated during parsing.
  bucketByAttributeReference?: AttributeReference;

  // When there are a large number targets for a segment then
  // we put them into sets during de-serialization.
  generated_includedSet?: Set<string>;
  generated_excludedSet?: Set<string>;
}
