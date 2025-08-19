const Ajv = require('ajv');
const schema = require('./schema.json');
const validPrompt = require('./sample_prompt_001.json');

const invalidPrompt = {
  prompt_id: 'bad',
  // missing required fields
};

describe('Prompt Schema Validation', () => {
  it('validates a correct prompt', () => {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(validPrompt);
    if (!valid) {
      console.error(validate.errors);
    }
    expect(valid).toBe(true);
  });

  it('fails on missing required fields', () => {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    expect(validate(invalidPrompt)).toBe(false);
  });

  it('fails on wrong data types', () => {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const wrongTypePrompt = { ...validPrompt, prompt_id: 123 };
    expect(validate(wrongTypePrompt)).toBe(false);
  });

  it('fails when copilot_output is missing (required field)', () => {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const minimalPrompt = { ...validPrompt };
    delete minimalPrompt.copilot_output;
    const valid = validate(minimalPrompt);
    if (valid) {
      console.error('Expected validation to fail, but it passed.');
    } else {
      console.error(validate.errors);
    }
    expect(valid).toBe(false);
  });
});
