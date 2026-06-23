import type { ConflictRule } from "./schema";

export const RULES_NIACINAMIDE_RETINOID_BPO: ConflictRule[] = [
  {
    id: "niacinamide-vitc-pure",
    pair: [{ id: "niacinamide" }, { group: "VITC_PURE" }],
    verdict: "safe",
    severity: null,
    confidence: "myth",
    mechanismType: "synergy",
    mechanism:
      "니코틴산 생성 위험설은 70℃ 이상 가열 조건에서만 일어나요. 피부 온도(32~35℃)에선 무관해요. 오히려 두 성분이 시너지를 내요.",
    action: "",
    source: {
      label: "Paula's Choice",
      url: "https://www.paulaschoice.com/expert-advice/skincare-advice/niacinamide-vs-vitamin-c",
    },
    myth: "나이아신아마이드랑 비타민C 같이 쓰면 니코틴산이 생겨서 피부가 붉어진다던데요?",
  },
  {
    id: "niacinamide-aha",
    pair: [{ id: "niacinamide" }, { group: "AHA" }],
    verdict: "safe",
    severity: null,
    confidence: "myth",
    mechanismType: "ph",
    mechanism:
      "pH 중화로 효과가 사라진다는 건 통념이에요. 함께 써도 둘 다 작동하고, 나이아신아마이드가 산 자극을 진정시켜요.",
    action: "",
    source: {
      label: "Lab Muffin",
      url: "https://labmuffin.com/should-you-use-niacinamide-with-aha-bha",
    },
    myth: "나이아신아마이드가 AHA 산도를 중화시켜서 효과가 없어진다던데요?",
  },
  {
    id: "niacinamide-bha",
    pair: [{ id: "niacinamide" }, { group: "BHA" }],
    verdict: "safe",
    severity: null,
    confidence: "myth",
    mechanismType: "ph",
    mechanism:
      "pH 중화로 효과가 사라진다는 건 통념이에요. 함께 써도 둘 다 작동하고, 나이아신아마이드가 산 자극을 진정시켜요.",
    action: "",
    source: {
      label: "Lab Muffin",
      url: "https://labmuffin.com/should-you-use-niacinamide-with-aha-bha",
    },
    myth: "BHA 살리실산이랑 나이아신아마이드를 섞으면 효과가 사라진다던데요?",
  },
  {
    id: "retinoid-vitc-pure",
    pair: [{ group: "RETINOID" }, { group: "VITC_PURE" }],
    verdict: "safe",
    severity: null,
    confidence: "contested",
    mechanismType: "ph",
    mechanism:
      "'pH 충돌로 레티놀이 무력화된다'는 설은 근거가 약해요. 레티놀은 pH보다 빛·산소에 민감해요. 보통 비타민C 아침/레티놀 저녁으로 나누는 건 화학 충돌이 아니라 자극 분산 목적이에요.",
    action:
      "비타민C는 아침 루틴에, 레티노이드는 저녁 루틴에 사용하면 더 좋아요.",
    source: {
      label: "Paula's Choice",
      url: "https://www.paulaschoice.com/expert-advice/skincare-advice/retinol/retinol-vitamin-c",
    },
  },
  {
    id: "retinoid-aha",
    pair: [{ group: "RETINOID" }, { group: "AHA" }],
    verdict: "caution",
    severity: "moderate",
    confidence: "established",
    mechanismType: "irritation",
    mechanism:
      "둘 다 각질·턴오버를 높여 자극·각질 과다가 겹쳐요. 화학 불활성화가 아니라 누적 자극이에요.",
    action:
      "격일(스킨 사이클링) 또는 한쪽 아침/한쪽 저녁으로 나눠 쓰세요. 농도·내성에 따라 조절하세요.",
    source: {
      label: "Healthline",
      url: "https://www.healthline.com/health/aha-bha-retinol",
    },
  },
  {
    id: "retinoid-bha",
    pair: [{ group: "RETINOID" }, { group: "BHA" }],
    verdict: "caution",
    severity: "low",
    confidence: "established",
    mechanismType: "irritation",
    mechanism:
      "같은 누적 자극이지만 BHA는 모공 안에서 작용해 표면 장벽 손상은 덜해요.",
    action: "저녁 분리 권장, 내성이 생기면 BHA 아침도 가능해요.",
    source: {
      label: "Layered Skincare",
      url: "https://www.layeredskincare.com/blogs/learn/retinol-salicylic-acid",
    },
  },
  {
    id: "lascorbic-bpo",
    pair: [{ id: "l-ascorbic-acid" }, { id: "benzoyl-peroxide" }],
    verdict: "warn",
    severity: "moderate",
    confidence: "established",
    mechanismType: "oxidation",
    mechanism:
      "BPO 산화가 순수 비타민C를 분해해 효과↓ + 자극↑이 돼요. 유도체(SAP·MAP·THD)는 영향 적어요.",
    action: "비타민C 아침, BPO 저녁으로 분리(또는 격일)하세요.",
    source: {
      label: "Science Becomes Her",
      url: "https://sciencebecomesher.com/benzoyl-peroxide-vitamin-c",
    },
  },
  {
    id: "tretinoin-bpo",
    pair: [{ id: "tretinoin" }, { id: "benzoyl-peroxide" }],
    verdict: "warn",
    severity: "high",
    confidence: "established",
    mechanismType: "inactivation",
    mechanism:
      "트레티노인은 BPO·빛에 매우 약해 2시간에 50%, 24시간에 95% 분해돼요.",
    action: "BPO 아침, 트레티노인 저녁으로 반드시 분리하세요.",
    source: {
      label: "PubMed 9990414",
      url: "https://pubmed.ncbi.nlm.nih.gov/9990414",
    },
  },
  {
    id: "retinol-bpo",
    pair: [{ id: "retinol" }, { id: "benzoyl-peroxide" }],
    verdict: "caution",
    severity: "moderate",
    confidence: "contested",
    mechanismType: "inactivation",
    mechanism:
      "BPO 산소 라디칼이 레티놀을 일부 불활성화할 수 있어요. 트레티노인보다 근거는 약해요.",
    action: "시간대 분리(레티놀 저녁, BPO 아침)를 권장해요.",
    source: {
      label: "Science Becomes Her",
      url: "https://sciencebecomesher.com/benzoyl-peroxide-vitamin-c",
    },
  },
  {
    id: "retinal-bpo",
    pair: [{ id: "retinal" }, { id: "benzoyl-peroxide" }],
    verdict: "caution",
    severity: "moderate",
    confidence: "contested",
    mechanismType: "inactivation",
    mechanism:
      "BPO 산소 라디칼이 레티날을 일부 불활성화할 수 있어요. 시간대 분리를 권장해요.",
    action: "레티날 저녁, BPO 아침으로 분리하세요.",
    source: {
      label: "Science Becomes Her",
      url: "https://sciencebecomesher.com/benzoyl-peroxide-vitamin-c",
    },
  },
  {
    id: "adapalene-bpo",
    pair: [{ id: "adapalene" }, { id: "benzoyl-peroxide" }],
    verdict: "safe",
    severity: null,
    confidence: "established",
    mechanismType: "inactivation",
    mechanism:
      "아다팔렌은 광·산화 안정이라 BPO와 함께 써도 분해되지 않아요. 에피듀오처럼 복합 처방으로도 쓰여요.",
    action: "",
    source: {
      label: "PubMed 9990414",
      url: "https://pubmed.ncbi.nlm.nih.gov/9990414",
    },
  },
  {
    id: "retinoid-bpo",
    pair: [{ group: "RETINOID" }, { id: "benzoyl-peroxide" }],
    verdict: "caution",
    severity: "moderate",
    confidence: "contested",
    mechanismType: "inactivation",
    mechanism: "BPO 산화가 레티노이드 계열을 일부 불활성화할 수 있어요.",
    action: "시간대 분리를 권장해요.",
    source: {
      label: "Science Becomes Her",
      url: "https://sciencebecomesher.com/benzoyl-peroxide-vitamin-c",
    },
  },
];
