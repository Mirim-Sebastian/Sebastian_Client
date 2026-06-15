import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import App from "./App.tsx";
import OceanScreen from "./components/OceanScreen.tsx";

function MobileBlock({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (isMobile) {
    return (
      <div style={{
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
      }}>
        <span style={{ fontSize: "3rem" }}>🖥️</span>
        <p style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0 }}>
          PC에서 접속해 주세요
        </p>
        <p style={{ fontSize: "0.9rem", color: "rgba(230,240,255,0.55)", margin: 0 }}>
          이 서비스는 PC 환경에서만 이용 가능합니다.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MobileBlock>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/ocean" element={<OceanScreen />} />
        </Routes>
      </BrowserRouter>
    </MobileBlock>
  </StrictMode>
);
