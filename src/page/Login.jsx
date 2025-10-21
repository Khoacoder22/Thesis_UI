import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login:", { email, password });
    // TODO: gọi API login sau
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-600 tracking-wide">
            QR Smart Queue
          </h1>
          <p className="text-black-500 mt-1">Login for countinue</p>
        </div>

        {/* Form */}
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
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-xl hover:bg-indigo-700 transition duration-300"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-5 text-sm text-gray-500">
          <span>You dont have account yet? Please contact to your admin</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
