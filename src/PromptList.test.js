import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PromptList from './PromptList';

const prompts = [
  {
    prompt_id: 'test1',
    prompt_text: 'Prompt 1',
    security_relevance: 'High',
    copilot_output: 'Output',
    use_case_description: 'Desc',
    programming_language: 'python',
    submission_details: { submitted_by: 'user1', submission_date: '2025-08-19T12:00:00Z' },
    security_domain: ['auth'],
    review_status: 'approved'
  }
];

global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve(prompts) }));

describe('PromptList', () => {
  it('renders prompts and opens detail view', async () => {
    await act(async () => {
      render(<PromptList />);
    });
    expect(await screen.findByText('Prompt 1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('View Details'));
    expect(screen.getByText(/Prompt Detail/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText(/Prompt Detail/)).not.toBeInTheDocument();
  });

  it('renders prompt list', async () => {
    await act(async () => {
      render(<PromptList prompts={prompts} />);
    });
    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
  });

  it('renders empty state', async () => {
    await act(async () => {
      render(<PromptList prompts={[]} />);
    });
    expect(screen.getByText(/No prompts available/i)).toBeInTheDocument();
  });

  it('handles missing optional fields', async () => {
    const incompletePrompt = { ...prompts[0] };
    delete incompletePrompt.copilot_output;
    await act(async () => {
      render(<PromptList prompts={[incompletePrompt]} />);
    });
    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
  });

  it('filters prompts by search input', async () => {
    await act(async () => {
      render(<PromptList prompts={prompts} />);
    });
    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText('Search prompts...');
    fireEvent.change(searchInput, { target: { value: 'High' } });
    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'xyz' } });
    expect(screen.getByText(/No prompts available/i)).toBeInTheDocument();
  });

  it('sorts prompts by language and date', async () => {
    const multiPrompts = [
      { ...prompts[0], prompt_id: 'a', programming_language: 'python', submission_details: { ...prompts[0].submission_details, submission_date: '2025-08-18T12:00:00Z' } },
      { ...prompts[0], prompt_id: 'b', programming_language: 'javascript', submission_details: { ...prompts[0].submission_details, submission_date: '2025-08-19T12:00:00Z' } }
    ];
    await act(async () => {
      render(<PromptList prompts={multiPrompts} />);
    });
    const sortSelect = screen.getByLabelText('Sort by:');
    fireEvent.change(sortSelect, { target: { value: 'language' } });
    // First should be javascript
    expect(screen.getAllByText(/Prompt 1/)[0].parentElement.textContent).toContain('Language: javascript');
    fireEvent.change(sortSelect, { target: { value: 'date' } });
    // First should be the most recent date
    expect(screen.getAllByText(/Prompt 1/)[0].parentElement.textContent).toContain('Date: 2025-08-19');
  });
});
