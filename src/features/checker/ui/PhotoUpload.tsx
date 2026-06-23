"use client";

import { useRef } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { useOcr } from "./usePhotoOcr";

type Props = {
  index: number;
  onText: (text: string) => void;
};

function OcrDoneNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="mt-1.5 flex items-start gap-1.5 rounded-[var(--radius-control)] px-2.5 py-1.5 text-xs"
      style={{
        background: "var(--color-tip-bg)",
        border: "1px solid var(--color-tip-border)",
        color: "var(--color-tip-text)",
      }}
    >
      <span className="flex-1">사진에서 읽었어요 — 맞는지 확인해 주세요</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="알림 닫기"
        className="flex-shrink-0 opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] transition-opacity duration-150"
      >
        <X size={12} aria-hidden="true" />
      </button>
    </div>
  );
}

const PHOTO_BUTTON_CLASS =
  "flex items-center gap-1 rounded-[var(--radius-control)] px-2 py-1 text-xs font-medium transition-all duration-150 hover:bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";
const PHOTO_BUTTON_STYLE = {
  border: "1px solid var(--color-border)",
  color: "var(--color-ink-sub)",
} as const;

function PhotoTriggers({
  isReading,
  onCamera,
  onGallery,
}: {
  isReading: boolean;
  onCamera: () => void;
  onGallery: () => void;
}) {
  if (isReading) {
    return (
      <span
        className={PHOTO_BUTTON_CLASS}
        style={PHOTO_BUTTON_STYLE}
        aria-live="polite"
      >
        <Loader2 size={13} className="animate-spin" aria-hidden="true" />
        인식 중...
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onCamera}
        className={PHOTO_BUTTON_CLASS}
        style={PHOTO_BUTTON_STYLE}
      >
        <Camera size={13} aria-hidden="true" />
        촬영
      </button>
      <button
        type="button"
        onClick={onGallery}
        className={PHOTO_BUTTON_CLASS}
        style={PHOTO_BUTTON_STYLE}
      >
        <ImagePlus size={13} aria-hidden="true" />
        사진
      </button>
    </div>
  );
}

export function PhotoUpload({ index, onText }: Props) {
  const { state, processFile, dismiss } = useOcr(onText);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isReading = state.status === "reading";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) processFile(f);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        ref={galleryInputRef}
        id={`photo-upload-${index}`}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={`제품 ${index + 1} 사진으로 전성분 추가`}
        onChange={handleFileChange}
        aria-busy={isReading}
      />
      {/* 모바일에서 후면 카메라를 바로 띄운다 (데스크톱은 capture 무시 → 파일 선택) */}
      <input
        ref={cameraInputRef}
        id={`photo-capture-${index}`}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        aria-label={`제품 ${index + 1} 카메라로 전성분 촬영`}
        onChange={handleFileChange}
        aria-busy={isReading}
      />
      <PhotoTriggers
        isReading={isReading}
        onCamera={() => cameraInputRef.current?.click()}
        onGallery={() => galleryInputRef.current?.click()}
      />
      {state.status === "done" && <OcrDoneNotice onDismiss={dismiss} />}
      {state.status === "error" && (
        <p
          role="alert"
          className="mt-1.5 text-xs"
          style={{ color: "var(--color-warn-high)" }}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
