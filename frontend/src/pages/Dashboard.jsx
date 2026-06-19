import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CreateIncident from "./CreateIncident";
import IncidentHistory from "./IncidentHistory";
import IncidentDetail from "./IncidentDetail";
import AIAnalysis from "./AIAnalysis";
import RCAReports from "./RCAReports";
import KnowledgeBase from "./KnowledgeBase";
import Assistant from "./Assistant";
import Analytics from "./Analytics";
import Settings from "./Settings";
import "../styles/Dashboard.css";

function Dashboard({ user, token, onLogout }) {
  const [page, setPage] = useState("overview");
  const [message, setMessage] = useState("Loading...");
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [analysisIncident, setAnalysisIncident] = useState(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchProfile = async () => {
    try {
      const response = await axios.get("http://localhost:8080/users/me", {
        headers: authHeaders,
      });
      setMessage(`Welcome back, ${response.data.full_name || response.data.email}!`);
    } catch (error) {
      setMessage("Unable to load your dashboard. Please sign in again.");
    }
  };

  const fetchIncidents = async () => {
    try {
      const response = await axios.get("http://localhost:8080/incidents/", {
        headers: authHeaders,
      });
      setIncidents(response.data);
    } catch (error) {
      console.error("Failed to load incidents", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get("http://localhost:8080/incidents/summary", {
        headers: authHeaders,
      });
      setSummary(response.data);
    } catch (error) {
      console.error("Failed to load incident summary", error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchIncidents();
    fetchSummary();
  }, [token]);

  const handleNavigate = (value) => {
    setPage(value);
    if (value === "history" || value === "analysis") {
      fetchIncidents();
    }
  };

  const handleIncidentCreated = async () => {
    await fetchIncidents();
    setPage("history");
  };

  const handleSelectIncident = (incident) => {
    setSelectedIncident(incident);
    setAnalysisIncident(null);
    setPage("detail");
  };

  const handleAnalyze = async (incident) => {
    setSelectedIncident(incident);
    setPage("analysis");
    setAnalysisIncident(null);
  };

  const renderPage = () => {
    if (page === "create") {
      return <CreateIncident token={token} onCreated={handleIncidentCreated} />;
    }
    if (page === "history") {
      return (
        <IncidentHistory
          token={token}
          incidents={incidents}
          onSelectIncident={handleSelectIncident}
        />
      );
    }
    if (page === "analysis") {
      return (
        <AIAnalysis
          token={token}
          incident={selectedIncident}
          onAnalyze={handleAnalyze}
          analysis={analysisIncident}
          setAnalysis={setAnalysisIncident}
        />
      );
    }
    if (page === "assistant") {
      return <Assistant token={token} />;
    }
    if (page === "rca") {
      return <RCAReports token={token} />;
    }
    if (page === "knowledge") {
      return <KnowledgeBase token={token} />;
    }
    if (page === "analytics") {
      return <Analytics token={token} />;
    }
    if (page === "settings") {
      return <Settings token={token} />;
    }
    if (page === "detail") {
      return <IncidentDetail incident={selectedIncident} onAnalyze={handleAnalyze} />;
    }

    return (
      <>
        <div className="dashboard-hero">
          <div>
            <p className="dashboard-badge">Enterprise Ops</p>
            <h1>Welcome back,</h1>
            <p className="dashboard-intro">{message}</p>
          </div>
          <div className="dashboard-actions">
            <button className="primary-button" onClick={() => setPage("create")}>Create incident</button>
            <button className="secondary-button" onClick={() => setPage("analytics")}>View reports</button>
          </div>
        </div>

        <div className="stats-grid">
          <article className="dashboard-card stat-card">
            <p>Open Incidents</p>
            <h2>{summary?.open_incidents ?? "--"}</h2>
          </article>
          <article className="dashboard-card stat-card">
            <p>Resolved Incidents</p>
            <h2>{summary?.resolved_incidents ?? "--"}</h2>
          </article>
          <article className="dashboard-card stat-card">
            <p>Critical Incidents</p>
            <h2>{summary?.critical_incidents ?? "--"}</h2>
          </article>
          <article className="dashboard-card stat-card">
            <p>Avg Resolution Time</p>
            <h2>{summary?.average_resolution_time_minutes ?? "--"} min</h2>
          </article>
        </div>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <h2>Incident Operations</h2>
            <p>Use the left menu to create incidents, review history, and run AI analysis.</p>
          </article>
          <article className="dashboard-card">
            <h2>Executive Overview</h2>
            <p>Access live metrics, notifications, and operational summaries from one place.</p>
          </article>
        </div>
      </>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activePage={page} onNavigate={handleNavigate} onLogout={onLogout} />
      <main className="dashboard-main">
        <Navbar user={user} />
        <section className="dashboard-content">{renderPage()}</section>
      </main>
    </div>
  );
}

export default Dashboard;
