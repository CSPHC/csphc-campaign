// Tests for csphc.capturePrompt command
const fs = require('fs');
const path = require('path');

describe('VS Code Extension - Capture Prompt', () => {
  it('creates a valid prompt JSON file with required fields', () => {
    // Simulate captured prompt object
    const promptId = 'prompt-1234567890';
    const promptObj = {
      prompt_id: promptId,
      prompt_text: 'Test prompt',
      copilot_output: '',
      security_relevance: 'High',
      use_case_description: 'Test use case',
      programming_language: 'python',
      github_copilot_version: '1.0.0', // Use valid default
      vscode_version: '1.80.0',
      submission_details: {
        submitted_by: 'tester',
        submission_date: '2025-08-19T12:00:00Z',
        source_repository: 'https://github.com/example/repo', // Use valid URI
        context_code_snippet: 'def foo(): pass',
        copilot_chat_history_summary: ''
      },
      security_domain: [],
      mitre_attck_ttps: [],
      keywords: [],
      review_status: 'pending'
    };
    // Write to temp file
    const outPath = path.join(__dirname, `prompt_${promptId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(promptObj, null, 2));
    // Validate against schema
    const Ajv = require('ajv');
    const schema = require('../assessments/prompts/schema.json');
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(promptObj);
    if (!valid) {
      console.error(validate.errors);
    }
    expect(valid).toBe(true);
    // Cleanup
    fs.unlinkSync(outPath);
  });

  it('fails validation if required fields are missing', () => {
    const promptObj = {
      prompt_id: 'prompt-123',
      // missing required fields
    };
    const Ajv = require('ajv');
    const schema = require('../assessments/prompts/schema.json');
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    expect(validate(promptObj)).toBe(false);
  });
});
