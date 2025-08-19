import React from 'react';
import PromptList from './PromptList';

function App({ prompts }) {
  return (
    <div>
      <h1>CSPHC Security Prompt Library</h1>
      <p>Welcome to the Copilot Security Prompt Harvesting Campaign SPA.</p>
      <PromptList prompts={prompts} />
    </div>
  );
}

export default App;
