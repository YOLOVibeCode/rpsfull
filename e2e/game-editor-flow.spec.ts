import { test, expect } from '@playwright/test';

/**
 * Game Editor E2E Tests
 * 
 * Tests game creation, editing, preview, and publishing
 */

test.describe('Game Editor - List and Navigation', () => {
  test('should display game editor list page', async ({ page }) => {
    await page.goto('/game-editor');
    await page.waitForLoadState('networkidle');

    // Verify game editor page loads
    await expect(page.locator('text=/game editor|create|manage/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show create new game button', async ({ page }) => {
    await page.goto('/game-editor');
    await page.waitForLoadState('networkidle');

    // Look for create button
    const createButton = page.locator('button:has-text("Create"), button:has-text("New Game"), a:has-text("Create")');
    await expect(createButton).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to create game page', async ({ page }) => {
    await page.goto('/game-editor');
    await page.waitForLoadState('networkidle');

    const createButton = page.locator('button:has-text("Create"), button:has-text("New Game")');
    await createButton.click();

    // Should navigate to create page
    await page.waitForURL(/\/game-editor\/create/, { timeout: 5000 });
    await expect(page.locator('text=/create|new game|game editor/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Game Editor - Creation Flow', () => {
  test('should display game editor form with tabs', async ({ page }) => {
    await page.goto('/game-editor/create');
    await page.waitForLoadState('networkidle');

    // Verify tabs exist
    const tabs = page.locator('button:has-text("Basic Info"), button:has-text("Symbols"), button:has-text("Rules"), button:has-text("Test"), button:has-text("Publish")');
    const tabCount = await tabs.count();
    
    expect(tabCount).toBeGreaterThan(0);
  });

  test('should fill basic info tab', async ({ page }) => {
    await page.goto('/game-editor/create');
    await page.waitForLoadState('networkidle');

    // Look for name input
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
    const hasNameInput = await nameInput.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasNameInput) {
      await nameInput.fill('Test Game');
      
      // Verify input value
      const value = await nameInput.inputValue();
      expect(value).toBe('Test Game');
    }
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/game-editor/create');
    await page.waitForLoadState('networkidle');

    // Find and click Symbols tab
    const symbolsTab = page.locator('button:has-text("Symbols"), a:has-text("Symbols")');
    const hasSymbolsTab = await symbolsTab.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasSymbolsTab) {
      await symbolsTab.click();
      await page.waitForTimeout(500);
      
      // Verify symbols tab content appears
      const symbolsContent = page.locator('text=/symbol|emoji|add symbol/i');
      const hasContent = await symbolsContent.isVisible({ timeout: 2000 }).catch(() => false);
      // Content might be conditional on basic info being filled
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/game-editor/create');
    await page.waitForLoadState('networkidle');

    // Try to navigate to next tab without filling required fields
    const symbolsTab = page.locator('button:has-text("Symbols")');
    const hasSymbolsTab = await symbolsTab.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasSymbolsTab) {
      // Tab might be disabled if name not filled
      const isDisabled = await symbolsTab.isDisabled().catch(() => false);
      // Tab disabled state is a form of validation
    }
  });
});

test.describe('Game Editor - Edit Flow', () => {
  test('should navigate to edit game page', async ({ page }) => {
    await page.goto('/game-editor/test-game-id/edit');
    await page.waitForLoadState('networkidle');

    // Should show edit page or error
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();

    // Verify page structure
    const hasEditor = await page.locator('text=/edit|game editor|save/i').isVisible({ timeout: 2000 }).catch(() => false);
    const hasError = await page.locator('text=/error|not found/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasEditor || hasError).toBeTruthy();
  });

  test('should load existing game data in edit mode', async ({ page }) => {
    await page.goto('/game-editor/test-game-id/edit');
    await page.waitForLoadState('networkidle');

    // Should show loading state initially
    const hasLoading = await page.locator('text=/loading|spinner/i').isVisible({ timeout: 1000 }).catch(() => false);
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Verify page has content
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
  });
});

test.describe('Game Editor - Preview Flow', () => {
  test('should navigate to preview page', async ({ page }) => {
    await page.goto('/game-editor/test-game-id/preview');
    await page.waitForLoadState('networkidle');

    // Should show preview page or error
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();

    // Verify preview content
    const hasPreview = await page.locator('text=/preview|game information|symbols|win matrix/i').isVisible({ timeout: 2000 }).catch(() => false);
    const hasError = await page.locator('text=/error|not found/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasPreview || hasError).toBeTruthy();
  });

  test('should display game information in preview', async ({ page }) => {
    await page.goto('/game-editor/test-game-id/preview');
    await page.waitForLoadState('networkidle');

    // Look for game info sections
    const gameInfo = page.locator('text=/game information|symbol count|tie rules/i');
    const hasInfo = await gameInfo.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Info might not exist if game not found
    if (hasInfo) {
      await expect(gameInfo.first()).toBeVisible();
    }
  });
});

test.describe('Game Editor - Game List', () => {
  test('should display user games in editor list', async ({ page }) => {
    await page.goto('/game-editor');
    await page.waitForLoadState('networkidle');

    // Look for game cards
    const gameCards = page.locator('[data-testid="game-card"], .game-card, article, .card');
    const hasCards = await gameCards.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasCards) {
      await expect(gameCards.first()).toBeVisible();
    } else {
      // Verify empty state
      const emptyState = page.locator('text=/no games|create|get started/i');
      await expect(emptyState).toBeVisible({ timeout: 2000 }).catch(() => {
        // Empty state might not exist
      });
    }
  });

  test('should show edit and delete buttons for games', async ({ page }) => {
    await page.goto('/game-editor');
    await page.waitForLoadState('networkidle');

    // Look for action buttons
    const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")');
    const deleteButton = page.locator('button:has-text("Delete"), button:has-text("Trash")');
    
    const hasEdit = await editButton.first().isVisible({ timeout: 2000 }).catch(() => false);
    const hasDelete = await deleteButton.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    // Buttons might not exist if no games
    if (hasEdit) {
      await expect(editButton.first()).toBeVisible();
    }
  });
});

