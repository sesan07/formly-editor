import { expect, Page, test } from '@playwright/test';

async function createContactForm(page: Page) {
  const createFormButton = page.getByRole('button', { name: 'Create Form' }).first();
  await expect(createFormButton).toBeVisible();
  await createFormButton.click();
  const createFormDialog = page.getByRole('dialog', { name: 'Create Form' });
  await createFormDialog
    .getByRole('radio', { name: /Material Showcase\s+\u2022\s+Material\b/ })
    .check();
  await createFormDialog.getByRole('button', { name: /Create Form/ }).click();
  await expect(page.getByRole('button', { name: 'Builder' })).toBeVisible();
}

test.describe('Form Editor mobile composition', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 900 });
    await page.goto('/form-editor');
  });

  test('keeps Workspace reachable when no form is active', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/form-editor');

    await expect(page.locator('core-empty-no-form')).toBeVisible();
    await expect(page.locator('core-panel-option')).toHaveCount(7);
    await page
      .locator('core-empty-no-form')
      .getByRole('button', { name: /Open Workspace Panel/ })
      .click();
    await expect(page.getByRole('complementary')).toBeVisible();
    await expect(page.locator('core-forms-panel')).toBeVisible();
  });

  test('keeps the canvas visible and opens the panel drawer at phone width', async ({ page }) => {
    await createContactForm(page);
    await page.setViewportSize({ width: 375, height: 812 });

    await expect(page.locator('core-form-panel')).toBeVisible();
    await expect(page.locator('p-splitter')).toHaveCount(0);
    await expect(page.locator('core-panel-option')).toHaveCount(7);

    await page.getByRole('main').getByRole('button', { name: 'Open Fields panel' }).click();
    await expect(page.getByRole('complementary')).toBeVisible();
    await expect(page.getByText('Editor panels')).toBeVisible();
    await expect(page.locator('core-tablet-sidebar')).toBeVisible();
    await expect(page.locator('core-panel-option')).toHaveCount(14);
  });

  test('switches panels without losing the canvas or document context', async ({ page }) => {
    await createContactForm(page);
    await page.setViewportSize({ width: 430, height: 932 });
    const launcher = page.getByRole('main').getByRole('button', { name: 'Open Fields panel' });

    await launcher.click();
    await page.getByRole('complementary').getByRole('button', { name: 'Open Model panel' }).click();

    await expect(page.locator('core-model-edit-panel')).toBeVisible();
    await expect(page.locator('core-form-panel')).toBeVisible();
    await expect(page.locator('core-tablet-sidebar')).toBeVisible();

    await page.locator('.p-drawer-close-button').click();
    await expect(page.getByRole('complementary')).toBeHidden();
    await page.getByRole('main').getByRole('button', { name: 'Open Model panel' }).click();
    await expect(page.locator('core-model-edit-panel')).toBeVisible();
  });

  test('keeps touch-sized panel launchers in the drawer', async ({ page }) => {
    await createContactForm(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('main').getByRole('button', { name: 'Open Fields panel' }).click();

    const drawer = page.getByRole('complementary');
    await expect(drawer).toBeVisible();

    const panelLaunchers = drawer.locator('core-panel-option button');
    await expect(panelLaunchers).toHaveCount(7);
    for (let index = 0; index < (await panelLaunchers.count()); index++) {
      const box = await panelLaunchers.nth(index).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('closes when the modal backdrop is clicked', async ({ page }) => {
    await createContactForm(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('main').getByRole('button', { name: 'Open Fields panel' }).click();

    await expect(page.getByRole('complementary')).toBeVisible();
    await page.locator('.p-drawer-mask').click({ position: { x: 370, y: 400 } });
    await expect(page.getByRole('complementary')).toBeHidden();
  });

  test('dismisses with Escape and restores focus to the panel launcher', async ({ page }) => {
    await createContactForm(page);
    await page.setViewportSize({ width: 390, height: 844 });

    const launcher = page.getByRole('main').getByRole('button', { name: 'Open Fields panel' });
    await launcher.click();
    await expect(page.getByRole('complementary')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByRole('complementary')).toBeHidden();
    await expect(launcher).toBeFocused();
  });

  test('reaches drawer panels from the keyboard', async ({ page }) => {
    await createContactForm(page);
    await page.setViewportSize({ width: 390, height: 844 });

    const launcher = page.getByRole('main').getByRole('button', { name: 'Open Fields panel' });
    await launcher.focus();
    await page.keyboard.press('Enter');

    const drawer = page.getByRole('complementary');
    await expect(drawer).toBeVisible();
    const modelPanelButton = drawer.getByRole('button', { name: 'Open Model panel' });
    await modelPanelButton.focus();
    await page.keyboard.press('Enter');

    await expect(page.locator('core-model-edit-panel')).toBeVisible();
  });

  test('prevents document-level horizontal overflow', async ({ page }) => {
    await createContactForm(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('main').getByRole('button', { name: 'Open Fields panel' }).click();

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
  });

  test('switches from mobile drawer to tablet splitter at 1024px', async ({ page }) => {
    await createContactForm(page);
    await page.setViewportSize({ width: 1023, height: 768 });
    await expect(page.locator('core-form-panel')).toBeVisible();
    await expect(page.locator('p-splitter')).toHaveCount(0);

    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('p-splitter .p-splitterpanel')).toHaveCount(2);
    await expect(page.locator('core-tablet-sidebar')).toBeVisible();
  });
});
