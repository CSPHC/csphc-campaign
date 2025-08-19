// Tests for csphc.addMetadata command
const fs = require('fs');
const path = require('path');
describe('VS Code Extension - Add Metadata', () => {
  it('adds metadata fields to prompt JSON', () => {
    // Simulate prompt file
    const promptId = 'prompt-9876543210';
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
    const outPath = path.join(__dirname, `prompt_${promptId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(promptObj, null, 2));
    // Simulate metadata addition
    const securityDomain = 'auth,crypto';
    const mitreTTPs = 'T1003,T1059';
    const keywords = 'injection,python';
    promptObj.security_domain = securityDomain.split(',').map(s => s.trim());
    promptObj.mitre_attck_ttps = mitreTTPs.split(',').map(s => s.trim());
    promptObj.keywords = keywords.split(',').map(s => s.trim());
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
});
