import { test, expect } from '@playwright/test';

test('Homepage has correct title and displays create button', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Demoucron/i);

  // Expect the main heading to be visible
  await expect(page.getByRole('heading', { name: /Mes Projets/i })).toBeVisible();

  // Expect the create project button to be visible
  await expect(page.getByRole('button', { name: /Nouveau Projet/i })).toBeVisible();
});
