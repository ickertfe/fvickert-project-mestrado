import { test, expect } from '@playwright/test';

test.describe('Bystander Flow', () => {
  test('should navigate to bystander page from landing', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Participar como Observador');

    await expect(page).toHaveURL('/bystander');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Observador/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/bystander');

    await page.click('text=Continuar');

    await expect(page.locator('text=Nome é obrigatório')).toBeVisible();
    await expect(page.locator('text=Email é obrigatório')).toBeVisible();
  });

  test('should proceed to scenario selection with valid info', async ({ page }) => {
    await page.goto('/bystander');

    await page.fill('input[placeholder="Seu nome"]', 'Test User');
    await page.fill('input[placeholder="seu@email.com"]', 'test@example.com');
    await page.click('text=Continuar');

    await expect(page.locator('text=Selecione um Cenário')).toBeVisible();
  });

  test('should display available scenarios', async ({ page }) => {
    await page.goto('/bystander');

    await page.fill('input[placeholder="Seu nome"]', 'Test User');
    await page.fill('input[placeholder="seu@email.com"]', 'test@example.com');
    await page.click('text=Continuar');

    await expect(page.locator('text=Flaming')).toBeVisible();
    await expect(page.locator('text=Exclusão Social')).toBeVisible();
    await expect(page.locator('text=Difamação')).toBeVisible();
  });
});
