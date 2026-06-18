import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function RCAReports({ token }) {
  const [incidents, setIncidents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [format, setFormat] = useState("pdf");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await axios.get("http://localhost:8000/incidents/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIncidents(response.data);
      } catch (error) {
        setMessage("Unable to load incidents for RCA generation.");
      }
    };
    fetchIncidents();
  }, [token]);

  const handleDownload = async (event) => {
    event.preventDefault();
    if (!selectedId) {
      setMessage("Select an incident to generate an RCA report.");
      return;
    }
    setMessage(null);

    try {
      const response = await axios.post(
        `http://localhost:8000/incidents/${selectedId}/rca`,
        { format, resolution_notes: notes },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `RCA-${selectedId}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage("RCA report download started.");
    } catch (error) {
      setMessage("Unable to generate RCA report. Please try again.");
    }
  };

  return (
    <div className="content-panel">
      <h1>RCA Reports</h1>
      <form className="incident-form" onSubmit={handleDownload}>
        <label>
          Incident
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">Select incident</option>
            {incidents.map((incident) => (
              <option key={incident.id} value={incident.id}>
                {incident.incident_uid} - {incident.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Format
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
          </select>
        </label>
        <label>
          Resolution notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Summarize the fix and follow-up actions."
          />
        </label>
        <button type="submit" className="primary-button">
          Generate RCA
        </button>
        {message && <div className="message success">{message}</div>}
      </form>
    </div>
  );
}

export default RCAReports;
