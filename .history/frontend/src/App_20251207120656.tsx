import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import { useState, useEffect } from "react";
import Otp from "./components/VerifyOtp";
import OwnRepo from "./components/OwnRepo";
import GetPublicRepo from "./components/getPublicRepo";
import Profile from "./components/Profile";
import PublicProfile from "./components/PublicProfile";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function verifyToken() {
      try {
        const res = await fetch("https://version-control-system-mebn.onrender.com/verifyToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (!mounted) return;
        setIsAuthenticated(!!(data && data.status === true));
      } catch (err) {
        if (!mounted) return;
        setIsAuthenticated(false);
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    }
    verifyToken();
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] flex flex-col items-center justify-center text-gray-300 font-mono">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 border-4 border-t-[#ff006e] border-b-[#00d9ff] border-l-[#ffbe0b] border-r-[#ff006e] rounded-full animate-spin"></div>
        </div>
        <p className="text-sm bg-gradient-to-r from-[#ff006e] via-[#00d9ff] to-[#ffbe0b] bg-clip-text text-transparent tracking-wider animate-pulse font-semibold">
          Checking session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-200 font-mono transition-colors duration-300">
      <Routes>
        <Route
          path="/"
          element={<LandingPage />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
              />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />
        <Route path="/verifyOtp" element={<Otp />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route
            path="/dashboard"
            element={<Dashboard setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/repo/:repoName"
            element={<OwnRepo setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/repo/public/:repoName"
            element={<GetPublicRepo setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route 
            path="/profile"
            element={<Profile setIsAuthenticated={setIsAuthenticated}/>}
          />
          <Route 
            path="/publicProfile/:username"
            element={<PublicProfile  setIsAuthenticated={setIsAuthenticated}/>}
          />
        </Route>

        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center text-gray-400 text-lg font-semibold">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent mb-4">404</div>
                <p>Page Not Found</p>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
