/**
 * DDC Login Flow — Full Browser Test (v2)
 * Tests: Login → DDC Dashboard → Logout
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = '/home/z/my-project/test-screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const results = [];

function log(step, status, detail = '') {
  const entry = { step, status, detail, timestamp: new Date().toISOString() };
  results.push(entry);
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : 'ℹ️';
  console.log(`${icon} [Step ${step}] ${status}${detail ? ' — ' + detail : ''}`);
}

async function takeScreenshot(page, name) {
  const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true }).catch(() => {});
  console.log(`📸 Screenshot saved: ${filepath}`);
  return filepath;
}

(async () => {
  console.log('\n🚀 Starting DDC Login Flow Browser Test (v2)\n');
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  try {
    // ═══════════════════════════════════════════════
    // STEP 1: Navigate to /login
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 1: Navigate to /login');
    try {
      const response = await page.goto(`${BASE_URL}/login`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      if (response && response.status() === 200) {
        log(1, 'PASS', `Page loaded with status ${response.status()}`);
      } else {
        log(1, 'FAIL', `Page returned status ${response?.status()}`);
      }
    } catch (err) {
      log(1, 'FAIL', `Navigation error: ${err.message}`);
    }

    // ═══════════════════════════════════════════════
    // STEP 2: Wait for page to load & verify login form
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 2: Verify login form elements');
    try {
      await page.waitForSelector('#login-email', { timeout: 10000 });
      await page.waitForSelector('#login-password', { timeout: 5000 });
      
      const emailVisible = await page.isVisible('#login-email');
      const passwordVisible = await page.isVisible('#login-password');
      const submitButton = page.getByRole('button', { name: /Entrar no Painel/i });
      const submitVisible = await submitButton.isVisible();

      if (emailVisible && passwordVisible && submitVisible) {
        log(2, 'PASS', 'Login form fully visible (email input, password input, "Entrar no Painel" button)');
      } else {
        log(2, 'FAIL', `Missing elements: email=${emailVisible}, password=${passwordVisible}, submit=${submitVisible}`);
      }
    } catch (err) {
      log(2, 'FAIL', `Login form not found: ${err.message}`);
    }

    await takeScreenshot(page, '01-login-page');

    // ═══════════════════════════════════════════════
    // STEP 3: Type "123" in the email/login field
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 3: Type "123" in email field');
    try {
      await page.locator('#login-email').fill('123');
      const value = await page.locator('#login-email').inputValue();
      if (value === '123') {
        log(3, 'PASS', 'Email field filled with "123"');
      } else {
        log(3, 'FAIL', `Email field value is "${value}" instead of "123"`);
      }
    } catch (err) {
      log(3, 'FAIL', `Could not fill email: ${err.message}`);
    }

    // ═══════════════════════════════════════════════
    // STEP 4: Type "123" in the password field
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 4: Type "123" in password field');
    try {
      await page.locator('#login-password').fill('123');
      const value = await page.locator('#login-password').inputValue();
      if (value === '123') {
        log(4, 'PASS', 'Password field filled with "123"');
      } else {
        log(4, 'FAIL', `Password field value is "${value}" instead of "123"`);
      }
    } catch (err) {
      log(4, 'FAIL', `Could not fill password: ${err.message}`);
    }

    await takeScreenshot(page, '02-login-filled');

    // ═══════════════════════════════════════════════
    // STEP 5: Click "Entrar no Painel" button
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 5: Click "Entrar no Painel"');
    try {
      await page.getByRole('button', { name: /Entrar no Painel/i }).click();
      log(5, 'PASS', '"Entrar no Painel" button clicked');
    } catch (err) {
      log(5, 'FAIL', `Could not click submit: ${err.message}`);
    }

    // ═══════════════════════════════════════════════
    // STEP 6: Wait up to 5 seconds for redirect
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 6: Wait for redirect after login');
    try {
      await page.waitForURL('**/ddc**', { timeout: 5000 });
      log(6, 'PASS', 'Redirect to /ddc happened within 5 seconds');
    } catch (err) {
      log(6, 'WARN', `Redirect not detected within 5s. Current URL: ${page.url()}`);
      await page.waitForTimeout(3000);
    }

    // ═══════════════════════════════════════════════
    // STEP 7: Verify the page redirects to /ddc
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 7: Verify redirect to /ddc');
    const currentUrl = page.url();
    if (currentUrl.includes('/ddc')) {
      log(7, 'PASS', `Successfully redirected to ${currentUrl}`);
    } else {
      log(7, 'FAIL', `Expected /ddc but got ${currentUrl}`);
    }

    await takeScreenshot(page, '03-after-login-redirect');

    // ═══════════════════════════════════════════════
    // STEP 8: Take a screenshot of DDC page
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 8: Screenshot of DDC dashboard');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '04-ddc-dashboard');

    // ═══════════════════════════════════════════════
    // STEP 9: Verify DDC dashboard loads properly
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 9: Verify DDC dashboard components');
    try {
      const headerText = await page.locator('text=Seu Zélla').first().isVisible({ timeout: 5000 }).catch(() => false);
      const metricsPresent = await page.locator('text=Atendimentos').first().isVisible({ timeout: 3000 }).catch(() => false)
        || await page.locator('text=Receita').first().isVisible({ timeout: 1000 }).catch(() => false)
        || await page.locator('text=Conversão').first().isVisible({ timeout: 1000 }).catch(() => false)
        || await page.locator('text=Hóspedes').first().isVisible({ timeout: 1000 }).catch(() => false);
      const tabsPresent = await page.locator('text=Dashboard Geral').first().isVisible({ timeout: 3000 }).catch(() => false)
        || await page.locator('[data-state="active"]').first().isVisible({ timeout: 1000 }).catch(() => false);

      const headerOk = headerText ? 'YES' : 'NO';
      const metricsOk = metricsPresent ? 'YES' : 'NO';
      const tabsOk = tabsPresent ? 'YES' : 'NO';

      if (headerText && metricsPresent) {
        log(9, 'PASS', `Dashboard loaded — Header: ${headerOk}, Metrics: ${metricsOk}, Tabs: ${tabsOk}`);
      } else if (headerText) {
        log(9, 'WARN', `Dashboard partially loaded — Header: ${headerOk}, Metrics: ${metricsOk}, Tabs: ${tabsOk}`);
      } else {
        log(9, 'FAIL', `Dashboard not loaded — Header: ${headerOk}, Metrics: ${metricsOk}, Tabs: ${tabsOk}`);
      }
    } catch (err) {
      log(9, 'FAIL', `Dashboard verification error: ${err.message}`);
    }

    // ═══════════════════════════════════════════════
    // STEP 10: Find and click user menu (avatar)
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 10: Find and click user menu (avatar)');
    try {
      const headerButtons = page.locator('header button');
      const count = await headerButtons.count();
      
      if (count > 0) {
        // The last button in the header is the user avatar
        const avatarButton = headerButtons.nth(count - 1);
        await avatarButton.click();
        log(10, 'PASS', 'User menu (avatar) button clicked');
      } else {
        log(10, 'FAIL', 'No buttons found in header');
      }
    } catch (err) {
      log(10, 'FAIL', `Avatar button error: ${err.message}`);
    }

    // ═══════════════════════════════════════════════
    // STEP 11: Check if "Sair" (logout) option appears
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 11: Check for "Sair" logout option');
    try {
      await page.waitForTimeout(500);
      const sairOption = page.locator('text=Sair').first();
      const sairVisible = await sairOption.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (sairVisible) {
        log(11, 'PASS', '"Sair" (logout) option is visible in the dropdown menu');
      } else {
        log(11, 'FAIL', '"Sair" option not found in dropdown');
      }
    } catch (err) {
      log(11, 'FAIL', `Error checking for Sair: ${err.message}`);
    }

    await takeScreenshot(page, '05-user-menu-open');

    // ═══════════════════════════════════════════════
    // STEP 12: Click "Sair" to test logout
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 12: Click "Sair" to logout');
    try {
      await page.locator('text=Sair').first().click();
      log(12, 'PASS', '"Sair" logout button clicked');
    } catch (err) {
      log(12, 'FAIL', `Error clicking Sair: ${err.message}`);
    }

    // ═══════════════════════════════════════════════
    // STEP 13: Verify redirect to /login
    // ═══════════════════════════════════════════════
    console.log('\n📍 Step 13: Verify redirect to /login after logout');
    try {
      // Wait for redirect — signOut + router.push or useSession redirect
      await page.waitForURL('**/login**', { timeout: 8000 });
      const logoutUrl = page.url();
      if (logoutUrl.includes('/login')) {
        log(13, 'PASS', `Redirected to ${logoutUrl} after logout`);
      } else {
        log(13, 'FAIL', `Unexpected URL after logout: ${logoutUrl}`);
      }
    } catch (err) {
      // Check current URL
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        log(13, 'PASS', `Redirected to ${currentUrl} after logout`);
      } else {
        log(13, 'FAIL', `Not redirected to /login after logout. Current URL: ${currentUrl}`);
      }
    }

    await takeScreenshot(page, '06-after-logout');

    // ═══════════════════════════════════════════════
    // BONUS: Verify login form is accessible after logout
    // ═══════════════════════════════════════════════
    console.log('\n📍 Bonus: Verify login form is accessible after logout');
    try {
      const loginEmailVisible = await page.locator('#login-email').isVisible({ timeout: 5000 }).catch(() => false);
      if (loginEmailVisible) {
        log('B1', 'PASS', 'Login form is accessible after logout — ready for re-login');
      } else {
        log('B1', 'FAIL', 'Login form not accessible after logout');
      }
    } catch (err) {
      log('B1', 'FAIL', `Error verifying login form: ${err.message}`);
    }

  } catch (err) {
    console.error('\n💥 Unexpected test error:', err);
    log('ERR', 'FAIL', `Unexpected error: ${err.message}`);
    await takeScreenshot(page, 'error-state');
  } finally {
    await browser.close();
  }

  // ═══════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : r.status === 'WARN' ? '⚠️' : 'ℹ️';
    console.log(`  ${icon} Step ${r.step}: ${r.status}${r.detail ? ' — ' + r.detail : ''}`);
  }

  console.log(`\n  Total: ${results.length} | ✅ Passed: ${passed} | ❌ Failed: ${failed} | ⚠️ Warnings: ${warned}`);
  console.log(`  📸 Screenshots: ${SCREENSHOT_DIR}`);

  if (pageErrors.length > 0) {
    console.log(`  🐛 Page JS Errors (${pageErrors.length}):`);
    [...new Set(pageErrors)].slice(0, 5).forEach(e => console.log(`    - ${e.substring(0, 100)}`));
  }

  const e2eFlowOk = results.some(r => r.step === 7 && r.status === 'PASS')
    && results.some(r => r.step === 13 && r.status === 'PASS');

  console.log(`\n  🔗 End-to-end flow (Login → Dashboard → Logout): ${e2eFlowOk ? '✅ WORKS' : '❌ BROKEN'}`);
  console.log('='.repeat(60));

  process.exit(failed > 0 ? 1 : 0);
})();
