#!/bin/bash

# ==============================================================================
# GitHub Project Setup Script for the CSPHC Campaign
#
# This script automates the creation of two GitHub repositories and the initial
# setup of the project structure based on the provided design document.
# It uses the GitHub CLI (`gh`) and standard Git commands.
#
# PREREQUISITES:
# 1. GitHub CLI (`gh`) installed and authenticated.
#    You must have 'gh' authenticated with 'repo' and 'workflow' scopes.
#    Run: `gh auth login -s repo -s workflow`
# 2. Git installed.
#
# NOTE: This script is for conceptual setup. The GitHub App creation and
#       private key management steps are manual and will be prompted.
# ==============================================================================

# --- 1. Collect User Input Parameters ---
prompt_user_for_input() {
    echo "================================================================="
    echo "  CSPHC GitHub Project Setup"
    echo "================================================================="
    echo "This script will create two repositories to host your project."
    echo ""

    read -p "Enter GitHub Organization/Username (e.g., my-org or my-user): " GITHUB_OWNER
    if [[ -z "$GITHUB_OWNER" ]]; then
        echo "Error: GitHub owner cannot be empty."
        exit 1
    fi

    read -p "Enter public SPA repository name (default: csphc-campaign): " CSPHC_REPO_NAME
    CSPHC_REPO_NAME=${CSPHC_REPO_NAME:-csphc-campaign}

    read -p "Enter assessment repository name (default: csphc-assessments): " CSPA_REPO_NAME
    CSPA_REPO_NAME=${CSPA_REPO_NAME:-csphc-assessments}

    read -p "Set CSPA repository visibility (public/private, default: private): " CSPA_VISIBILITY
    CSPA_VISIBILITY=${CSPA_VISIBILITY:-private}
    if [[ "$CSPA_VISIBILITY" != "public" && "$CSPA_VISIBILITY" != "private" ]]; then
        echo "Invalid visibility. Please choose 'public' or 'private'."
        exit 1
    fi

    read -p "Enter GitHub App name (default: csphc-app): " GH_APP_NAME
    GH_APP_NAME=${GH_APP_NAME:-csphc-app}

    DEFAULT_CALLBACK_URL="https://${GITHUB_OWNER}.github.io/${CSPHC_REPO_NAME}/callback"
    read -p "Enter GitHub App Callback URL (default: ${DEFAULT_CALLBACK_URL}): " GH_APP_CALLBACK_URL
    GH_APP_CALLBACK_URL=${GH_APP_CALLBACK_URL:-$DEFAULT_CALLBACK_URL}

    read -p "Do you want to seed the assessment repository with sample prompts? (y/n, default: n): " SEED_PROMPTS
    SEED_PROMPTS=${SEED_PROMPTS:-n}
}

# --- 2. Authenticate with GitHub CLI ---
authenticate_github() {
    echo "Verifying GitHub CLI authentication..."
    # Check if gh is authenticated and has the required scopes
    if ! gh auth status --hostname github.com -t >/dev/null 2>&1; then
        echo "GitHub CLI not authenticated. Please run 'gh auth login -s repo -s workflow'."
        exit 1
    fi
}

# --- 3. Create Repositories ---
create_repositories() {
    echo "Creating repository: ${GITHUB_OWNER}/${CSPHC_REPO_NAME}..."
    if ! gh repo create "${GITHUB_OWNER}/${CSPHC_REPO_NAME}" --public --add-readme; then
        echo "Failed to create CSPHC repo. It might already exist. Continuing..."
    fi

    echo "Creating repository: ${GITHUB_OWNER}/${CSPA_REPO_NAME}..."
    if ! gh repo create "${GITHUB_OWNER}/${CSPA_REPO_NAME}" --"${CSPA_VISIBILITY}" --add-readme; then
        echo "Failed to create CSPA repo. It might already exist. Continuing..."
    fi
}

# --- 4. Setup Initial Repository Content and Workflows ---
setup_repo_content() {
    echo "Setting up repository content..."
    TEMP_DIR=$(mktemp -d)
    
    # Clone the repositories to the temporary directory
    echo "Cloning repositories to a temporary location..."
    git clone "https://github.com/${GITHUB_OWNER}/${CSPHC_REPO_NAME}.git" "${TEMP_DIR}/${CSPHC_REPO_NAME}" || { echo "Failed to clone CSPHC repo."; exit 1; }
    git clone "https://github.com/${GITHUB_OWNER}/${CSPA_REPO_NAME}.git" "${TEMP_DIR}/${CSPA_REPO_NAME}" || { echo "Failed to clone CSPA repo."; exit 1; }

    # --- Setup CSPHC (Public SPA) Repository ---
    echo "Setting up CSPHC repository content..."
    cd "${TEMP_DIR}/${CSPHC_REPO_NAME}"
    echo "## Copilot Security Prompt Harvesting Campaign (CSPHC)" > README.md
    echo "This repository hosts the public-facing Single Page Application (SPA)." >> README.md
    echo "" >> README.md
    echo 'The SPA will be built and deployed via GitHub Actions.' >> README.md

    # Scaffold React SPA (minimal)
    npx create-react-app spa --template cra-template-pwa
    mv spa/* .
    rm -rf spa
    echo "D3.js will be used for data visualizations. See /src/components/Visualizations.js for examples." >> README.md

    # Add placeholder for published_prompts.json
    mkdir -p public/data
    echo "[]" > public/data/published_prompts.json

    # Create the GitHub Actions workflow for SPA deployment
    mkdir -p .github/workflows
    cat <<EOF > .github/workflows/spa-deploy.yml
name: Deploy SPA to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build SPA
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
EOF

    git add .
    git commit -m "feat: initial React SPA scaffold, data folder, and deployment workflow"
    git push

    # --- Setup CSPA (Assessment) Repository ---
    echo "Setting up CSPA repository content..."
    cd "${TEMP_DIR}/${CSPA_REPO_NAME}"
    echo "## Copilot Security Prompt Assessments (CSPA)" > README.md
    echo "This repository is the internal hub for unreviewed prompt submissions and assessments." >> README.md

    mkdir -p prompts/unreviewed
    # Add full JSON schema for prompt submissions
    cat <<EOF > prompts/schema.json
{
  "\$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Copilot Security Prompt",
  "description": "Schema for a GitHub Copilot security prompt submission, including metadata and assessment results.",
  "type": "object",
  "properties": {
    "prompt_id": { "type": "string" },
    "prompt_text": { "type": "string" },
    "copilot_output": { "type": "string" },
    "security_relevance": { "type": "string" },
    "use_case_description": { "type": "string" },
    "programming_language": { "type": "string" },
    "github_copilot_version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "vscode_version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "submission_details": {
      "type": "object",
      "properties": {
        "submitted_by": { "type": "string" },
        "submission_date": { "type": "string", "format": "date-time" },
        "source_repository": { "type": "string", "format": "uri" },
        "context_code_snippet": { "type": "string" },
        "copilot_chat_history_summary": { "type": "string" }
      },
      "required": ["submitted_by", "submission_date"]
    },
    "security_domain": { "type": "array", "items": { "type": "string" } },
    "mitre_attck_ttps": { "type": "array", "items": { "type": "string", "pattern": "^T\\d{4}(\\.\\d{3})?$" } },
    "keywords": { "type": "array", "items": { "type": "string" } },
    "review_status": { "type": "string" },
    "reviewer_details": {
      "type": "object",
      "properties": {
        "reviewed_by": { "type": "string" },
        "review_date": { "type": "string", "format": "date-time" },
        "review_comments": { "type": "string" }
      }
    },
    "assessment_scores": {
      "type": "object",
      "properties": {
        "effectiveness_score": { "type": "integer", "minimum": 1, "maximum": 5 },
        "accuracy_score": { "type": "integer", "minimum": 1, "maximum": 5 },
        "security_best_practices_score": { "type": "integer", "minimum": 1, "maximum": 5 },
        "clarity_score": { "type": "integer", "minimum": 1, "maximum": 5 },
        "overall_score": { "type": "number" }
      }
    },
    "ranking": { "type": "integer" },
    "published_details": {
      "type": "object",
      "properties": {
        "is_published": { "type": "boolean", "default": false },
        "published_date": { "type": "string", "format": "date-time" },
        "generated_description": { "type": "string" },
        "generated_usage_instructions": { "type": "string" }
      }
    }
  },
  "required": [
    "prompt_id",
    "prompt_text",
    "copilot_output",
    "security_relevance",
    "use_case_description",
    "programming_language",
    "submission_details",
    "security_domain",
    "review_status"
  ]
}
EOF

    # Add a sample prompt if requested by the user
    if [[ "$SEED_PROMPTS" == "y" ]]; then
        echo "Adding sample prompt..."
        cat <<EOF > prompts/unreviewed/sample_prompt_1.json
{
  "prompt_id": "sample-12345",
  "prompt_text": "Generate a Python function to validate email addresses securely.",
  "copilot_output": "import re\n\ndef validate_email(email):\n    if re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', email):\n        return True\n    return False",
  "security_relevance": "Input validation to prevent malformed email attacks.",
  "use_case_description": "Used by a web application developer for user registration forms.",
  "programming_language": "Python",
  "review_status": "Pending Review",
  "submission_details": {
    "submitted_by": "sample-user",
    "submission_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  },
  "security_domain": ["SOC", "Input Validation"]
}
EOF
    fi

    # Add initial workflow template for validation
    mkdir -p .github/workflows
    cat <<EOF > .github/workflows/prompt-validation.yml
name: Validate Prompt Submission

on:
  pull_request:
    paths:
      - 'prompts/unreviewed/*.json'
    types: [opened, synchronize]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Validate JSON Schema
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install ajv-cli
        run: npm install -g ajv-cli
      - name: Run ajv validation
        run: ajv validate -s prompts/schema.json -d prompts/unreviewed/*.json
EOF

    git add .
    git commit -m "feat: initial assessment repo structure, schema, sample prompt, and validation workflow"
    git push

    cd - >/dev/null
    rm -rf "${TEMP_DIR}"
}

# --- Main Script Execution Flow ---
main() {
    prompt_user_for_input
    authenticate_github
    create_repositories
    setup_repo_content
    
    echo "================================================================="
    echo "  Setup Complete!"
    echo "================================================================="
    echo "Your repositories have been created and initialized:"
    echo "Public SPA Repo: https://github.com/${GITHUB_OWNER}/${CSPHC_REPO_NAME}"
    echo "Assessment Repo: https://github.com/${GITHUB_OWNER}/${CSPA_REPO_NAME}"
    echo ""
    echo "Next Steps:"
    echo "1. Configure GitHub Pages: Go to the public repository's Settings > Pages."
    echo "   Set 'Source' to 'GitHub Actions' and save."
    echo ""
    echo "2. Manually Create the GitHub App: This is a crucial manual step."
    echo "   Go to: https://github.com/settings/apps/new"
    echo "   - App name: ${GH_APP_NAME}"
    echo "   - Homepage URL: https://github.com/${GITHUB_OWNER}/${CSPHC_REPO_NAME}"
    echo "   - Callback URL: ${GH_APP_CALLBACK_URL}"
    echo "   - Configure permissions: 'contents' (Read & write), 'pull requests' (Read & write), 'workflows' (Read & write)."
    echo ""
    echo "3. Get App ID and Private Key: Once created, get the App ID and generate a private key."
    echo "   You will need to add these as secrets to your GitHub Actions workflows later."
    echo ""
    echo "This script only provides the foundational structure. You will need to add the React SPA code, VS Code extension, and full GitHub Actions workflows."
}

# Run the main function
main