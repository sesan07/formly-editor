import { expect, test } from '@playwright/test';

const routes = [
  {
    path: '/',
    title: 'Formly Studio | Visual ngx-formly Form Builder',
  },
  {
    path: '/form-editor',
    title: 'Form Editor | Formly Studio',
  },
] as const;

for (const route of routes) {
  test(`route title and static metadata: ${route.path}`, async ({ page }) => {
    await page.goto(route.path);

    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Build, preview, and export ngx-formly forms visually with Formly Studio, a visual authoring tool for Angular.',
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://formlystudio.com/',
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://formlystudio.com/',
    );
  });
}
