import type { ConflictRule } from "./schema";

// Round 4: commonly-feared-but-actually-fine safe cards
export const RULES_MYTH_SAFE: ConflictRule[] = [
  {
    id: "salicylic-niacinamide",
    pair: [{ id: "salicylic-acid" }, { id: "niacinamide" }],
    verdict: "safe",
    severity: null,
    confidence: "myth",
    mechanismType: "ph",
    mechanism:
      "pH가 서로 달라 효과가 사라진다는 건 통념이에요. 실제로 살리실산은 pH 3~4, 나이아신아마이드는 pH 5~7 범위에서 각각 잘 작동하고, 한 루틴에서 레이어링해도 둘 다 흡수돼요.",
    action: "",
    source: {
      label: "Lab Muffin",
      url: "https://labmuffin.com/should-you-use-niacinamide-with-aha-bha",
    },
    myth: "살리실산(BHA)이랑 나이아신아마이드를 같이 쓰면 pH가 달라서 효과가 없어진다던데요?",
  },
  {
    id: "lascorbic-hyaluronic",
    pair: [{ id: "l-ascorbic-acid" }, { id: "hyaluronic-acid" }],
    verdict: "safe",
    severity: null,
    confidence: "established",
    mechanismType: "synergy",
    mechanism:
      "순수 비타민C는 히알루론산과 완벽하게 어울려요. 히알루론산은 수분을 잡아줘 비타민C 세럼 특유의 건조감을 완화하고, 비타민C는 콜라겐 합성을 도와요.",
    action: "",
    source: {
      label: "Paula's Choice",
      url: "https://www.paulaschoice.com/expert-advice/skincare-advice/vitamin-c/vitamin-c-and-hyaluronic-acid",
    },
  },
  {
    id: "mandelic-niacinamide",
    pair: [{ id: "mandelic-acid" }, { id: "niacinamide" }],
    verdict: "safe",
    severity: null,
    confidence: "myth",
    mechanismType: "ph",
    mechanism:
      "나이아신아마이드가 맨덜릭산의 pH를 올려 효과가 없어진다는 건 오해예요. 맨덜릭산은 AHA 중 분자량이 가장 커 자극이 적고, 나이아신아마이드와 함께 쓰면 피부 안정에 도움이 돼요.",
    action: "",
    source: {
      label: "Lab Muffin",
      url: "https://labmuffin.com/should-you-use-niacinamide-with-aha-bha",
    },
    myth: "맨덜릭산이랑 나이아신아마이드를 같이 쓰면 산도가 중화돼서 효과가 없어진다던데요?",
  },
];
