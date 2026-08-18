const assert = require('assert');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const WEB_BASE_URL = process.env.WEB_BASE_URL || 'http://127.0.0.1:5175';
const API_BASE_URL = process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || 'https://careerai-api.welcos.in/api/v1';
const HEADLESS = process.env.HEADLESS !== 'false';
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || `selenium_${Date.now()}@example.com`;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'Password123';
const REPORT_DIR = process.env.REPORT_DIR || path.resolve(__dirname, '..', 'reports');

function buildDriver() {
  const options = new chrome.Options();
  if (HEADLESS) {
    options.addArguments('--headless=new');
  }
  options.addArguments('--window-size=1440,1100', '--no-sandbox', '--disable-dev-shm-usage');
  return new Builder().forBrowser('chrome').setChromeOptions(options).build();
}

async function waitForPage(driver, route) {
  await driver.get(`${WEB_BASE_URL}${route}`);
  await driver.wait(until.elementLocated(By.css('body')), 15000);
}

async function findByText(driver, text, timeout = 10000) {
  const xpath = `//*[contains(normalize-space(.), ${JSON.stringify(text)})]`;
  return driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
}

async function typeByNameOrPlaceholder(driver, candidates, value) {
  for (const candidate of candidates) {
    const selectors = [
      By.css(`[name="${candidate}"]`),
      By.css(`input[placeholder*="${candidate}" i]`),
      By.css(`textarea[placeholder*="${candidate}" i]`),
    ];
    for (const selector of selectors) {
      const matches = await driver.findElements(selector);
      if (matches.length) {
        await matches[0].clear();
        await matches[0].sendKeys(value);
        return;
      }
    }
  }
  throw new Error(`Unable to find input for ${candidates.join(', ')}`);
}

async function clickButtonByText(driver, text) {
  const button = await driver.wait(
    until.elementLocated(By.xpath(`//button[contains(normalize-space(.), ${JSON.stringify(text)})]`)),
    10000,
  );
  await driver.wait(until.elementIsEnabled(button), 10000);
  await button.click();
}

function writeResults(results) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const summary = [
    ['Metric', 'Value'],
    ['Frontend URL', WEB_BASE_URL],
    ['API URL', API_BASE_URL],
    ['Total Tests', results.length],
    ['Passed', results.filter((r) => r.status === 'PASSED').length],
    ['Failed', results.filter((r) => r.status === 'FAILED').length],
    ['Generated At', new Date().toISOString()],
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summary), 'Summary');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(results), 'Test Details');
  XLSX.writeFile(workbook, path.join(REPORT_DIR, 'selenium-login-results.xlsx'));
}

async function runTest(name, fn, results) {
  const startedAt = Date.now();
  try {
    await fn();
    results.push({ name, status: 'PASSED', duration_ms: Date.now() - startedAt, error: '' });
  } catch (error) {
    results.push({ name, status: 'FAILED', duration_ms: Date.now() - startedAt, error: error.message });
    throw error;
  }
}

(async () => {
  const driver = await buildDriver();
  const results = [];

  try {
    await runTest('Register page loads', async () => {
      await waitForPage(driver, '/register');
      await findByText(driver, 'Create your account');
    }, results);

    await runTest('Register form validates first step', async () => {
      await clickButtonByText(driver, 'Continue');
      await findByText(driver, 'Full name is required');
    }, results);

    await runTest('Register flow submits account details', async () => {
      await typeByNameOrPlaceholder(driver, ['name', 'Full name', 'Name'], 'Selenium Test User');
      await typeByNameOrPlaceholder(driver, ['email', 'Email'], TEST_EMAIL);
      await typeByNameOrPlaceholder(driver, ['password', 'Password'], TEST_PASSWORD);
      await typeByNameOrPlaceholder(driver, ['confirmPassword', 'Confirm'], TEST_PASSWORD);
      await clickButtonByText(driver, 'Continue');
      await findByText(driver, 'Create Account');
      await clickButtonByText(driver, 'Create Account');
      await driver.wait(until.urlContains('/register/otp'), 20000);
    }, results);

    await runTest('Login page loads', async () => {
      await waitForPage(driver, '/login');
      await findByText(driver, 'Sign in');
    }, results);

    await runTest('Invalid login shows failure state', async () => {
      await typeByNameOrPlaceholder(driver, ['email', 'Email'], TEST_EMAIL);
      await typeByNameOrPlaceholder(driver, ['password', 'Password'], 'WrongPassword123');
      await clickButtonByText(driver, 'Sign In');
      await driver.wait(async () => {
        const body = await driver.findElement(By.css('body')).getText();
        return /incorrect|invalid|failed|verify/i.test(body);
      }, 20000);
    }, results);
  } finally {
    writeResults(results);
    await driver.quit();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
