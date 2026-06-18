import "../styles/Dashboard.css";

function Sidebar({ activePage, onNavigate, onLogout }) {
  const menu = [
    { key: "overview", label: "Dashboard" },
    { key: "create", label: "Create Incident" },
    { key: "history", label: "Incident History" },
    { key: "analysis", label: "AI Analysis" },
    { key: "assistant", label: "AI Assistant" },
    { key: "rca", label: "RCA Reports" },
    { key: "knowledge", label: "Knowledge Base" },
    { key: "analytics", label: "Analytics" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">OpsAssist AI</div>
      <nav className="sidebar-nav">
        {menu.map((item) => (
          <button
            key={item.key}
            className={`sidebar-link ${activePage === item.key ? "active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button className="sidebar-logout" onClick={onLogout}>
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
