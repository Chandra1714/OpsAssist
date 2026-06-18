import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function Analytics({ token }) {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("http://localhost:8000/analytics/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(response.data);
      } catch (err) {
        setError("Unable to load analytics. Please try again later.");
      }
    };
    fetchAnalytics();
  }, [token]);

  return (
    <div className="content-panel">
      <div className="analysis-header">
        <div>
          <h1>Analytics</h1>
          <p>Track incident trends, severity distribution, and recent operational events.</p>
        </div>
      </div>

      {error && <div className="message error">{error}</div>}

      {analytics ? (
        <div className="dashboard-grid">
          <article className="dashboard-card">
            <h2>Incident Status</h2>
            <ul>
              {Object.entries(analytics.status_counts).map(([status, count]) => (
                <li key={status}>
                  <strong>{status}</strong>: {count}
                </li>
              ))}
            </ul>
          </article>

          <article className="dashboard-card">
            <h2>Severity Distribution</h2>
            <ul>
              {Object.entries(analytics.severity_counts).map(([severity, count]) => (
                <li key={severity}>
                  <strong>{severity}</strong>: {count}
                </li>
              ))}
            </ul>
          </article>

          <article className="dashboard-card" style={{ gridColumn: "span 2" }}>
            <h2>Recent Incidents</h2>
            {analytics.recent_incidents.length === 0 ? (
              <p>No recent incidents recorded.</p>
            ) : (
              analytics.recent_incidents.map((incident) => (
                <div key={incident.id} className="analysis-card">
                  <p>{incident.incident_uid} - {incident.title}</p>
                  <p>{incident.status} / {incident.severity}</p>
                </div>
              ))
            )}
          </article>
        </div>
      ) : (
        <div className="empty-state">Loading analytics...</div>
      )}
    </div>
  );
}

export default Analytics;
