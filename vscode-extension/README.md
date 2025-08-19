# CSPHC VS Code Extension

This extension enables security analysts to capture GitHub Copilot prompts and code context directly from VS Code, and submit them to the assessment repository for review.

## Structure
- `extension.js`: Main extension entry point
- `extension.capture.test.js`: Test cases for prompt capture
- `extension.metadata.test.js`: Test cases for metadata addition
- `extension.submit.test.js`: Test cases for prompt submission
- `package.json`: Extension manifest

## Features
- Show a webview panel with security prompts (`csphc.showPrompts` command)
- Capture selected text and code context, prompt for metadata, and save as JSON (`csphc.capturePrompt` command)
- Add additional metadata to prompt JSON (`csphc.addMetadata` command)
- Simulate prompt submission as PR (`csphc.submitPrompt` command)
- (Planned) Real GitHub PR integration

## Getting Started
1. Open the command palette and run `CSPHC: Show Prompts` to view the sample prompt webview.
2. Select code in the editor and run `CSPHC: Capture Prompt` to save a prompt JSON file in your workspace.
3. Run `CSPHC: Add Metadata` to add security domain, MITRE TTPs, and keywords to a prompt JSON file.
4. Run `CSPHC: Submit Prompt` to simulate prompt submission (shows info message).
5. Run tests: `npx jest vscode-extension/extension.capture.test.js`, `npx jest vscode-extension/extension.metadata.test.js`, and `npx jest vscode-extension/extension.submit.test.js`

## Next Steps
- Integrate with assessment repo and schema
- Add real submission workflow
