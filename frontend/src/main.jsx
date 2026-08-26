import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage.jsx";
import { UnlockPage } from "./pages/UnlockPage.jsx";
import { GeneratingPage } from "./pages/GeneratingPage.jsx";
import { ResultPage } from "./pages/ResultPage.jsx";
import "./styles.css";

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/unlock/:intentId" element={<UnlockPage />} />
        <Route path="/generating/:jobId" element={<GeneratingPage />} />
        <Route path="/result/:jobId" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
