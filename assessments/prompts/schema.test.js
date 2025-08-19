const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

describe('Prompt JSON Schema Validation', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'schema.json')));
  const samplePrompt = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample_prompt_001.json')));

  test('sample prompt matches schema', () => {
    const validate = ajv.compile(schema);
    const valid = validate(samplePrompt);
    if (!valid) {
      console.error(validate.errors);
    }
    expect(valid).toBe(true);
  });
});
