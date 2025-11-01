import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDeult();
    setError("");
    setLoading(true);

    try {
      //lưu trên cookie
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.setItem("token", data.data.token); 

        toast.success("Login Successfull!"); 

        navigate("/dashboard", { replace: true });
      } else {
        toast.error(data.message || "Login failed!"); 
      }
    } catch (err) {
      toast.error("Fail to connect server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-600 tracking-wide">
            QR Smart Queue
          </h1>
          <p className="text-black-500 mt-1">Login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ... phần input giữ nguyên ... */}
            <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPasswo(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-500 hover:text-indigo-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-xl hover:bg-indigo-700 transition duration-300"
          >
            {loading ? "Login...." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
