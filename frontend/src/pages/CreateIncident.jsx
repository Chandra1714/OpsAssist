import { useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function CreateIncident({ token, onCreated }) {
  const [title, setTitle] = useState("");
  const [clusterName, setClusterName] = useState("");
  const [namespace, setNamespace] = useState("");
  const [applicationName, setApplicationName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [logs, setLogs] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [status, setStatus] = useState("open");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const allowed = ["text/plain", "application/json", "text/x-log", "application/octet-stream"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(log|txt|json)$/i)) {
      setError("Only .log, .txt, and .json files are supported.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogs(reader.result || "");
      setError(null);
    };
    reader.onerror = () => {
      setError("Unable to read file.");
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await axios.post(
        "http://localhost:8080/incidents/",
        {
          title,
          cluster_name: clusterName,
          namespace,
          application_name: applicationName,
          error_message: errorMessage,
          logs,
          description,
          severity,
          status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Incident created successfully.");
      setTitle("");
      setClusterName("");
      setNamespace("");
      setApplicationName("");
      setErrorMessage("");
      setLogs("");
      setDescription("");
      setSeverity("medium");
      setStatus("open");
      onCreated();
    } catch (err) {
      setError("Unable to create incident. Please try again.");
    }
  };

  return (
    <div className="content-panel">
      <h1>Create Incident</h1>
      <form className="incident-form" onSubmit={handleSubmit}>
        <label>
          Incident Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <div className="form-row">
          <label>
            Cluster Name
            <input value={clusterName} onChange={(e) => setClusterName(e.target.value)} />
          </label>
          <label>
            Namespace
            <input value={namespace} onChange={(e) => setNamespace(e.target.value)} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Application Name
            <input value={applicationName} onChange={(e) => setApplicationName(e.target.value)} />
          </label>
          <label>
            Severity
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
        </div>
        <label>
          Error Message
          <textarea value={errorMessage} onChange={(e) => setErrorMessage(e.target.value)} rows={4} />
        </label>
        <label>
          Logs
          <textarea value={logs} onChange={(e) => setLogs(e.target.value)} rows={6} placeholder="Paste logs here or use file upload." />
        </label>
        <label className="upload-label">
          Upload logs
          <input type="file" accept=".log,.txt,.json" onChange={handleFileUpload} />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required />
        </label>
        <div className="form-row">
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>
        </div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}
        <button type="submit">Create Incident</button>
      </form>
    </div>
  );
}

export default CreateIncident;
