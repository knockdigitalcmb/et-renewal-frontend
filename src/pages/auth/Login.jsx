import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://103.235.105.121:3000/api/v1";

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin123");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store user data
        localStorage.setItem(
          "user",
          JSON.stringify(result.data.user)
        );

        // Store tokens
        localStorage.setItem(
          "accessToken",
          result.data.accessToken
        );

        localStorage.setItem(
          "refreshToken",
          result.data.refreshToken
        );

        navigate("/dashboard");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#4361ee] mb-2">
            GPS Admin
          </h1>
          <p className="text-gray-500 text-sm">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#4361ee]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#4361ee]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4361ee] hover:bg-[#3b55d1] text-white py-2.5 rounded font-medium transition-colors mt-4 disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;