import { expect, test } from '@playwright/test';

test.describe('Form Editor tablet composition', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  async function createContactForm(page: import('@playwright/test').Page) {
    await page.getByRole('button', { name: 'Create Form' }).first().click();
    const createFormDialog = page.getByRole('dialog', { name: 'Create Form' });
    await createFormDialog
      .getByRole('radio', { name: /Material Showcase\s+\u2022\s+Material\b/ })
      .check();
    await createFormDialog.getByRole('button', { name: /Create Form/ }).click();
    await expect(page.getByRole('button', { name: 'Builder' })).toBeVisible();
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/form-editor');
    await page.evaluate(() => localStorage.removeItem('formly-studio-main-splitter-tablet'));
    await page.reload();
  });

  test('renders all panels beside the canvas without document overflow', async ({ page }) => {
    const splitter = page.locator('p-splitter');

    await expect(splitter).toBeVisible();
    await expect(splitter.locator('.p-splitterpanel')).toHaveCount(2);
    await expect(page.locator('core-tablet-sidebar')).toBeVisible();
    await expect(page.locator('core-lhs-sidebar, core-rhs-sidebar')).toHaveCount(0);
    await expect(page.locator('core-panel-option')).toHaveCount(7);
    await expect(page.locator('core-form-panel')).toBeVisible();

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
  });

  test('switches the unified panel body while keeping the canvas visible', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Fields panel' }).click();
    await expect(page.locator('core-fields-panel')).toBeVisible();
    await expect(page.locator('core-forms-panel')).toHaveCount(0);
    await expect(page.locator('core-form-panel')).toBeVisible();

    await page.getByRole('button', { name: 'Open Model panel' }).click();
    await expect(page.locator('core-model-edit-panel')).toBeVisible();
    await expect(page.locator('core-fields-panel')).toHaveCount(0);
  });

  test('reaches each unified panel workflow', async ({ page }) => {
    const panelNavigation = page.locator('core-tablet-sidebar');
    const panels = [
      ['Workspace', 'core-forms-panel'],
      ['Fields', 'core-fields-panel'],
      ['Add Field', 'core-add-field-panel'],
      ['Field Edit', 'core-field-edit-panel'],
      ['Styling', 'core-styling-panel'],
      ['Model', 'core-model-edit-panel'],
    ] as const;

    for (const [label, selector] of panels) {
      await panelNavigation.getByRole('button', { name: `Open ${label} panel` }).click();
      await expect(page.locator(selector)).toBeVisible();
    }
  });

  test('persists a tablet pane resize after reload', async ({ page }) => {
    await createContactForm(page);
    const panels = page.locator('p-splitter .p-splitterpanel');
    const gutterHandle = page.locator('p-splitter .p-splitter-gutter-handle').first();
    await expect(gutterHandle).toBeVisible();

    const initialWidths = await panels.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().width),
    );

    await gutterHandle.focus();
    for (let index = 0; index < 10; index++) {
      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(50);
      await page.keyboard.up('ArrowRight');
    }

    const resizedWidths = await panels.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().width),
    );
    expect(resizedWidths[0]).toBeGreaterThan(initialWidths[0] + 40);

    const storedState = await page.evaluate(() =>
      localStorage.getItem('formly-studio-main-splitter-tablet'),
    );
    expect(storedState).not.toBeNull();

    await page.reload();
    await expect(page.locator('p-splitter')).toBeVisible();
    await expect(panels).toHaveCount(2);
    const restoredWidths = await panels.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().width),
    );
    expect(restoredWidths[0]).toBeGreaterThan(initialWidths[0] + 40);
    expect(Math.abs(restoredWidths[0] - resizedWidths[0])).toBeLessThan(2);
  });

  test('uses the tablet composition at the upper breakpoint boundary', async ({ page }) => {
    await page.setViewportSize({ width: 1535, height: 900 });

    await expect(page.locator('core-tablet-sidebar')).toBeVisible();
    await expect(page.locator('p-splitter .p-splitterpanel')).toHaveCount(2);
    await expect(page.locator('core-lhs-sidebar, core-rhs-sidebar')).toHaveCount(0);
  });

  test('preserves the active panel when switching to desktop composition', async ({ page }) => {
    await page.setViewportSize({ width: 1535, height: 900 });
    await page.getByRole('button', { name: 'Open Model panel' }).click();
    await expect(page.locator('core-model-edit-panel')).toBeVisible();

    await page.setViewportSize({ width: 1536, height: 900 });

    await expect(page.locator('p-splitter .p-splitterpanel')).toHaveCount(3);
    await expect(page.locator('core-tablet-sidebar')).toHaveCount(0);
    await expect(page.locator('core-rhs-sidebar core-model-edit-panel')).toBeVisible();
  });
});
