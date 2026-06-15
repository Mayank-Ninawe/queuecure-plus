import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ReceptionistPage from "./pages/ReceptionistPage";
import PatientDisplayPage from "./pages/PatientDisplayPage";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/reception" replace />} />
        <Route path="/reception" element={<ReceptionistPage />} />
        <Route path="/waiting-room" element={<PatientDisplayPage />} />
        <Route path="*" element={<Navigate to="/reception" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}