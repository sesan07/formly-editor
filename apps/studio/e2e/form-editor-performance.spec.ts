import { expect, Page, test } from '@playwright/test';

async function createContactForm(page: Page) {
  await page.getByRole('button', { name: 'Create Form' }).first().click();
  const createFormDialog = page.getByRole('dialog', { name: 'Create Form' });
  await createFormDialog
    .getByRole('radio', { name: /Material Showcase\s+\u2022\s+Material\b/ })
    .check();
  await createFormDialog.getByRole('button', { name: /Create Form/ }).click();
  await expect(page.locator('core-form-builder-content')).toContainText('Name');
}

async function measure<T>(page: Page, action: () => Promise<T>) {
  const startedAt = await page.evaluate(() => performance.now());
  const result = await action();
  const finishedAt = await page.evaluate(() => performance.now());

  return { result, durationMs: Math.round((finishedAt - startedAt) * 100) / 100 };
}

test('Form Editor interaction performance smoke', async ({ page }) => {
  const measurements: Record<string, number> = {};

  await page.goto('/form-editor');
  await createContactForm(page);

  measurements.panelSwitchJsonMs = (
    await measure(page, async () => {
      await page.getByRole('button', { name: 'JSON' }).click();
      await expect(page.locator('core-json-content .cm-content')).toBeVisible();
    })
  ).durationMs;

  measurements.fieldEditMs = (
    await measure(page, async () => {
      await page.getByRole('button', { name: 'Builder' }).click();
      await page
        .locator('core-formly-field-header')
        .filter({ hasText: 'customerName' })
        .first()
        .click();
      await page.getByRole('button', { name: 'Open Field Edit panel' }).click();

      const labelInput = page.getByLabel('Label', { exact: true });
      await labelInput.fill('Performance Smoke Label');
      await expect(labelInput).toHaveValue('Performance Smoke Label');

      await page.getByRole('button', { name: 'JSON' }).click();
      await expect(page.locator('core-json-content .cm-content')).toContainText(
        '"label": "Performance Smoke Label"',
      );
    })
  ).durationMs;

  measurements.panelSwitchBuilderMs = (
    await measure(page, async () => {
      await page.getByRole('button', { name: 'Builder' }).click();
      await expect(page.locator('core-json-content .cm-content')).toBeHidden();
      await expect(page.locator('core-form-builder-content')).toBeVisible();
    })
  ).durationMs;

  measurements.previewOpenMs = (
    await measure(page, async () => {
      await page.getByRole('button', { name: 'Open preview' }).click();
      await expect(page.getByRole('dialog', { name: 'Form Preview' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog', { name: 'Form Preview' })).toBeHidden();
    })
  ).durationMs;

  measurements.importFormMs = (
    await measure(page, async () => {
      await page.getByRole('button', { name: 'Open Workspace panel' }).click();
      await expect(page.locator('core-forms-panel')).toBeVisible();
      await page.getByRole('button', { name: 'Import Form' }).click();
      const dialog = page.getByRole('dialog', { name: 'Import Form' });
      await expect(dialog).toBeVisible();
      await dialog.locator('input[name="name"]').fill('Performance Smoke Import');
      await dialog.getByRole('button', { name: 'Import Form' }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText('Performance Smoke Import', { exact: true })).toBeVisible();
    })
  ).durationMs;

  measurements.exportFormMs = (
    await measure(page, async () => {
      await page.getByRole('button', { name: 'Export Form' }).click();
      const dialog = page.getByRole('dialog', { name: 'Export Form' });
      await expect(dialog).toBeVisible();
      const downloadPromise = page.waitForEvent('download');
      await dialog.getByRole('button', { name: 'Export Form' }).click();
      await downloadPromise;
      await expect(dialog).toBeHidden();
    })
  ).durationMs;

  console.table(measurements);
  test.info().annotations.push({
    type: 'performance-measurements',
    description: JSON.stringify(measurements),
  });
});
