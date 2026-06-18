import "../styles/Dashboard.css";

function IncidentDetail({ incident, onAnalyze }) {
  if (!incident) {
    return (
      <div className="content-panel">
        <h1>Incident Detail</h1>
        <p>Select an incident from history to view details.</p>
      </div>
    );
  }

  return (
    <div className="content-panel">
      <div className="detail-header">
        <div>
          <p className="dashboard-badge">Incident Detail</p>
          <h1>{incident.title}</h1>
          <p className="dashboard-intro">UID: {incident.incident_uid}</p>
        </div>
        <button className="primary-button" onClick={() => onAnalyze(incident)}>
          Analyze with AI
        </button>
      </div>

      <div className="detail-grid">
        <article className="dashboard-card">
          <h2>Status</h2>
          <p>{incident.status}</p>
        </article>
        <article className="dashboard-card">
          <h2>Severity</h2>
          <p>{incident.severity}</p>
        </article>
        <article className="dashboard-card">
          <h2>Cluster</h2>
          <p>{incident.cluster_name || "—"}</p>
        </article>
        <article className="dashboard-card">
          <h2>Namespace</h2>
          <p>{incident.namespace || "—"}</p>
        </article>
      </div>

      <div className="detail-section">
        <h2>Application</h2>
        <p>{incident.application_name || "Not specified"}</p>
      </div>

      <div className="detail-section">
        <h2>Error Message</h2>
        <pre className="detail-code">{incident.error_message || "No error message provided."}</pre>
      </div>

      <div className="detail-section">
        <h2>Logs</h2>
        <pre className="detail-code">{incident.logs || "No logs uploaded."}</pre>
      </div>

      <div className="detail-section">
        <h2>Description</h2>
        <p>{incident.description}</p>
      </div>
    </div>
  );
}

export default IncidentDetail;
