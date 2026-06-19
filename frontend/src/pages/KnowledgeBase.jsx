import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function KnowledgeBase({ token }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [message, setMessage] = useState(null);

  const fetchItems = async (searchQuery = "") => {
    try {
      const response = await axios.get("http://localhost:8080/knowledge/", {
        headers: { Authorization: `Bearer ${token}` },
        params: { query: searchQuery },
      });
      setItems(response.data);
    } catch (error) {
      setMessage("Unable to load knowledge base.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setMessage(null);
    await fetchItems(query);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setMessage(null);

    try {
      await axios.post(
        "http://localhost:8080/knowledge/",
        { title, content, tags },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setContent("");
      setTags("");
      setMessage("Knowledge item added.");
      fetchItems();
    } catch (error) {
      setMessage("Unable to save knowledge item.");
    }
  };

  return (
    <div className="content-panel">
      <div className="analysis-header">
        <div>
          <h1>Knowledge Base</h1>
          <p>Capture operational playbooks, troubleshooting notes, and post-incident learnings.</p>
        </div>
      </div>
      <form className="incident-form" onSubmit={handleSearch}>
        <label>
          Search knowledge
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, content, or tags"
          />
        </label>
        <button type="submit" className="secondary-button">
          Search
        </button>
      </form>

      {message && <div className="message success">{message}</div>}

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Add new item</h2>
          <form className="incident-form" onSubmit={handleCreate}>
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              Tags
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="kubernetes, db, network" />
            </label>
            <label>
              Content
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} required />
            </label>
            <button type="submit">Save item</button>
          </form>
        </article>

        <article className="dashboard-card">
          <h2>Recent knowledge items</h2>
          {items.length === 0 ? (
            <p>No items found.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="analysis-card">
                <h3>{item.title}</h3>
                <p>{item.tags || "No tags"}</p>
                <p>{item.content}</p>
              </div>
            ))
          )}
        </article>
      </div>
    </div>
  );
}

export default KnowledgeBase;
