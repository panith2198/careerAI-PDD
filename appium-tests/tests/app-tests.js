const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { remote } = require('webdriverio');
const XLSX = require('xlsx');

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'https://careerai-api.welcos.in/api/v1';
const PLATFORM = process.env.APPIUM_PLATFORM || 'Android';
const REPORT_DIR = process.env.REPORT_DIR || path.resolve(__dirname, '..', 'reports');

const capabilities = {
  platformName: PLATFORM,
  'appium:automationName': process.env.APPIUM_AUTOMATION || (PLATFORM === 'iOS' ? 'XCUITest' : 'UiAutomator2'),
  'appium:deviceName': process.env.APPIUM_DEVICE_NAME || (PLATFORM === 'iOS' ? 'iPhone Simulator' : 'Android Emulator'),
  'appium:app': process.env.APPIUM_APP_PATH,
  'appium:noReset': false,
  'appium:newCommandTimeout': 120,
};

function writeResults(results) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ['Metric', 'Value'],
    ['Platform', PLATFORM],
    ['API URL', API_BASE_URL],
    ['Total Tests', results.length],
    ['Passed', results.filter((r) => r.status === 'PASSED').length],
    ['Failed', results.filter((r) => r.status === 'FAILED').length],
    ['Generated At', new Date().toISOString()],
  ]), 'Summary');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(results), 'Test Details');
  XLSX.writeFile(workbook, path.join(REPORT_DIR, 'appium-app-results.xlsx'));
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

async function findText(driver, text, timeout = 15000) {
  const selector = PLATFORM === 'iOS'
    ? `-ios predicate string:name CONTAINS "${text}" OR label CONTAINS "${text}" OR value CONTAINS "${text}"`
    : `android=new UiSelector().textContains("${text}")`;
  const element = await driver.$(selector);
  await element.waitForDisplayed({ timeout });
  return element;
}

async function tapText(driver, text) {
  const element = await findText(driver, text);
  await element.click();
}

async function setInput(driver, index, value) {
  const selector = PLATFORM === 'iOS' ? 'XCUIElementTypeTextField' : 'android.widget.EditText';
  const fields = await driver.$$(selector);
  if (!fields[index]) {
    throw new Error(`Input index ${index} not found`);
  }
  await fields[index].setValue(value);
}

(async () => {
  if (!capabilities['appium:app']) {
    throw new Error('Set APPIUM_APP_PATH to the built Android APK/AAB or iOS .app path.');
  }

  const driver = await remote({
    hostname: process.env.APPIUM_HOST || '127.0.0.1',
    port: Number(process.env.APPIUM_PORT || 4723),
    path: '/',
    capabilities,
  });

  const results = [];
  try {
    await runTest('App launches and shows login screen', async () => {
      await findText(driver, 'CareerAI');
    }, results);

    await runTest('Login form accepts email and password', async () => {
      await setInput(driver, 0, process.env.E2E_TEST_EMAIL || 'missing@example.com');
      await setInput(driver, 1, process.env.E2E_TEST_PASSWORD || 'WrongPassword123');
    }, results);

    await runTest('Invalid login displays failure state', async () => {
      await tapText(driver, 'Sign In');
      await driver.pause(3000);
      const source = await driver.getPageSource();
      assert(/incorrect|invalid|failed|error/i.test(source), 'Expected an invalid login error state');
    }, results);
  } finally {
    writeResults(results);
    await driver.deleteSession();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
