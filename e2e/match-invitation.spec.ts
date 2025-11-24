import { test, expect } from '@playwright/test';

test.describe('Match Invitation Flow', () => {
  test('should create match with invitation and display QR code', async ({ page }) => {
    // Navigate to start game page
    await page.goto('/start-game');

    // Fill in Player 1 details
    await page.fill('input[name="player1-firstName"]', 'Rocky');
    await page.fill('input[name="player1-lastName"]', 'Rocker');
    await page.fill('input[name="player1-email"]', 'rocky@example.com');

    // Wait for email validation
    await page.waitForTimeout(1000);

    // Switch to invitation mode
    await page.click('button:has-text("Create Link")');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for invitation to be created
    await page.waitForSelector('text=Game created!', { timeout: 10000 });

    // Verify QR code is displayed
    const qrCode = page.locator('img[alt="Game invitation QR code"]');
    await expect(qrCode).toBeVisible();

    // Verify shareable link is displayed
    const shareableLink = page.locator('input[readonly]');
    await expect(shareableLink).toBeVisible();
    await expect(shareableLink).toHaveValue(/http:\/\/localhost:4445\/join-game\/[a-f0-9-]+/);

    // Verify Player 1 info is displayed
    await expect(page.locator('text=Rocky Rocker')).toBeVisible();
  });

  test('should allow copying invitation link', async ({ page }) => {
    // Navigate to start game page
    await page.goto('/start-game');

    // Fill in Player 1 details
    await page.fill('input[name="player1-firstName"]', 'Rocky');
    await page.fill('input[name="player1-lastName"]', 'Rocker');
    await page.fill('input[name="player1-email"]', 'rocky@example.com');

    // Switch to invitation mode
    await page.click('button:has-text("Create Link")');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for invitation to be created
    await page.waitForSelector('text=Game created!', { timeout: 10000 });

    // Click copy button
    await page.click('button:has-text("Copy")');

    // Verify copy success message
    await expect(page.locator('text=Copied!')).toBeVisible();

    // Verify clipboard contains the link
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toMatch(/http:\/\/localhost:4445\/join-game\/[a-f0-9-]+/);
  });

  test('should allow joining game via invitation link', async ({ page }) => {
    // First, create an invitation (simulating Player 1)
    const createPage = await page.context().newPage();
    await createPage.goto('/start-game');
    await createPage.fill('input[name="player1-firstName"]', 'Rocky');
    await createPage.fill('input[name="player1-lastName"]', 'Rocker');
    await createPage.fill('input[name="player1-email"]', 'rocky@example.com');
    await createPage.click('button:has-text("Create Link")');
    await createPage.click('button[type="submit"]');
    await createPage.waitForSelector('text=Game created!', { timeout: 10000 });

    // Get the invitation link
    const invitationLinkInput = createPage.locator('input[readonly]');
    const invitationLink = await invitationLinkInput.inputValue();
    const token = invitationLink.split('/').pop()!;

    await createPage.close();

    // Now simulate Player 2 joining
    await page.goto(`/join-game/${token}`);

    // Verify join page is displayed
    await expect(page.locator('text=Join Game')).toBeVisible();
    await expect(page.locator('text=Rocky Rocker')).toBeVisible();

    // Fill in Player 2 details
    await page.fill('input[name="firstName"]', 'Sally');
    await page.fill('input[name="lastName"]', 'Scissor');
    await page.fill('input[name="email"]', 'sally@example.com');

    // Submit join form
    await page.click('button[type="submit"]');

    // Should redirect to game page
    await page.waitForURL(/\/play\/[a-f0-9-]+/, { timeout: 10000 });
  });

  test('should show error for invalid invitation token', async ({ page }) => {
    await page.goto('/join-game/invalid-token-123');

    // Should show error message
    await expect(page.locator('text=Invalid Invitation')).toBeVisible();
    await expect(page.locator('text=Invalid or expired invitation link')).toBeVisible();
  });

  test('should display expiration time for invitation', async ({ page }) => {
    // Navigate to start game page
    await page.goto('/start-game');

    // Fill in Player 1 details
    await page.fill('input[name="player1-firstName"]', 'Rocky');
    await page.fill('input[name="player1-lastName"]', 'Rocker');
    await page.fill('input[name="player1-email"]', 'rocky@example.com');

    // Switch to invitation mode
    await page.click('button:has-text("Create Link")');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for invitation to be created
    await page.waitForSelector('text=Game created!', { timeout: 10000 });

    // Verify expiration info is displayed
    await expect(page.locator('text=Link expires in')).toBeVisible();
  });
});

test.describe('Quick Start Flow', () => {
  test('should create game with both players immediately', async ({ page }) => {
    await page.goto('/start-game');

    // Fill in Player 1 details
    await page.fill('input[name="player1-firstName"]', 'Rocky');
    await page.fill('input[name="player1-lastName"]', 'Rocker');
    await page.fill('input[name="player1-email"]', 'rocky@example.com');

    // Fill in Player 2 details
    await page.fill('input[name="player2-firstName"]', 'Sally');
    await page.fill('input[name="player2-lastName"]', 'Scissor');
    await page.fill('input[name="player2-email"]', 'sally@example.com');

    // Wait for email validation
    await page.waitForTimeout(1000);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to game page
    await page.waitForURL(/\/play\/[a-f0-9-]+/, { timeout: 10000 });
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

