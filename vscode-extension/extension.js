// Minimal VS Code extension scaffold
const vscode = require('vscode');

function activate(context) {
  let disposableHelloWorld = vscode.commands.registerCommand('csphc.helloWorld', function () {
    vscode.window.showInformationMessage('CSPHC Extension Activated!');
  });
  context.subscriptions.push(disposableHelloWorld);

  let disposableShowPrompts = vscode.commands.registerCommand('csphc.showPrompts', function () {
    const panel = vscode.window.createWebviewPanel(
      'csphcPrompts',
      'CSPHC Security Prompts',
      vscode.ViewColumn.One,
      {}
    );
    // Try to load prompts from published_prompts.json in workspace
    const fs = require('fs');
    const path = require('path');
    let promptsHtml = '';
    try {
      // Find workspace root
      const workspaceFolders = vscode.workspace.workspaceFolders;
      let promptsPath = null;
      if (workspaceFolders && workspaceFolders.length > 0) {
        promptsPath = path.join(workspaceFolders[0].uri.fsPath, 'published_prompts.json');
        if (fs.existsSync(promptsPath)) {
          const promptsData = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
          promptsHtml = promptsData.map(prompt => `
            <div class="prompt">
              <strong>${prompt.prompt_text}</strong><br>
              <em>Relevance:</em> ${prompt.security_relevance}<br>
              <em>Language:</em> ${prompt.programming_language || ''}<br>
              <em>Copilot Output:</em> ${prompt.copilot_output || ''}
            </div>
          `).join('');
        }
      }
    } catch (e) {
      promptsHtml = '<div style="color:red">Error loading prompts: ' + e.message + '</div>';
    }
    panel.webview.html = getWebviewContent(promptsHtml);
  });
  context.subscriptions.push(disposableShowPrompts);

  let captureDisposable = vscode.commands.registerCommand('csphc.capturePrompt', async function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found.');
      return;
    }
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    const language = editor.document.languageId;
    const fileName = editor.document.fileName;
    const copilotOutput = '';
    // Prompt user for metadata
    const promptText = await vscode.window.showInputBox({ prompt: 'Enter prompt text' });
    const securityRelevance = await vscode.window.showInputBox({ prompt: 'Enter security relevance' });
    const useCaseDescription = await vscode.window.showInputBox({ prompt: 'Enter use case description' });
    const submittedBy = await vscode.window.showInputBox({ prompt: 'Your name or handle' });
    const promptId = 'prompt-' + Date.now();
    const submissionDate = new Date().toISOString();
    // Build prompt object
    const promptObj = {
      prompt_id: promptId,
      prompt_text: promptText || selectedText,
      copilot_output: copilotOutput,
      security_relevance: securityRelevance || '',
      use_case_description: useCaseDescription || '',
      programming_language: language,
      github_copilot_version: '1.0.0', // Use valid default
      vscode_version: vscode.version,
      submission_details: {
        submitted_by: submittedBy || '',
        submission_date: submissionDate,
        source_repository: 'https://github.com/example/repo', // Use valid URI
        context_code_snippet: selectedText,
        copilot_chat_history_summary: ''
      },
      security_domain: [],
      mitre_attck_ttps: [],
      keywords: [],
      review_status: 'pending'
    };
    // Save to workspace as JSON
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const fs = require('fs');
      const path = require('path');
      const outPath = path.join(workspaceFolders[0].uri.fsPath, `prompt_${promptId}.json`);
      fs.writeFileSync(outPath, JSON.stringify(promptObj, null, 2));
      vscode.window.showInformationMessage('Prompt captured and saved: ' + outPath);
    } else {
      vscode.window.showErrorMessage('No workspace folder found to save prompt.');
    }
  });
  context.subscriptions.push(captureDisposable);

  // Collect additional metadata for prompt
  let metadataDisposable = vscode.commands.registerCommand('csphc.addMetadata', async function () {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder found.');
      return;
    }
    const fs = require('fs');
    const path = require('path');
    // Ask user for prompt file
    const promptFile = await vscode.window.showInputBox({ prompt: 'Enter prompt JSON filename (e.g., prompt_123.json)' });
    if (!promptFile) {
      vscode.window.showErrorMessage('No file specified.');
      return;
    }
    const filePath = path.join(workspaceFolders[0].uri.fsPath, promptFile);
    if (!fs.existsSync(filePath)) {
      vscode.window.showErrorMessage('Prompt file not found: ' + filePath);
      return;
    }
    let promptObj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Collect additional metadata
    const securityDomain = await vscode.window.showInputBox({ prompt: 'Security domain (comma separated)' });
    const mitreTTPs = await vscode.window.showInputBox({ prompt: 'MITRE ATT&CK TTPs (comma separated, e.g., T1003,T1059)' });
    const keywords = await vscode.window.showInputBox({ prompt: 'Keywords (comma separated)' });
    promptObj.security_domain = securityDomain ? securityDomain.split(',').map(s => s.trim()) : [];
    promptObj.mitre_attck_ttps = mitreTTPs ? mitreTTPs.split(',').map(s => s.trim()) : [];
    promptObj.keywords = keywords ? keywords.split(',').map(s => s.trim()) : [];
    fs.writeFileSync(filePath, JSON.stringify(promptObj, null, 2));
    vscode.window.showInformationMessage('Metadata added to prompt: ' + filePath);
  });
  context.subscriptions.push(metadataDisposable);

  // Submit prompt as PR (simulated: just show info message)
  let submitDisposable = vscode.commands.registerCommand('csphc.submitPrompt', async function () {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder found.');
      return;
    }
    const fs = require('fs');
    const path = require('path');
    // Ask user for prompt file
    const promptFile = await vscode.window.showInputBox({ prompt: 'Enter prompt JSON filename to submit (e.g., prompt_123.json)' });
    if (!promptFile) {
      vscode.window.showErrorMessage('No file specified.');
      return;
    }
    const filePath = path.join(workspaceFolders[0].uri.fsPath, promptFile);
    if (!fs.existsSync(filePath)) {
      vscode.window.showErrorMessage('Prompt file not found: ' + filePath);
      return;
    }
    // Simulate PR submission (real implementation would use GitHub API)
    vscode.window.showInformationMessage('Prompt submission simulated. In production, this would create a PR to the assessment repo.');
  });
  context.subscriptions.push(submitDisposable);
}

function getWebviewContent(promptsHtml) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSPHC Security Prompts</title>
    <style>
      body { font-family: sans-serif; padding: 1em; }
      h1 { color: #007acc; }
      .prompt { margin-bottom: 1em; padding: 1em; border: 1px solid #eee; border-radius: 4px; }
    </style>
  </head>
  <body>
    <h1>CSPHC Security Prompts</h1>
    <div id="prompts">
      ${promptsHtml || '<div>No prompts found in published_prompts.json.</div>'}
    </div>
  </body>
  </html>`;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
