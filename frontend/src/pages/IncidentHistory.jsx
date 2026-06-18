import { useMemo, useState } from "react";
import "../styles/Dashboard.css";

function IncidentHistory({ incidents, onSelectIncident }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const filtered = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesQuery = search.length === 0 ||
        [
          incident.title,
          incident.cluster_name,
          incident.namespace,
          incident.application_name,
          incident.description,
          incident.error_message,
          incident.incident_uid,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = !statusFilter || incident.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesSeverity = !severityFilter || incident.severity.toLowerCase() === severityFilter.toLowerCase();
      return matchesQuery && matchesStatus && matchesSeverity;
    });
  }, [incidents, search, statusFilter, severityFilter]);

  return (
    <div className="content-panel">
      <div className="history-header">
        <div>
          <h1>Incident History</h1>
          <p>Search and filter incidents by status, severity, or keywords.</p>
        </div>
        <div className="history-filters">
          <input
            type="text"
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="">All severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
      <div className="history-list">
        {filtered.length === 0 ? (
          <div className="empty-state">No incidents match your filters.</div>
        ) : (
          filtered.map((incident) => (
            <article
              key={incident.id}
              className="history-item"
              onClick={() => onSelectIncident(incident)}
            >
              <div>
                <h2>{incident.title}</h2>
                <p>{incident.description}</p>
                <p className="history-subtitle">{incident.incident_uid} • {incident.application_name || "Unknown app"}</p>
              </div>
              <div className="history-meta">
                <span className="badge">{incident.status}</span>
                <span>{incident.severity}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default IncidentHistory;
