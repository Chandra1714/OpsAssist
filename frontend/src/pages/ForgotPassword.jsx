import { useState } from "react";
import axios from "axios";
import "../styles/Login.css";

function ForgotPassword({ onReturn }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await axios.post("http://localhost:8080/forgot-password", { email });
      setMessage("If your email exists, reset instructions have been sent.");
    } catch (err) {
      setError("Unable to send reset instructions. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Forgot password</h1>
        <p>Enter your account email to receive reset instructions.</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
        />

        {error && <div className="login-error">{error}</div>}
        {message && <div className="login-success">{message}</div>}

        <button type="submit">Send reset link</button>
        <button type="button" className="link-button" onClick={onReturn}>
          Back to login
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
