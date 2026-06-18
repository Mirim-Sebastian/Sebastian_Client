import { type ReactNode, useEffect, useState } from "react";

type MobileBlockProps = {
  children: ReactNode;
};

export function MobileBlock({ children }: MobileBlockProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100dvh",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          background: "#041126",
          color: "#e6f0ff",
          fontFamily: "Pretendard, sans-serif",
        }}
      >
        <span style={{ fontSize: "3rem" }}>🖥️</span>
        <p style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0 }}>
          PC에서 접속해 주세요
        </p>
        <p
          style={{
            fontSize: "0.9rem",
            color: "rgba(230,240,255,0.55)",
            margin: 0,
          }}
        >
          이 서비스는 PC 환경에서만 이용 가능합니다.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
