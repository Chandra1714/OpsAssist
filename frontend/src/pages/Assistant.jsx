import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function Assistant({ token }) {
  const [messages, setMessages] = useState([
    { role: "system", content: "You are OpsAssist AI, an incident response assistant." },
  ]);
  const [input, setInput] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await axios.get("http://localhost:8080/incidents/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIncidents(response.data);
      } catch (err) {
        setError("Unable to load incidents for the assistant.");
      }
    };
    fetchIncidents();
  }, [token]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    setError(null);
    const nextMessages = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);
    setInput("");

    try {
      const response = await axios.post(
        "http://localhost:8080/assistant/chat",
        {
          messages: nextMessages,
          incident_id: selectedIncident || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages([...nextMessages, ...response.data.messages]);
    } catch (err) {
      setError("Unable to reach the assistant. Please try again.");
    }
  };

  return (
    <div className="content-panel">
      <div className="analysis-header">
        <div>
          <h1>AI Assistant</h1>
          <p>Ask OpsAssist for troubleshooting guidance, RCA context, or incident remediation steps.</p>
        </div>
      </div>

      <label>
        Reference incident
        <select value={selectedIncident} onChange={(e) => setSelectedIncident(e.target.value)}>
          <option value="">None</option>
          {incidents.map((incident) => (
            <option key={incident.id} value={incident.id}>
              {incident.incident_uid} - {incident.title}
            </option>
          ))}
        </select>
      </label>

      <div className="analysis-card" style={{ minHeight: "320px" }}>
        {messages.map((message, index) => (
          <div key={index} className={`analysis-block ${message.role}`}>
            <strong>{message.role}</strong>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      {error && <div className="message error">{error}</div>}

      <form className="incident-form" onSubmit={sendMessage}>
        <label>
          Your question
          <textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the incident, root cause, remediation, or next steps."
          />
        </label>
        <button type="submit">Send message</button>
      </form>
    </div>
  );
}

export default Assistant;
