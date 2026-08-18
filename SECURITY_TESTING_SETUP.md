# CareerAI Security and E2E Testing Setup

## Local Web Selenium Tests

```bash
cd web
npm install
npm run dev -- --host 127.0.0.1 --port 5175

cd ../selenium-tests
npm install
WEB_BASE_URL=http://127.0.0.1:5175 API_BASE_URL=https://careerai-api.welcos.in/api/v1 npm test
```

Reports are written to:

```text
selenium-tests/reports/selenium-login-results.xlsx
```

The 300-case catalog is:

```text
selenium-tests/selenium-test-cases.xlsx
```

## Mobile Appium Tests

Build the mobile app first, start an Appium server, then run:

```bash
cd appium-tests
npm install
APPIUM_APP_PATH=/path/to/app.apk APPIUM_PLATFORM=Android npm test
```

For iOS:

```bash
APPIUM_APP_PATH=/path/to/CareerAI.app APPIUM_PLATFORM=iOS npm test
```

The 300-case catalog is:

```text
appium-tests/appium-test-cases.xlsx
```

## Security Review Reports

```bash
python3 scripts/security_review.py
```

Reports are generated in:

```text
Vulnerability Test Results/
```

Files:

```text
security-review.md
executive-summary.md
dependency-report.md
endpoint-inventory.xlsx
findings.xlsx
```

## Baseline Load Test

Install k6, then run:

```bash
k6 run load-tests/k6-baseline.js
```

Default load profile:

```text
100 virtual users
1 minute duration
```

Override example:

```bash
VUS=50 DURATION=30s API_ORIGIN=https://careerai-api.welcos.in k6 run load-tests/k6-baseline.js
```

## GitHub Actions

Workflow:

```text
.github/workflows/security-review.yml
```

Runs on:

```text
push
pull_request
workflow_dispatch
```

Jobs:

```text
selenium-web-e2e
appium-mobile-e2e
security-review
baseline-load-test
```

All generated Excel and Markdown reports are uploaded as GitHub Actions artifacts.
