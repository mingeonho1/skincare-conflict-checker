import { ACTIVES_RETINOIDS_ACIDS } from "./actives-data-1";
import { ACTIVES_SUPPORT } from "./actives-data-2";
import { ACTIVES_VITC_DERIV } from "./actives-data-3";
import type { ActiveIngredient } from "./schema";

export const ACTIVES_RAW: ActiveIngredient[] = [
  ...ACTIVES_RETINOIDS_ACIDS,
  ...ACTIVES_SUPPORT,
  ...ACTIVES_VITC_DERIV,
];
