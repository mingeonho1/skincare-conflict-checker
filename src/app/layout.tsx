import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "같이써도돼? — 스킨케어 성분 충돌 체커",
  description:
    "레티놀·비타민C·AHA/BHA를 함께 써도 될까요? 전성분을 붙여넣으면 30초 만에 충돌 여부와 아침·저녁 사용 순서를 알려드려요.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
