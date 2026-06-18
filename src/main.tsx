import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import App from "./App.tsx";
import { MobileBlock } from "./components/MobileBlock.tsx";
import OceanScreen from "./components/OceanScreen.tsx";

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
