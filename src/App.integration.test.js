import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const prompts = [
  {
    prompt_id: 'test2',
    prompt_text: 'Detail prompt',
    copilot_output: 'Output',
    security_relevance: 'Medium',
    use_case_description: 'Desc',
    programming_language: 'javascript',
    submission_details: { submitted_by: 'user2', submission_date: '2025-08-19T12:00:00Z' },
    security_domain: ['crypto'],
    review_status: 'approved'
  }
];

global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(prompts)
}));

describe('App integration', () => {
  it('renders prompt list and allows detail view', () => {
    render(<App prompts={prompts} />);
    expect(screen.getByText('Detail prompt')).toBeInTheDocument();
    // Simulate clicking for detail view if implemented
    // fireEvent.click(screen.getByText('Detail prompt'));
    // expect(screen.getByText(/Output/)).toBeInTheDocument();
  });

  it('handles empty prompt list gracefully', () => {
    render(<App prompts={[]} />);
    expect(screen.getByText(/No prompts available/i)).toBeInTheDocument();
  });

  it('shows prompt detail when View Details is clicked', async () => {
    render(<App prompts={prompts} />);
    expect(screen.getByText('Detail prompt')).toBeInTheDocument();
    fireEvent.click(screen.getByText('View Details'));
    expect(screen.getByText(/Prompt Detail/)).toBeInTheDocument();
    expect(screen.getAllByText(/Output/)[0]).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText(/Prompt Detail/)).not.toBeInTheDocument();
  });
});
