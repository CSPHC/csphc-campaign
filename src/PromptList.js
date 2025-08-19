import React, { useEffect, useState } from 'react';
import PromptDetail from './PromptDetail';

function PromptList({ prompts: propPrompts }) {
  const [prompts, setPrompts] = useState(propPrompts || []);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    if (!propPrompts) {
      fetch('/published_prompts.json')
        .then(res => res.json())
        .then(data => setPrompts(data));
    }
  }, [propPrompts]);

  const filteredPrompts = prompts.filter(
    p =>
      p.prompt_text.toLowerCase().includes(search.toLowerCase()) ||
      (p.security_relevance && p.security_relevance.toLowerCase().includes(search.toLowerCase())) ||
      (p.programming_language && p.programming_language.toLowerCase().includes(search.toLowerCase()))
  );

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
              <button onClick={() => setSelectedPrompt(prompt)}>View Details</button>
            </li>
          ))}
        </ul>
      )}
      <PromptDetail prompt={selectedPrompt} onClose={() => setSelectedPrompt(null)} />
    </div>
  );
}

export default PromptList;
