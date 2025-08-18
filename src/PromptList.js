import React, { useEffect, useState } from 'react';
import PromptDetail from './PromptDetail';

function PromptList({ prompts: propPrompts }) {
  const [prompts, setPrompts] = useState(propPrompts || []);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [editPrompt, setEditPrompt] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState({ tag: '', author: '', date: '' });

  useEffect(() => {
    if (!propPrompts) {
      fetch('/published_prompts.json')
        .then(res => res.json())
        .then(data => setPrompts(data));
    }
  }, [propPrompts]);

  // --- Authentication ---
  function handleLogin(e) {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    // Simple demo: accept any non-empty username/password
    if (username && password) {
      setUser({ username });
      setShowAuth(false);
    }
  }
  function handleLogout() {
    setUser(null);
  }

  // --- Prompt Editing ---
  function startEdit(prompt) {
    setEditPrompt(prompt);
    setEditData({ ...prompt });
  }
  function handleEditChange(e) {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  }
  function saveEdit() {
    setPrompts(prompts.map(p => (p.prompt_id === editPrompt.prompt_id ? { ...editData } : p)));
    setEditPrompt(null);
  }

  // --- Advanced Filtering ---
  const filteredPrompts = prompts.filter(p => {
    let match = true;
    if (search && !(
      p.prompt_text.toLowerCase().includes(search.toLowerCase()) ||
      (p.security_relevance && p.security_relevance.toLowerCase().includes(search.toLowerCase())) ||
      (p.programming_language && p.programming_language.toLowerCase().includes(search.toLowerCase()))
    )) match = false;
    if (filter.tag && !(p.keywords && p.keywords.includes(filter.tag))) match = false;
    if (filter.author && !(p.submission_details?.submitted_by === filter.author)) match = false;
    if (filter.date && !(p.submission_details?.submission_date?.slice(0, 10) === filter.date)) match = false;
    return match;
  });

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (!sortBy) return 0;
    if (sortBy === 'relevance') {
      return (b.security_relevance || '').localeCompare(a.security_relevance || '');
    }
    if (sortBy === 'language') {
      return (a.programming_language || '').localeCompare(b.programming_language || '');
    }
    if (sortBy === 'date') {
      const dateA = a.submission_details?.submission_date || '';
      const dateB = b.submission_details?.submission_date || '';
      return dateB.localeCompare(dateA);
    }
    return 0;
  });

  return (
    <div>
      <h2>Published Security Prompts</h2>
      {!user ? (
        <button onClick={() => setShowAuth(true)}>Login to Edit</button>
      ) : (
        <span>Welcome, {user.username}! <button onClick={handleLogout}>Logout</button></span>
      )}
      {showAuth && (
        <form onSubmit={handleLogin} style={{ margin: '1em 0' }}>
          <input name="username" placeholder="Username" required />
          <input name="password" type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      )}
      <input
        type="text"
        placeholder="Search prompts..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '1em', padding: '0.5em', width: '100%' }}
      />
      <div style={{ marginBottom: '1em' }}>
        <label htmlFor="sortBy">Sort by: </label>
        <select id="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="">None</option>
          <option value="relevance">Relevance</option>
          <option value="language">Language</option>
          <option value="date">Submission Date</option>
        </select>
        <label style={{ marginLeft: '1em' }}>Tag: <input value={filter.tag} onChange={e => setFilter(f => ({ ...f, tag: e.target.value }))} placeholder="Tag" /></label>
        <label style={{ marginLeft: '1em' }}>Author: <input value={filter.author} onChange={e => setFilter(f => ({ ...f, author: e.target.value }))} placeholder="Author" /></label>
        <label style={{ marginLeft: '1em' }}>Date: <input value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} placeholder="YYYY-MM-DD" /></label>
      </div>
      {sortedPrompts.length === 0 ? (
        <div>No prompts available.</div>
      ) : (
        <ul>
          {sortedPrompts.map((prompt, idx) => (
            <li key={prompt.prompt_id || idx}>
              <strong>{prompt.prompt_text}</strong> <br />
              <em>{prompt.security_relevance}</em> <br />
              <span>Language: {prompt.programming_language || 'N/A'}</span> <br />
              <span>Date: {prompt.submission_details?.submission_date?.slice(0, 10) || 'N/A'}</span> <br />
              <span>Tags: {prompt.keywords?.join(', ')}</span> <br />
              <span>Author: {prompt.submission_details?.submitted_by || 'N/A'}</span> <br />
              <button onClick={() => setSelectedPrompt(prompt)}>View Details</button>
              {user && (
                <button onClick={() => startEdit(prompt)} style={{ marginLeft: '1em' }}>Edit</button>
              )}
            </li>
          ))}
        </ul>
      )}
      <PromptDetail prompt={selectedPrompt} onClose={() => setSelectedPrompt(null)} />
      {editPrompt && (
        <div style={{ background: '#f9f9f9', border: '1px solid #ccc', padding: '1em', marginTop: '1em' }}>
          <h3>Edit Prompt</h3>
          <label>Prompt Text: <input name="prompt_text" value={editData.prompt_text} onChange={handleEditChange} /></label><br />
          <label>Security Relevance: <input name="security_relevance" value={editData.security_relevance} onChange={handleEditChange} /></label><br />
          <label>Language: <input name="programming_language" value={editData.programming_language} onChange={handleEditChange} /></label><br />
          <label>Tags: <input name="keywords" value={editData.keywords} onChange={e => setEditData({ ...editData, keywords: e.target.value.split(',').map(s => s.trim()) })} /></label><br />
          <button onClick={saveEdit}>Save</button>
          <button onClick={() => setEditPrompt(null)} style={{ marginLeft: '1em' }}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default PromptList;
