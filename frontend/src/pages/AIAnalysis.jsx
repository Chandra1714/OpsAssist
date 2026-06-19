import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function AIAnalysis({ token, incident, onAnalyze, analysis, setAnalysis }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!incident) return;
    const loadAnalysis = async () => {
      setError(null);
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/incidents/${incident.id}/analysis`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAnalysis(response.data);
      } catch (err) {
        setError("Unable to analyze incident. Please select an incident and try again.");
      } finally {
        setLoading(false);
      }
    };
    loadAnalysis();
  }, [incident, token, setAnalysis]);

  if (!incident) {
    return (
      <div className="content-panel">
        <h1>AI Analysis</h1>
        <p>Select an incident from the history page to run an analysis.</p>
      </div>
    );
  }

  return (
    <div className="content-panel">
      <div className="analysis-header">
        <h1>AI Analysis</h1>
        <button className="secondary-button" onClick={() => onAnalyze(incident)}>
          Refresh Analysis
        </button>
      </div>
      <div className="analysis-card">
        <h2>{incident.title}</h2>
        <p>{incident.description}</p>
        <div className="analysis-meta">
          <span>{incident.severity} severity</span>
          <span>{incident.status} status</span>
        </div>
      </div>
      {loading ? (
        <div className="empty-state">Analyzing incident...</div>
      ) : error ? (
        <div className="message error">{error}</div>
      ) : analysis ? (
        <div className="analysis-result">
          <div className="analysis-block">
            <h3>Summary</h3>
            <p>{analysis.summary}</p>
          </div>
          {analysis.root_cause && (
            <div className="analysis-block">
              <h3>Root Cause</h3>
              <p>{analysis.root_cause}</p>
            </div>
          )}
          <div className="analysis-block">
            <h3>Recommendations</h3>
            <ul>
              {analysis.recommendations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          {analysis.suggested_commands && analysis.suggested_commands.length > 0 && (
            <div className="analysis-block">
              <h3>Suggested Commands</h3>
              <ul>
                {analysis.suggested_commands.map((cmd, index) => (
                  <li key={index}>
                    <code>{cmd}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">No analysis available yet.</div>
      )}
    </div>
  );
}

export default AIAnalysis;
