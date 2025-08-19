import React from 'react';
import PropTypes from 'prop-types';

function PromptDetail({ prompt, onClose }) {
  if (!prompt) return null;
  return (
    <div className="prompt-detail">
      <h2>Prompt Detail</h2>
      <div><strong>Prompt Text:</strong> {prompt.prompt_text}</div>
      <div><strong>Copilot Output:</strong> {prompt.copilot_output}</div>
      <div><strong>Security Relevance:</strong> {prompt.security_relevance}</div>
      <div><strong>Use Case:</strong> {prompt.use_case_description}</div>
      <div><strong>Language:</strong> {prompt.programming_language}</div>
      <div><strong>Submitted By:</strong> {prompt.submission_details?.submitted_by}</div>
      <div><strong>Submission Date:</strong> {prompt.submission_details?.submission_date?.slice(0, 10)}</div>
      <div><strong>Security Domain:</strong> {prompt.security_domain?.join(', ')}</div>
      <div><strong>MITRE ATT&CK TTPs:</strong> {prompt.mitre_attck_ttps?.join(', ')}</div>
      <div><strong>Keywords:</strong> {prompt.keywords?.join(', ')}</div>
      <div><strong>Review Status:</strong> {prompt.review_status}</div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

PromptDetail.propTypes = {
  prompt: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default PromptDetail;
