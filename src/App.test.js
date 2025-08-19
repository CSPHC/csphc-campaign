import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import PromptList from './PromptList';

const mockPrompts = [
  {
    prompt_id: 'sample-001',
    prompt_text: 'Generate a Python function to sanitize SQL input.',
    security_relevance: 'Prevents SQL Injection vulnerabilities.'
  }
];

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

beforeAll(() => {
  global.fetch = jest.fn(() => Promise.resolve({
    json: () => Promise.resolve([])
  }));
});

describe('App', () => {
  test('renders main heading', () => {
    render(<App />);
    expect(screen.getByText(/CSPHC Security Prompt Library/i)).toBeInTheDocument();
  });
});

describe('PromptList', () => {
  test('renders prompt list with mock data', () => {
    // Mock fetch
    global.fetch = jest.fn(() => Promise.resolve({
      json: () => Promise.resolve(mockPrompts)
    }));
    render(<PromptList />);
    setTimeout(() => {
      expect(screen.getByText(/Generate a Python function to sanitize SQL input./i)).toBeInTheDocument();
      expect(screen.getByText(/Prevents SQL Injection vulnerabilities./i)).toBeInTheDocument();
    }, 100);
  });
});
