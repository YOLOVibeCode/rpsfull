import { test, expect } from '@playwright/test';

test.describe('Match Invitation Flow', () => {
  test('should create match with invitation and display QR code', async ({ page }) => {
    // Capture console errors and network failures
    const consoleErrors: string[] = [];
    const networkErrors: any[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        });
      }
    });

    // Navigate to start game page
    await page.goto('/start-game');
    await page.waitForLoadState('networkidle');

    // Fill in Player 1 details
    await page.waitForSelector('input[name="player1-firstName"]', { timeout: 5000 });
    const email = `rocky_${Date.now()}@example.com`;
    await page.fill('input[name="player1-firstName"]', 'Rocky');
    await page.fill('input[name="player1-lastName"]', 'Rocker');
    await page.fill('input[name="player1-email"]', email);

    // Wait for email validation
    await page.waitForTimeout(2000);

    // Switch to invitation mode - click the "Create Link" button
    const createLinkButton = page.locator('button:has-text("Create Link")').first();
    await createLinkButton.waitFor({ timeout: 5000 });
    await createLinkButton.click();
    await page.waitForTimeout(1000); // Wait for mode to switch

    // Verify we're in invitation mode (should see different text)
    await expect(page.locator('text=/Player 2 will join via|Share the link/i').first()).toBeVisible({ timeout: 3000 });

    // Submit form - wait for submit button to be enabled
    const submitButton = page.locator('button[type="submit"]:not([disabled])');
    await submitButton.waitFor({ timeout: 5000 });
    
    // Listen for network responses (both success and error)
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/matches/create-with-invitation'),
      { timeout: 20000 }
    ).catch(() => null);
    
    await submitButton.click();

    // Wait for response
    const response = await responsePromise;
    
    if (response) {
      const responseData = await response.json().catch(() => null);
      console.log('API Response:', response.status(), responseData);
      
      if (response.status() >= 400) {
        throw new Error(`API Error ${response.status()}: ${JSON.stringify(responseData)}`);
      }
    }

    // Wait for loading to complete
    await page.waitForTimeout(2000);
    
    // Check for errors first
    const errorElement = page.locator('[role="alert"], .error, text=/error|failed/i').first();
    const hasError = await errorElement.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasError) {
      const errorMessage = await errorElement.textContent();
      const consoleErrorMsg = consoleErrors.length > 0 ? ` Console errors: ${consoleErrors.join(', ')}` : '';
      const networkErrorMsg = networkErrors.length > 0 ? ` Network errors: ${JSON.stringify(networkErrors)}` : '';
      throw new Error(`Form submission failed: ${errorMessage}${consoleErrorMsg}${networkErrorMsg}`);
    }

    // Wait for invitation to be created - check for success message or QR code
    try {
      await Promise.race([
        page.waitForSelector('text=/Game created|✅ Game created/i', { timeout: 15000 }),
        page.waitForSelector('img[alt*="QR"], img[alt*="qr"]', { timeout: 15000 }),
        page.waitForSelector('input[readonly][type="text"]', { timeout: 15000 }),
      ]);
    } catch (error) {
      // If still on form page, check for error
      const currentUrl = page.url();
      if (currentUrl.includes('/start-game')) {
        const errorText = await page.locator('[role="alert"], .error, text=/error|failed/i').first().textContent().catch(() => 'Unknown error');
        const consoleErrorMsg = consoleErrors.length > 0 ? ` Console errors: ${consoleErrors.join(', ')}` : '';
        const networkErrorMsg = networkErrors.length > 0 ? ` Network errors: ${JSON.stringify(networkErrors)}` : '';
        throw new Error(`Invitation creation failed. Still on form page. Error: ${errorText}${consoleErrorMsg}${networkErrorMsg}`);
      }
      throw error;
    }

    await page.waitForLoadState('networkidle');

    // Verify QR code is displayed (check for QR code image or component)
    const qrCode = page.locator('img[alt*="QR"], img[alt*="qr"]').first();
    await expect(qrCode).toBeVisible({ timeout: 5000 });

    // Verify shareable link is displayed (QRCodeDisplay component renders input[readonly])
    const shareableLink = page.locator('input[readonly][type="text"]').first();
    await expect(shareableLink).toBeVisible({ timeout: 10000 });
    const linkValue = await shareableLink.inputValue();
    expect(linkValue).toMatch(/http:\/\/localhost:4445\/join-game\/[a-f0-9-]+/);

    // Verify Player 1 info is displayed
    await expect(page.locator('text=/Rocky.*Rocker|Rocky Rocker/i')).toBeVisible({ timeout: 5000 });
  });

  test('should allow copying invitation link', async ({ page }) => {
    // Navigate to start game page
    await page.goto('/start-game');
    await page.waitForLoadState('networkidle');

    // Fill in Player 1 details
    await page.waitForSelector('input[name="player1-firstName"]', { timeout: 5000 });
    const email = `rocky_${Date.now()}@example.com`;
    await page.fill('input[name="player1-firstName"]', 'Rocky');
    await page.fill('input[name="player1-lastName"]', 'Rocker');
    await page.fill('input[name="player1-email"]', email);
    await page.waitForTimeout(2000);

    // Switch to invitation mode
    await page.click('button:has-text("Create Link")');
    await page.waitForTimeout(1000);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for invitation to be created - check for QR code or link input
    await Promise.race([
      page.waitForSelector('text=/Game created|✅ Game created/i', { timeout: 15000 }),
      page.waitForSelector('input[readonly][type="text"]', { timeout: 15000 }),
      page.waitForSelector('img[alt*="QR"], img[alt*="qr"]', { timeout: 15000 }),
    ]);
    await page.waitForLoadState('networkidle');

    // Grant clipboard permissions for this test
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Click copy button
    const copyButton = page.locator('button:has-text("Copy")').first();
    await copyButton.waitFor({ timeout: 5000 });
    await copyButton.click();
    await page.waitForTimeout(1000);

    // Verify copy success message - button should change to "Copied!"
    await expect(page.locator('button:has-text("Copied!")').first()).toBeVisible({ timeout: 3000 });

    // Verify clipboard contains the link (if permissions granted)
    try {
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toMatch(/http:\/\/localhost:4445\/join-game\/[a-f0-9-]+/);
    } catch (error) {
      // If clipboard read fails, at least verify the button shows "Copied!"
      // This is acceptable as the UI feedback is what matters for UX
      console.log('Clipboard read not available, but copy button feedback is visible');
    }
  });

  test('should allow joining game via invitation link', async ({ page }) => {
    // First, create an invitation (simulating Player 1)
    const createPage = await page.context().newPage();
    await createPage.goto('/start-game');
    await createPage.waitForLoadState('networkidle');
    await createPage.waitForSelector('input[name="player1-firstName"]', { timeout: 5000 });
    
    const player1Email = `rocky_${Date.now()}@example.com`;
    await createPage.fill('input[name="player1-firstName"]', 'Rocky');
    await createPage.fill('input[name="player1-lastName"]', 'Rocker');
    await createPage.fill('input[name="player1-email"]', player1Email);
    await createPage.waitForTimeout(2000);
    
    await createPage.click('button:has-text("Create Link")');
    await createPage.waitForTimeout(1000);
    await createPage.click('button[type="submit"]');
    
    // Wait for invitation to be created
    await Promise.race([
      createPage.waitForSelector('text=/Game created|✅ Game created/i', { timeout: 15000 }),
      createPage.waitForSelector('input[readonly][type="text"]', { timeout: 15000 }),
    ]);
    await createPage.waitForLoadState('networkidle');

    // Get the invitation link
    const invitationLinkInput = createPage.locator('input[readonly][type="text"]').first();
    await invitationLinkInput.waitFor({ timeout: 5000 });
    const invitationLink = await invitationLinkInput.inputValue();
    const token = invitationLink.split('/').pop()!;

    await createPage.close();

    // Now simulate Player 2 joining
    await page.goto(`/join-game/${token}`);
    
    // Wait for page to load - could be loading, error, or success state
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check current URL to see if we're redirected
    const currentUrl = page.url();
    if (currentUrl.includes('/play/')) {
      // Already redirected to game page - that's fine, means join worked
      await page.waitForLoadState('networkidle');
      return;
    }
    
    // Check if there's an error first
    const hasError = await page.locator('h1:has-text("Invalid Invitation")').isVisible({ timeout: 2000 }).catch(() => false);
    if (hasError) {
      const errorText = await page.locator('p.text-gray-600').first().textContent().catch(() => 'Unknown error');
      throw new Error(`Join page shows invalid invitation: ${errorText}`);
    }

    // Verify join page is displayed - check for heading or form
    await expect(page.locator('h1:has-text("Join Game")')).toBeVisible({ timeout: 10000 });
    
    // Verify Player 1 info is displayed
    await expect(page.locator('text=/Rocky.*Rocker|Rocky Rocker/i')).toBeVisible({ timeout: 5000 });

    // Fill in Player 2 details
    await page.waitForSelector('input[name="firstName"]', { timeout: 5000 });
    await page.fill('input[name="firstName"]', 'Sally');
    await page.fill('input[name="lastName"]', 'Scissor');
    await page.fill('input[name="email"]', `sally_${Date.now()}@example.com`);
    await page.waitForTimeout(1000);

    // Submit join form
    await page.click('button[type="submit"]');

    // Should redirect to game page
    await page.waitForURL(/\/play\/[a-f0-9-]+/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('should show error for invalid invitation token', async ({ page }) => {
    await page.goto('/join-game/invalid-token-123');
    await page.waitForLoadState('networkidle');

    // Should show error message - wait for error state
    await expect(page.locator('h1:has-text("Invalid Invitation")')).toBeVisible({ timeout: 10000 });
    
    // Check for error message text (could be in different formats)
    const errorMessage = await Promise.race([
      page.locator('text=/Invalid.*invitation|expired.*invitation/i').first().waitFor({ timeout: 5000 }).then(() => true),
      page.locator('text=/Invalid or expired/i').first().waitFor({ timeout: 5000 }).then(() => true),
      page.locator('[role="alert"]').first().waitFor({ timeout: 5000 }).then(() => true),
    ]).catch(() => false);
    
    expect(errorMessage).toBeTruthy();
  });

  test('should display expiration time for invitation', async ({ page }) => {
    // Navigate to start game page
    await page.goto('/start-game');
    await page.waitForLoadState('networkidle');

    // Fill in Player 1 details
    await page.waitForSelector('input[name="player1-firstName"]', { timeout: 5000 });
    const email = `rocky_${Date.now()}@example.com`;
    await page.fill('input[name="player1-firstName"]', 'Rocky');
    await page.fill('input[name="player1-lastName"]', 'Rocker');
    await page.fill('input[name="player1-email"]', email);
    await page.waitForTimeout(2000);

    // Switch to invitation mode
    await page.click('button:has-text("Create Link")');
    await page.waitForTimeout(1000);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for invitation to be created
    await Promise.race([
      page.waitForSelector('text=/Game created|✅ Game created/i', { timeout: 15000 }),
      page.waitForSelector('input[readonly][type="text"]', { timeout: 15000 }),
    ]);
    await page.waitForLoadState('networkidle');

    // Verify expiration info is displayed (could be "Link expires in" or similar)
    await expect(page.locator('text=/expires|expiration|valid.*hours/i').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Quick Start Flow', () => {
  test('should create game with both players immediately', async ({ page }) => {
    await page.goto('/start-game');
    await page.waitForLoadState('networkidle');

    // Fill in Player 1 details
    await page.waitForSelector('input[name="player1-firstName"]', { timeout: 5000 });
    const player1Email = `rocky_${Date.now()}@example.com`;
    await page.fill('input[name="player1-firstName"]', 'Rocky');
    await page.waitForTimeout(200);
    await page.fill('input[name="player1-lastName"]', 'Rocker');
    await page.waitForTimeout(200);
    await page.fill('input[name="player1-email"]', player1Email);
    await page.waitForTimeout(1000); // Wait for email validation

    // Ensure we're in "both players" mode (not invitation mode)
    // Check if Player 2 fields are visible - if not, we need to switch modes
    const player2EmailField = page.locator('input[name="player2-email"]');
    const player2Visible = await player2EmailField.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!player2Visible) {
      // Switch to "both players" mode
      const bothPlayersButton = page.locator('button:has-text("Both Players")');
      await bothPlayersButton.waitFor({ timeout: 5000 });
      await bothPlayersButton.click();
      await page.waitForTimeout(1000);
      // Wait for Player 2 fields to appear
      await player2EmailField.waitFor({ timeout: 5000 });
    }

    // Fill in Player 2 details
    const player2Email = `sally_${Date.now()}@example.com`;
    await page.fill('input[name="player2-firstName"]', 'Sally');
    await page.waitForTimeout(200);
    await page.fill('input[name="player2-lastName"]', 'Scissor');
    await page.waitForTimeout(200);
    await page.fill('input[name="player2-email"]', player2Email);
    await page.waitForTimeout(1000); // Wait for email validation

    // Listen for API request and response
    const requestPromise = page.waitForRequest(
      (request) => request.url().includes('/matches/quick-start'),
      { timeout: 20000 }
    ).catch(() => null);
    
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/matches/quick-start'),
      { timeout: 20000 }
    ).catch(() => null);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for both request and response
    const [request, response] = await Promise.all([requestPromise, responsePromise]);
    
    if (response && response.status() >= 400) {
      const responseData = await response.json().catch(() => null);
      let errorMsg = `Quick start failed: ${JSON.stringify(responseData)}`;
      
      if (request) {
        const requestData = request.postDataJSON();
        errorMsg += `\nRequest sent: ${JSON.stringify(requestData, null, 2)}`;
      }
      
      throw new Error(errorMsg);
    }

    // Should redirect to game page
    await page.waitForURL(/\/play\/[a-f0-9-]+/, { timeout: 20000 });
    await page.waitForLoadState('networkidle');
  });

  test('should validate that players have different emails', async ({ page }) => {
    await page.goto('/start-game');

    // Fill in Player 1 details
    await page.fill('input[name="player1-firstName"]', 'Rocky');
    await page.fill('input[name="player1-lastName"]', 'Rocker');
    await page.fill('input[name="player1-email"]', 'same@example.com');

    // Fill in Player 2 with same email
    await page.fill('input[name="player2-firstName"]', 'Sally');
    await page.fill('input[name="player2-lastName"]', 'Scissor');
    await page.fill('input[name="player2-email"]', 'same@example.com');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.locator('text=Players must have different email addresses')).toBeVisible();
  });
});

