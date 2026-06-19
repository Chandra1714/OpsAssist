import { useState } from "react";
import axios from "axios";
import "../styles/Login.css";

function Register({ onRegistered }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("engineer");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await axios.post("http://localhost:8080/register", {
        email,
        full_name: fullName,
        password,
        role,
      });
      setSuccess("Registration successful. You can now sign in.");
      setEmail("");
      setFullName("");
      setPassword("");
      setRole("engineer");
      onRegistered();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.detail || err.message || "Unable to register. Please check your details.";
      setError(message);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p>Register for OpsAssist AI access.</p>

        <label htmlFor="fullname">Full name</label>
        <input
          id="fullname"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Doe"
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
        />

        <label htmlFor="role">Role</label>
        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="engineer">Engineer</option>
          <option value="admin">Admin</option>
        </select>

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
