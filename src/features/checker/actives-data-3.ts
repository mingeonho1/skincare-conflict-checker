import type { ActiveIngredient } from "./schema";

export const ACTIVES_VITC_DERIV: ActiveIngredient[] = [
  {
    id: "sap",
    displayName: "SAP(소듐아스코빌포스페이트)",
    aliases: ["sodium ascorbyl phosphate", "SAP", "소듐아스코빌포스페이트"],
    category: "antioxidant",
    photosensitive: false,
    timeOfDay: "AM",
    viscosityRank: 4,
    groups: ["VITC_DERIV"],
  },
  {
    id: "map",
    displayName: "MAP(마그네슘아스코빌포스페이트)",
    aliases: [
      "magnesium ascorbyl phosphate",
      "MAP",
      "마그네슘아스코빌포스페이트",
    ],
    category: "antioxidant",
    photosensitive: false,
    timeOfDay: "AM",
    viscosityRank: 4,
    groups: ["VITC_DERIV"],
  },
  {
    id: "ascorbyl-glucoside",
    displayName: "아스코빌글루코사이드",
    aliases: ["ascorbyl glucoside", "아스코빌글루코사이드", "AA2G"],
    category: "antioxidant",
    photosensitive: false,
    timeOfDay: "AM",
    viscosityRank: 4,
    groups: ["VITC_DERIV"],
  },
  {
    id: "thd-ascorbate",
    displayName: "THD 아스코르베이트",
    aliases: [
      "tetrahexyldecyl ascorbate",
      "THD ascorbate",
      "THDA",
      "THD아스코르베이트",
    ],
    category: "antioxidant",
    photosensitive: false,
    timeOfDay: "AM",
    viscosityRank: 4,
    groups: ["VITC_DERIV"],
  },
];
