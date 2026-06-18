import "../styles/Dashboard.css";

function Settings() {
  return (
    <div className="content-panel">
      <h1>Settings</h1>
      <p>Settings will be available here for enterprise customization, alerts, and user preferences.</p>
      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Profile</h2>
          <p>Update user preferences and notification settings.</p>
        </article>
        <article className="dashboard-card">
          <h2>Integrations</h2>
          <p>Configure connectors to Slack, PagerDuty, and monitoring systems.</p>
        </article>
      </div>
    </div>
  );
}

export default Settings;
