import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NonePage = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center text-xl font-bold">
      ❌ Unauthorized Access — Redirecting to Login...
    </div>
  );
};

const RedirectGuard = ({ children, requiredRole = null }) => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [cookie] = useCookies(["token"]);
  const [showNone, setShowNone] = useState(false);

  useEffect(() => {
    if (loading) return;

    const token = cookie.token;

    if (!token || !user) {
      logout();
      setShowNone(true);

      const timer = setTimeout(() => navigate("/"), 1500);
      return () => clearTimeout(timer);
    }

    if (
      requiredRole !== null &&
      Number(user?.role?.id) !== Number(requiredRole)
    ) {
      setShowNone(true);

      const timer = setTimeout(() => navigate("/"), 1500);
      return () => clearTimeout(timer);
    }

    setShowNone(false);
  }, [cookie.token, user, loading, requiredRole, navigate]);

  if (loading) {
    return null;
  }

  // Unauthorized → show message
  if (showNone) return <NonePage />;

  // Authorized → show children
  return children;
};

export default RedirectGuard;
