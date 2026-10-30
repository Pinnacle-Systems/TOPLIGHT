/**
 * Base Screen Object Model for Appium Mobile UI Automation
 */

export class BaseScreen {
  constructor(driver) {
    this.driver = driver;
    this.defaultTimeout = 15000;
  }

  /**
   * Find element by text with description fallback (immune to StrictSelectorError)
   */
  async findByText(text, timeout = this.defaultTimeout) {
    try {
      const element = await this.driver.$(`android=new UiSelector().textContains("${text}")`, { strict: false });
      await element.waitForDisplayed({ timeout });
      return element;
    } catch (err) {
      try {
        const descElement = await this.driver.$(`android=new UiSelector().descriptionContains("${text}")`, { strict: false });
        await descElement.waitForDisplayed({ timeout: 4000 });
        return descElement;
      } catch (_) {
        throw err;
      }
    }
  }

  /**
   * Wait for an element matching selector to disappear
   */
  async waitForElementToDisappear(selector, timeout = 8000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const visible = await this.isElementVisible(selector);
      if (!visible) return true;
      await this.driver.pause(500);
    }
    return true; // Disappeared or not present
  }

  /**
   * Find element by exact text (case-insensitive)
   */
  async findByExactText(text, timeout = this.defaultTimeout) {
    const selector = `android=new UiSelector().textMatches("(?i)^${text}$")`;
    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  /**
   * Find element by accessibility ID (testID in React Native)
   */
  async findByTestId(testId, timeout = this.defaultTimeout) {
    const selector = `~${testId}`;
    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  /**
   * Find element by XPath
   */
  async findByXPath(xpath, timeout = this.defaultTimeout) {
    const element = await this.driver.$(xpath);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  /**
   * Find an EditText input field by its zero-based index on screen
   */
  async findInputByIndex(index = 0, timeout = this.defaultTimeout) {
    const selector = `android=new UiSelector().className("android.widget.EditText").instance(${index})`;
    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  /**
   * Dismiss system autofill or permission prompts if present
   */
  async dismissSystemDialogIfPresent() {
    try {
      const notNowBtn = await this.driver.$('android=new UiSelector().textMatches("(?i).*not now.*")');
      if (await notNowBtn.isDisplayed()) {
        await notNowBtn.click();
      }
    } catch (_) {}
  }

  /**
   * Navigate back using Android system back
   */
  async goBack() {
    try {
      await this.driver.back();
    } catch (_) {}
  }

  /**
   * Tap on element found by text or content-description
   */
  async tapText(text, timeout = this.defaultTimeout) {
    const element = await this.findByText(text, timeout);
    await element.click();
  }

  /**
   * Tap Sign In button using explicit accessibility and text selectors
   */
  async tapSignIn(timeout = this.defaultTimeout) {
    const candidates = [
      '~signInButton',
      'android=new UiSelector().descriptionMatches("(?i)^sign in$")',
      'android=new UiSelector().descriptionContains("Sign In")',
      'android=new UiSelector().textMatches("(?i)^Sign In$")',
      'android=new UiSelector().textContains("Sign In")',
    ];

    for (const selector of candidates) {
      try {
        const el = await this.driver.$(selector);
        if (await el.isDisplayed().catch(() => false)) {
          await el.click();
          return true;
        }
      } catch (_) {}
    }

    await this.tapText('Sign In', timeout);
    return true;
  }

  /**
   * Enter text into an input field
   */
  async typeInto(element, value) {
    await element.clearValue();
    await element.setValue(value);
  }

  /**
   * Check if element is displayed without throwing
   */
  async isElementVisible(selector) {
    try {
      const element = await this.driver.$(selector);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Hide keyboard if active
   */
  async hideKeyboard() {
    try {
      await this.driver.hideKeyboard();
    } catch {
      // Ignored if keyboard is not open
    }
  }

  /**
   * Ensure TopLight app is in the foreground
   */
  async activateApp() {
    try {
      await this.driver.activateApp('com.frontend');
    } catch (_) {
      try {
        await this.driver.execute('mobile: startActivity', { intent: 'com.frontend/com.frontend.MainActivity' });
      } catch (e) {}
    }
  }

  /**
   * Return to Dashboard safely without exiting app to launcher
   */
  async returnToDashboard(maxTries = 4) {
    try {
      await this.activateApp();
      for (let i = 0; i < maxTries; i++) {
        const isDashboard = await this.isElementVisible('android=new UiSelector().textMatches("(?i).*workspace modules.*")');
        if (isDashboard) {
          return true;
        }

        // Try pressing back button
        await this.goBack();
        await this.driver.pause(1000);
      }
      return await this.isElementVisible('android=new UiSelector().textMatches("(?i).*workspace modules.*")');
    } catch (_) {
      return false;
    }
  }

  /**
   * Handle company code selection after login button click.
   * Polls until company code (e.g. "TLT") or "Select Your Company" appears,
   * clicks the company code, and waits for the Dashboard ("WORKSPACE MODULES") to load.
   */
  async selectCompanyIfPrompted(companyCode = 'TLT', timeout = 25000) {
    const startTime = Date.now();
    let companyClicked = false;

    // Phase 1: Wait for company selection screen to appear and click company code
    while (Date.now() - startTime < timeout) {
      await this.dismissSystemDialogIfPresent();

      // Check if already on Dashboard
      const onDashboard = await this.isElementVisible('android=new UiSelector().textContains("WORKSPACE MODULES")');
      if (onDashboard) {
        return true;
      }

      // Check if Company selection prompt or company code is visible
      if (!companyClicked) {
        const compPromptVisible = await this.isElementVisible('android=new UiSelector().textContains("Select Your Company")');
        const codeElement = await this.driver.$(`android=new UiSelector().textMatches("(?i)^${companyCode}$")`);
        const codeVisible = await codeElement.isDisplayed().catch(() => false);
        const testIdEl = await this.driver.$(`~company-${companyCode}`);
        const testIdVisible = await testIdEl.isDisplayed().catch(() => false);

        if (compPromptVisible || codeVisible || testIdVisible) {
          console.log(`  -> Company selection screen detected! Clicking company code "${companyCode}"...`);
          try {
            if (testIdVisible) {
              await testIdEl.click();
            } else if (codeVisible) {
              await codeElement.click();
            } else {
              await this.tapText(companyCode, 4000);
            }
            companyClicked = true;
            console.log(`  -> Clicked "${companyCode}". Waiting for app to reload and navigate to Dashboard...`);
            break;
          } catch (err) {
            console.warn(`  -> Retrying click on "${companyCode}": ${err.message}`);
          }
        }
      }

      await this.driver.pause(500);
    }

    // Phase 2: Wait for Dashboard ("WORKSPACE MODULES") to appear after app restart
    const reloadWaitStart = Date.now();
    while (Date.now() - reloadWaitStart < 25000) {
      await this.dismissSystemDialogIfPresent();
      const onDashboard = await this.isElementVisible('android=new UiSelector().textContains("WORKSPACE MODULES")');
      if (onDashboard) {
        console.log('  -> Home Screen (WORKSPACE MODULES) reached successfully!');
        return true;
      }
      await this.driver.pause(1000);
    }

    return false;
  }

  /**
   * Ensure user is logged in and on Dashboard
   */
  async ensureLoggedIn(username = 'siva', password = 'siva', companyCode = 'TLT') {
    try {
      await this.activateApp();

      // 1. Check if already on Dashboard
      const onDashboard = await this.isElementVisible('android=new UiSelector().textContains("WORKSPACE MODULES")');
      if (onDashboard) return;

      // 2. Check if already on Company Selection screen
      const compPrompt = await this.isElementVisible('android=new UiSelector().textContains("Select Your Company")');
      const compCodeVisible = await this.isElementVisible(`android=new UiSelector().textMatches("(?i)^${companyCode}$")`);
      if (compPrompt || compCodeVisible) {
        console.log(`  -> On company selection screen. Selecting company "${companyCode}"...`);
        await this.selectCompanyIfPrompted(companyCode, 15000);
        return;
      }

      // 3. Check if on Login screen (has "Sign In" button or username input)
      const onLogin = await this.isElementVisible('android=new UiSelector().textContains("Sign In")');
      if (onLogin) {
        console.log(`  -> Auto-logging in with account "${username}"...`);
        const uInput = await this.findInputByIndex(0, 5000);
        await this.typeInto(uInput, username);
        const pInput = await this.findInputByIndex(1, 5000);
        await this.typeInto(pInput, password);
        await this.hideKeyboard();
        
        console.log('  -> Clicking "Sign In" button...');
        await this.tapText('Sign In');

        // Wait for company code selection to appear, click it, and wait for Dashboard
        const loggedIn = await this.selectCompanyIfPrompted(companyCode, 15000);
        if (loggedIn) return;

        await this.findByText('WORKSPACE MODULES', 10000);
        return;
      }

      // 4. If on child screen, navigate back to Dashboard
      await this.returnToDashboard();
      const backOnDash = await this.isElementVisible('android=new UiSelector().textContains("WORKSPACE MODULES")');
      if (backOnDash) return;
    } catch (err) {
      console.warn('[ensureLoggedIn] Notice:', err.message);
    }
  }

  /**
   * Take screenshot for debugging test failures
   */
  async takeScreenshot(fileName) {
    try {
      await this.driver.saveScreenshot(`./e2e/mobile/screenshots/${fileName}.png`);
    } catch {
      // Ignored if screenshot folder doesn't exist
    }
  }
}

export default BaseScreen;

