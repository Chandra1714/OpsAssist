import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login");

  const handleLogin = (data) => {
    setToken(data.access_token);
    setUser({ email: data.email, role: data.role });
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setScreen("login");
  };

  const renderScreen = () => {
    if (token) {
      return <Dashboard user={user} token={token} onLogout={handleLogout} />;
    }

    if (screen === "register") {
      return <Register onRegistered={() => setScreen("login")} />;
    }

    if (screen === "forgot") {
      return <ForgotPassword onReturn={() => setScreen("login")} />;
    }

    return <Login onLogin={handleLogin} onNavigate={setScreen} />;
  };

  return <div className="app-shell">{renderScreen()}</div>;
}

export default App;
