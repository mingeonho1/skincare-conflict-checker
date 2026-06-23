import type { ConflictRule } from "./schema";

// Previously this file contained vitc-strong-bpo (VITC_PURE × BPO).
// After Round 3: ethyl-ascorbic-acid was moved out of VITC_PURE (it is BPO-tolerant).
// VITC_PURE now only contains l-ascorbic-acid, which is already covered by the
// higher-specificity id-id rule lascorbic-bpo (rules-data-1.ts). No group rule needed.
export const RULES_VITC_BPO_EXTRA: ConflictRule[] = [];
