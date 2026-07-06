import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { usePost } from "../hooks/usePost";

import { Eye, EyeOff } from "lucide-react";
import logo from "../images/spaylogo.png";
import LoginIllustration from "../images/hero.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const [, setCookie] = useCookies(["token"]);

  const { loading, error, execute: login } = usePost("/login");

  useEffect(() => {
    setErrorMsg(error?.message || "");
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your credentials");
      return;
    }

    try {
      const res = await login({
        email,
        password,
      });

      setCookie("token", res.token, {
        path: "/",
      });

      setCookie("role", res.user.role_id, {
        path: "/",
      });

      setCookie("user", res.user, {
        path: "/",
      });

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white">
      {/* LEFT PANEL */}

      <div className="w-full lg:w-[42%] flex items-center justify-center bg-white">
        <div className="w-full max-w-[360px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-10 rounded-lg bg-[#E8F0FE] flex items-center justify-center">
              <img
                src={logo}
                alt="Spay Fintech"
                className="h-10 w-auto object-contain"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Spay Fintech</h2>

              <p className="text-xs text-slate-400">Merchant Dashboard</p>
            </div>
          </div>

          {/* Heading */}

          <h1 className="text-[36px] font-bold text-slate-900 leading-none">
            Welcome back
          </h1>

          <p className="text-slate-500 mt-3 mb-8 text-sm">
            Please enter your details
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}

            <div>
              <label className="text-sm text-slate-700 block mb-2">
                Email address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 border border-slate-300 rounded-md px-4 text-sm outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Password */}

            <div>
              <label className="text-sm text-slate-700 block mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 border border-slate-300 rounded-md px-4 pr-11 text-sm outline-none focus:border-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={2} />
                  ) : (
                    <Eye size={18} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-500">
                <input type="checkbox" className="accent-blue-600" />
                Remember me
              </label>

              <a href="#" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
            {/* Sign In Button */}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 rounded-md font-medium text-white transition cursor-pointer
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* Divider */}

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-200"></div>

              <span className="text-xs text-slate-400">OR</span>

              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Register */}

            <p className="text-center text-sm text-slate-500 pt-1">
              Don't have an account?{" "}
              <a
                href="/register"
                className="font-semibold text-blue-600 hover:underline"
              >
                Register
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT PANEL */}

      <div className="hidden lg:flex lg:w-[58%] bg-[#9FC5FF] items-center justify-center relative">
        {/* Decorative Background */}

        <div className="absolute inset-0 bg-gradient-to-br from-[#C3D8FC] to-[#C3D8FC]" />

        {/* Illustration */}

        <img
          src={LoginIllustration}
          alt="Login Illustration"
          className="relative z-10 w-[68%] max-h-[120vh] object-contain"
        />
      </div>
    </div>
  );
};

export default LoginPage;
