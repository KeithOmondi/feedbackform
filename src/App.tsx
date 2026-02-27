import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import WelcomePage from "./pages/WelcomePage"; // Import your new page
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import UserManualPage from "./pages/UserManualPage";

function App() {
  return (
    <Routes>
      {/* Public Route */}
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
        path="/welcome"
        element={
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        }
      />

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