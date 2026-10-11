import { expect, test } from '@playwright/test';

test.describe('Form Editor desktop baseline', () => {
  test.use({ viewport: { width: 1536, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/form-editor');
    await page.evaluate(() => localStorage.removeItem('formly-studio-main-splitter-desktop'));
    await page.reload();
  });

  test('renders three resizable panes with hover-action space at desktop width', async ({
    page,
  }) => {
    const splitter = page.locator('p-splitter');
    const panels = splitter.locator('.p-splitterpanel');
    const gutters = splitter.locator('.p-splitter-gutter');

    await expect(splitter).toBeVisible();
    await expect(panels).toHaveCount(3);
    await expect(gutters).toHaveCount(2);

    const panelWidths = await panels.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().width),
    );

    expect(panelWidths[0]).toBeGreaterThanOrEqual(240);
    expect(panelWidths[2]).toBeGreaterThanOrEqual(240);
  });

  test('persists a desktop pane resize after reload', async ({ page }) => {
    const panels = page.locator('p-splitter .p-splitterpanel');
    const firstGutter = page.locator('p-splitter .p-splitter-gutter').first();
    const gutterBox = await firstGutter.boundingBox();
    expect(gutterBox).not.toBeNull();

    const initialWidths = await panels.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().width),
    );

    await page.mouse.move(
      gutterBox!.x + gutterBox!.width / 2,
      gutterBox!.y + gutterBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      gutterBox!.x + gutterBox!.width / 2 + 80,
      gutterBox!.y + gutterBox!.height / 2,
    );
    await page.mouse.up();

    const resizedWidths = await panels.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().width),
    );
    expect(resizedWidths[0]).toBeGreaterThan(initialWidths[0] + 40);

    const storedState = await page.evaluate(() =>
      localStorage.getItem('formly-studio-main-splitter-desktop'),
    );
    expect(storedState).not.toBeNull();

    await page.reload();
    await expect(panels).toHaveCount(3);
    const restoredWidths = await panels.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().width),
    );
    expect(restoredWidths[0]).toBeGreaterThan(initialWidths[0] + 40);
    expect(Math.abs(restoredWidths[0] - resizedWidths[0])).toBeLessThan(2);
  });

  test('does not render the desktop splitter below the desktop breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 1535, height: 900 });

    await expect(page.locator('p-splitter .p-splitterpanel')).toHaveCount(2);
    await expect(page.locator('core-tablet-sidebar')).toBeVisible();
    await expect(page.locator('core-lhs-sidebar, core-rhs-sidebar')).toHaveCount(0);
  });

  test('keeps route content below the compact shell header', async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1024, height: 768 },
      { width: 1536, height: 900 },
    ]) {
      await page.setViewportSize(viewport);

      const header = page.locator('app-header');
      const main = page.locator('app-root > main');
      const headerBox = await header.boundingBox();
      const mainBox = await main.boundingBox();

      expect(headerBox).not.toBeNull();
      expect(mainBox).not.toBeNull();
      expect(headerBox!.height).toBeLessThanOrEqual(51);
      expect(mainBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);
    }
  });
});
