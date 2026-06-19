import { useState } from "react";
import axios from "axios";
import "../styles/Login.css";

function Login({ onLogin, onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await axios.post("http://localhost:8080/login", {
        email,
        password,
        remember_me: rememberMe,
      });
      onLogin({ access_token: response.data.access_token, email, role: response.data.role });
    } catch (err) {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>OpsAssist AI</h1>
        <p>Sign in to access your operations dashboard.</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <div className="login-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <button type="button" className="link-button" onClick={() => onNavigate("forgot")}>Forgot password?</button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <button type="submit">Sign In</button>

        <div className="login-footer">
          <span>Don't have an account?</span>
          <button type="button" className="link-button" onClick={() => onNavigate("register")}>Register</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
