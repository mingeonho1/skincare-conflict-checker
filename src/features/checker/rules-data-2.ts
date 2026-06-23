import type { ConflictRule } from "./schema";

export const RULES_PEPTIDE_AZELAIC: ConflictRule[] = [
  {
    id: "copper-peptide-aha",
    pair: [{ id: "copper-peptide" }, { group: "AHA" }],
    verdict: "warn",
    severity: "moderate",
    confidence: "established",
    mechanismType: "ph",
    mechanism: "낮은 pH와 구리 산화환원이 구리펩타이드를 불안정하게 해요.",
    action: "구리펩타이드는 저녁 단독, 산은 다른 시간·날에 사용하세요.",
    source: {
      label: "Deciem",
      url: "https://deciem.com/en-us/theordinary/conflicts",
    },
  },
  {
    id: "copper-peptide-bha",
    pair: [{ id: "copper-peptide" }, { group: "BHA" }],
    verdict: "warn",
    severity: "moderate",
    confidence: "established",
    mechanismType: "ph",
    mechanism: "낮은 pH와 구리 산화환원이 구리펩타이드를 불안정하게 해요.",
    action: "구리펩타이드는 저녁 단독, BHA는 다른 시간·날에 사용하세요.",
    source: {
      label: "Deciem",
      url: "https://deciem.com/en-us/theordinary/conflicts",
    },
  },
  {
    // VITC_ANTIOX covers both l-ascorbic-acid and ethyl-ascorbic-acid:
    // both are functional antioxidants that can destabilise copper peptides.
    id: "copper-peptide-vitc-pure",
    pair: [{ id: "copper-peptide" }, { group: "VITC_ANTIOX" }],
    verdict: "warn",
    severity: "moderate",
    confidence: "established",
    mechanismType: "ph",
    mechanism: "낮은 pH·구리 산화환원이 구리펩타이드를 불안정하게 해요.",
    action: "구리펩타이드는 저녁 단독, 비타민C는 아침에 사용하세요.",
    source: {
      label: "Deciem",
      url: "https://deciem.com/en-us/theordinary/conflicts",
    },
  },
  {
    id: "peptide-aha",
    pair: [{ id: "peptide" }, { group: "AHA" }],
    verdict: "caution",
    severity: "low",
    confidence: "contested",
    mechanismType: "ph",
    mechanism:
      "순수 펩타이드는 낮은 pH에서 가수분해될 수 있지만, pH 완충된 시판 제품은 대개 괜찮아요.",
    action: "산을 먼저 흡수 후 펩타이드를 바르거나, 완전히 분리하세요.",
    source: {
      label: "Deciem",
      url: "https://deciem.com/en-us/theordinary/conflicts",
    },
  },
  {
    id: "peptide-bha",
    pair: [{ id: "peptide" }, { group: "BHA" }],
    verdict: "caution",
    severity: "low",
    confidence: "contested",
    mechanismType: "ph",
    mechanism:
      "순수 펩타이드는 낮은 pH에서 가수분해될 수 있지만, pH 완충된 시판 제품은 대개 괜찮아요.",
    action: "산을 먼저 흡수 후 펩타이드를 바르거나, 완전히 분리하세요.",
    source: {
      label: "Deciem",
      url: "https://deciem.com/en-us/theordinary/conflicts",
    },
  },
  {
    id: "azelaic-niacinamide",
    pair: [{ id: "azelaic-acid" }, { id: "niacinamide" }],
    verdict: "safe",
    severity: null,
    confidence: "established",
    mechanismType: "synergy",
    mechanism: "pH가 맞고 둘 다 진정·미백이라 시너지를 내요.",
    action: "",
    source: {
      label: "INKEY List",
      url: "https://theinkeylist.com/blogs/news/can-you-use-azelaic-acid-and-niacinamide-together",
    },
  },
  {
    id: "retinoid-niacinamide",
    pair: [{ group: "RETINOID" }, { id: "niacinamide" }],
    verdict: "safe",
    severity: null,
    confidence: "established",
    mechanismType: "synergy",
    mechanism:
      "나이아신아마이드가 피부 장벽을 강화해 레티노이드 자극을 완화해요. 같이 쓰면 오히려 시너지예요.",
    action: "레티노이드 후 나이아신아마이드 순서로 레이어링하면 더 좋아요.",
    source: {
      label: "Journal of Cosmetic Dermatology",
      url: "https://onlinelibrary.wiley.com/doi/10.1111/jocd.14566",
    },
  },
  {
    id: "tranexamic-niacinamide",
    pair: [{ id: "tranexamic-acid" }, { id: "niacinamide" }],
    verdict: "safe",
    severity: null,
    confidence: "established",
    mechanismType: "synergy",
    mechanism:
      "미백 기전이 달라요. 트라넥삼산은 멜라닌 전달을 차단, 나이아신아마이드는 전달 자체를 억제해 상호보완돼요.",
    action: "",
    source: {
      label: "Paula's Choice",
      url: "https://www.paulaschoice.com/expert-advice/skincare-advice/skin-brightening/tranexamic-acid-skin-benefits",
    },
  },
  {
    id: "vitc-vitamin-e-ferulic",
    pair: [{ id: "l-ascorbic-acid" }, { id: "vitamin-e" }],
    verdict: "safe",
    severity: null,
    confidence: "established",
    mechanismType: "synergy",
    mechanism:
      "비타민C + 비타민E 조합은 항산화 효과가 8배 높아져요. 페룰릭산까지 더하면 안정성도 높아져요(CE Ferulic 포뮬러).",
    action: "",
    source: {
      label: "Journal of Investigative Dermatology",
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3780707/",
    },
  },
  {
    id: "bakuchiol-aha",
    pair: [{ id: "bakuchiol" }, { group: "AHA" }],
    verdict: "safe",
    severity: null,
    confidence: "established",
    mechanismType: "synergy",
    mechanism:
      "바쿠치올은 광민감이 없고 pH 제약도 없어요. AHA와 함께 쓸 수 있어요.",
    action: "",
    source: {
      label: "International Journal of Cosmetic Science",
      url: "https://onlinelibrary.wiley.com/doi/10.1111/ics.12497",
    },
  },
  {
    id: "bakuchiol-niacinamide",
    pair: [{ id: "bakuchiol" }, { id: "niacinamide" }],
    verdict: "safe",
    severity: null,
    confidence: "established",
    mechanismType: "synergy",
    mechanism:
      "바쿠치올과 나이아신아마이드는 함께 쓰기 좋은 레티놀 대안 루틴이에요. 광민감 없이 안티에이징 시너지를 내요.",
    action: "",
    source: {
      label: "International Journal of Cosmetic Science",
      url: "https://onlinelibrary.wiley.com/doi/10.1111/ics.12497",
    },
  },
];
