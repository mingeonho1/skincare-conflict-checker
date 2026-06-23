import type { ConflictRule } from "./schema";

export const RULES_RAW: ConflictRule[] = [
  {
    id: "retinol-aha-glycolic",
    pair: ["retinol", "aha-glycolic"],
    verdict: "warn",
    severity: "high",
    mechanism:
      "동시 사용 시 피부 장벽 손상·자극·광민감성이 증가해요. 두 성분 모두 세포 회전율을 높여 자극이 배가될 수 있어요.",
    action:
      "같은 시간대 동시 사용을 피하고, 격일 사용 또는 아침/저녁으로 분리하세요.",
  },
  {
    id: "retinol-aha-lactic",
    pair: ["retinol", "aha-lactic"],
    verdict: "warn",
    severity: "high",
    mechanism:
      "동시 사용 시 피부 장벽 손상·자극·광민감성이 증가해요. 두 성분 모두 세포 회전율을 높여 자극이 배가될 수 있어요.",
    action:
      "같은 시간대 동시 사용을 피하고, 격일 사용 또는 아침/저녁으로 분리하세요.",
  },
  {
    id: "retinol-bha",
    pair: ["retinol", "bha-salicylic"],
    verdict: "warn",
    severity: "high",
    mechanism:
      "동시 사용 시 피부 장벽 손상·자극·광민감성이 증가해요. BHA와 레티놀의 병용은 필링 효과가 겹쳐 과도한 자극이 올 수 있어요.",
    action:
      "같은 시간대 동시 사용을 피하고, 격일 사용 또는 아침/저녁으로 분리하세요.",
  },
  {
    id: "vitaminc-bpo",
    pair: ["vitamin-c", "bpo"],
    verdict: "warn",
    severity: "high",
    mechanism:
      "벤조일퍼옥사이드(BP)의 산화 작용이 비타민C를 분해해 효과가 저하되고, 동시에 피부 자극도 높아져요.",
    action:
      "비타민C는 아침에, 벤조일퍼옥사이드는 저녁에 사용하거나 격일로 나눠 쓰세요.",
  },
  {
    id: "retinol-bpo",
    pair: ["retinol", "bpo"],
    verdict: "warn",
    severity: "moderate",
    mechanism:
      "동시 사용 시 벤조일퍼옥사이드가 레티놀을 불활성화할 수 있다는 보고가 있어요. 보수적으로 분리를 권장해요.",
    action: "시간대 분리(레티놀 저녁, BP 아침 또는 격일)를 권장해요.",
  },
  {
    id: "niacinamide-vitaminc",
    pair: ["niacinamide", "vitamin-c"],
    verdict: "safe",
    severity: null,
    mechanism:
      '함께 써도 안전한 조합이에요. 과거 "니코틴산 생성 위험"설은 실제 사용 온도와 농도에서는 발생하지 않는 것으로 반박됐어요. 오히려 시너지 효과를 기대할 수 있어요.',
    action: "",
  },
  {
    id: "niacinamide-retinol",
    pair: ["niacinamide", "retinol"],
    verdict: "safe",
    severity: null,
    mechanism:
      "안전하고 시너지 효과도 있는 조합이에요. 나이아신아마이드가 피부 장벽을 강화해 레티놀의 자극을 완화해줘요.",
    action: "나이아신아마이드 먼저 바르고, 레티놀을 나중에 바르면 더 좋아요.",
  },
  {
    id: "retinol-vitaminc",
    pair: ["retinol", "vitamin-c"],
    verdict: "safe",
    severity: null,
    mechanism:
      '"pH 충돌" 위험설은 반박됐어요. 비타민C는 아침, 레티놀은 저녁으로 시간대를 나누면 충분히 함께 쓸 수 있어요.',
    action: "비타민C는 아침 루틴에, 레티놀은 저녁 루틴에 사용하세요.",
  },
];
