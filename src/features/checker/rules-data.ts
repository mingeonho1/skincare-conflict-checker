import { RULES_NIACINAMIDE_RETINOID_BPO } from "./rules-data-1";
import { RULES_PEPTIDE_AZELAIC } from "./rules-data-2";
import { RULES_VITC_BPO_EXTRA } from "./rules-data-3";
import { RULES_MYTH_SAFE } from "./rules-data-4";
import type { ConflictRule } from "./schema";

export const RULES_RAW: ConflictRule[] = [
  ...RULES_NIACINAMIDE_RETINOID_BPO,
  ...RULES_PEPTIDE_AZELAIC,
  ...RULES_VITC_BPO_EXTRA,
  ...RULES_MYTH_SAFE,
];
