import React from 'react';
import { render, screen } from '@testing-library/react';
import PromptDetail from './PromptDetail';

describe('PromptDetail', () => {
  it('renders prompt details', () => {
    const prompt = {
      prompt_id: 'test1',
      prompt_text: 'Prompt 1',
      security_relevance: 'High',
      copilot_output: 'Output',
      use_case_description: 'Desc',
      programming_language: 'python',
      submission_details: { submitted_by: 'user1', submission_date: '2025-08-19T12:00:00Z' },
      security_domain: ['auth'],
      review_status: 'approved'
    };
    render(<PromptDetail prompt={prompt} onClose={() => {}} />);
    expect(screen.getByText(/Prompt Detail/)).toBeInTheDocument();
    expect(screen.getByText(/Prompt 1/)).toBeInTheDocument();
    expect(screen.getByText(/High/)).toBeInTheDocument();
  });

  it('renders all prompt details', () => {
    const prompt = {
      prompt_id: 'test1',
      prompt_text: 'Prompt 1',
      copilot_output: 'Output',
      security_relevance: 'High',
      use_case_description: 'Desc',
      programming_language: 'python',
      submission_details: { submitted_by: 'user1', submission_date: '2025-08-19T12:00:00Z' },
      security_domain: ['auth'],
      mitre_attck_ttps: ['T1003'],
      keywords: ['injection'],
      review_status: 'approved'
    };
    render(<PromptDetail prompt={prompt} onClose={() => {}} />);
    expect(screen.getByText(/Prompt Text:/)).toBeInTheDocument();
    expect(screen.getAllByText(/Output/)[0]).toBeInTheDocument();
    expect(screen.getByText(/High/)).toBeInTheDocument();
    expect(screen.getByText(/Desc/)).toBeInTheDocument();
    expect(screen.getByText(/python/)).toBeInTheDocument();
    expect(screen.getByText(/user1/)).toBeInTheDocument();
    expect(screen.getByText(/2025-08-19/)).toBeInTheDocument();
    expect(screen.getByText(/auth/)).toBeInTheDocument();
    expect(screen.getByText(/T1003/)).toBeInTheDocument();
    expect(screen.getByText(/injection/)).toBeInTheDocument();
    expect(screen.getByText(/approved/)).toBeInTheDocument();
  });

  it('renders nothing if no prompt', () => {
    const { container } = render(<PromptDetail prompt={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
