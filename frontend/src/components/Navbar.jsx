import "../styles/Dashboard.css";

function Navbar({ user }) {
  return (
    <header className="navbar">
      <div>
        <p className="navbar-label">Welcome</p>
        <h2>{user?.email || "Operator"}</h2>
      </div>
      <div className="navbar-chip">Live status</div>
    </header>
  );
}

export default Navbar;
