import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Projects from "./pages/Projects";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />

        <Route path="/projects" element={<Projects />} />

        <Route
          path="*"
          element={<Navigate to="/projects" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;