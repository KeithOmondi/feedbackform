import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import UserManualPage from "./pages/UserManualPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Admin side */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* User side */}
      <Route
        path="/manuals"
        element={
          <ProtectedRoute>
            <UserManualPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
