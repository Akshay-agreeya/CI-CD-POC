# 🤖 Self-Healing CI/CD Pipeline — POC

> **AI-Powered GitHub Actions Failure Analysis using GitHub Models (Free Tier)**

This is a Proof of Concept demonstrating how AI can automate failure analysis in GitHub Actions CI/CD pipelines — at **zero cost** — using [GitHub Models](https://docs.github.com/en/github-models) free tier.

---

## What Does It Do?

When your CI pipeline **fails**, instead of a developer manually digging through logs:

1. **The self-healing workflow triggers automatically**
2. **Fetches the failure logs** from the GitHub Actions API
3. **Sends them to an AI model** (GPT-4o-mini via GitHub Models — free)
4. **Creates a GitHub Issue** with:
   - Root cause analysis
   - Error category (dependency / test / lint / build / config / infra)
   - Specific fix suggestions
   - Severity rating
5. **Attempts an auto-fix PR** for simple cases (lint errors, dependency issues)

```
Developer pushes code
        │
        ▼
┌─────────────────┐
│   CI Pipeline    │──── ✅ Pass ──→ Done
│ (build/lint/test)│
└────────┬────────┘
         │ ❌ Fail
         ▼
┌─────────────────────────┐
│  Self-Heal Workflow      │
│  (triggers automatically)│
└────────┬────────────────┘
         │
         ├── 1. Fetch failure logs (GitHub API)
         ├── 2. AI analysis (GitHub Models — FREE)
         ├── 3. Create GitHub Issue with diagnosis
         └── 4. Auto-fix PR (if applicable)
```

---

## Project Structure

```
.
├── .github/
│   └── workflows/
│       ├── ci.yml              # Standard CI: build, lint, test
│       └── self-heal.yml       # AI-powered failure analysis
├── src/
│   ├── calculator.js           # Sample app — math utilities
│   └── index.js                # Express API server
├── __tests__/
│   ├── calculator.test.js      # Unit tests
│   └── api.test.js             # API integration tests
├── scripts/
│   └── break-ci.sh             # Helper to intentionally break CI for demo
├── .eslintrc.js                # Linter config
├── package.json
└── README.md
```

---

## Setup Instructions

### Prerequisites

- A GitHub account (free plan works)
- A GitHub repository (public or private)
- Node.js 18+ (for local testing)

### Step 1: Create the repo and push

```bash
# Clone/copy this project
git init self-healing-cicd-poc
cd self-healing-cicd-poc

# Copy all files from this project into the repo
# Then:
git add -A
git commit -m "feat: initial self-healing CI/CD POC"
git remote add origin https://github.com/<YOUR_ORG>/self-healing-cicd-poc.git
git push -u origin main
```

### Step 2: Create issue labels (one-time)

The self-healing workflow uses custom labels. Create them in your repo:

```bash
gh label create "ai-diagnosis" --color "7057ff" --description "Issue created by AI failure analysis"
gh label create "ci-failure" --color "d73a4a" --description "CI pipeline failure"
gh label create "priority:critical" --color "b60205" --description "Critical priority"
gh label create "priority:high" --color "d93f0b" --description "High priority"
gh label create "priority:medium" --color "fbca04" --description "Medium priority"
gh label create "priority:low" --color "0e8a16" --description "Low priority"
```

### Step 3: Enable GitHub Models permission

In your repo settings, ensure the `GITHUB_TOKEN` has `models: read` permission.
This is set in the workflow YAML already — no manual config needed for most repos.

### Step 4: Test it!

```bash
# Run tests locally to verify they pass
npm install
npm test

# Push to trigger CI
git push origin main
```

---

## Demo: How to Trigger Self-Healing

### Option A: Use the break script

```bash
chmod +x scripts/break-ci.sh
./scripts/break-ci.sh
```

This introduces a deliberate test failure. Push it, watch CI fail, and see the self-healing workflow create an issue with AI analysis.

### Option B: Break something manually

1. Open `src/calculator.js`
2. Change `return a + b;` to `return a - b;` in the `add` function
3. Commit and push — the tests will fail
4. Watch the **Self-Heal: AI Failure Analysis** workflow run
5. Check the **Issues** tab for the AI-generated diagnosis

### Option C: Break the linter

```bash
# Add a lint error
echo "var x = 1" >> src/calculator.js
git add -A && git commit -m "test: trigger lint failure" && git push
```

---

## How It Works — Technical Deep Dive

### The CI Workflow (`ci.yml`)

Standard pipeline: checkout → install → lint → test. Runs on Node 18 and 20 matrix.
Nothing special here — this is your normal CI.

### The Self-Healing Workflow (`self-heal.yml`)

Triggered by: `workflow_run` event when CI Pipeline **completes with failure**.

**Step 1 — Log Retrieval:**
Uses `gh api` to fetch job details and logs from the failed run.
Truncates to last 200 lines per job to stay within AI token limits.

**Step 2 — AI Analysis:**
Sends a structured prompt to GitHub Models API:
```
POST https://models.github.ai/inference/chat/completions
Authorization: Bearer $GITHUB_TOKEN
```
- Model: `openai/gpt-4o-mini` (free tier, no API key needed)
- Temperature: 0.3 (deterministic, focused analysis)
- Asks for: root cause, category, fix suggestion, auto-fixability, severity

**Step 3 — Issue Creation:**
Creates a GitHub Issue with the full AI analysis, linked to the failed run,
tagged with severity and category labels.

**Step 4 — Auto-Fix (Stretch Goal):**
For categories marked `auto_fixable: yes`, attempts programmatic fixes:
- `dependency_issue` → regenerates `package-lock.json`
- `lint_error` → runs `eslint --fix`
- Opens a PR with the fix for human review

---

## Cost Analysis

| Component | Cost |
|-----------|------|
| GitHub Actions (public repo) | Free (2,000 min/month) |
| GitHub Actions (private repo) | Free tier: 500 min/month |
| GitHub Models (GPT-4o-mini) | Free tier (~50K tokens/month) |
| GitHub Issues API | Free |
| **Total** | **$0** |

---

## Limitations & Future Improvements

### Current Limitations
- GitHub Models free tier has rate limits (~50K tokens/month) — sufficient for POC
- Auto-fix only handles `dependency_issue` and `lint_error` categories
- Log truncation (200 lines) may miss context in very verbose builds
- Single-model analysis (could use multi-model consensus for higher confidence)

### Future Improvements (Phase 2)
- **ArgoCD integration** for CD side (GitOps deployment)
- **Pattern memory** — store past failures in a JSON file, detect recurring issues
- **Slack/Teams notifications** with AI summary
- **PR review integration** — analyze PR diff before merge to prevent failures
- **Multi-repo support** — centralized self-healing for all org repos
- **Metrics dashboard** — track MTTR (mean time to resolution) improvement

---

## Key Decisions & Tradeoffs

| Decision | Why |
|----------|-----|
| GitHub Models over external LLMs | Zero cost, zero config, built-in auth via GITHUB_TOKEN |
| GPT-4o-mini over GPT-4o | Faster, cheaper (stays well within free tier), good enough for log analysis |
| `workflow_run` trigger over `on: failure` | Cleaner separation — self-heal is a separate workflow, not embedded in CI |
| Log truncation at 200 lines | Balances context vs token budget; most errors are in the last 50 lines anyway |
| Auto-fix behind `auto_fixable` flag | Safety — AI decides if it's safe, human reviews the PR |

---

## References

- [GitHub Models Quickstart](https://docs.github.com/en/github-models/quickstart)
- [GitHub Models API Docs](https://docs.github.com/en/rest/models/inference)
- [Video: Build Self-Healing CI/CD with Copilot SDK](https://www.youtube.com/watch?v=px8ADMPe-II)
- [GitHub Actions workflow_run trigger](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_run)
