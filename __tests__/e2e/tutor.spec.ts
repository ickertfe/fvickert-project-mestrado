import { test, expect } from '@playwright/test';

test.describe('Tutor Flow', () => {
  test('should navigate to tutor page from landing', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Participar como Tutor');

    await expect(page).toHaveURL('/tutor');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Tutor/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/tutor');

    await page.click('text=Continuar');

    await expect(page.locator('text=Nome é obrigatório')).toBeVisible();
    await expect(page.locator('text=Email é obrigatório')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/tutor');

    await page.fill('input[placeholder="Seu nome"]', 'Test User');
    await page.fill('input[placeholder="seu@email.com"]', 'invalid-email');
    await page.click('text=Continuar');

    await expect(page.locator('text=Email inválido')).toBeVisible();
  });

  test('should proceed to scenario selection with valid info', async ({ page }) => {
    await page.goto('/tutor');

    await page.fill('input[placeholder="Seu nome"]', 'Test User');
    await page.fill('input[placeholder="seu@email.com"]', 'test@example.com');
    await page.click('text=Continuar');

    await expect(page.locator('text=Selecione um Cenário')).toBeVisible();
  });

  test('should display available scenarios', async ({ page }) => {
    await page.goto('/tutor');

    await page.fill('input[placeholder="Seu nome"]', 'Test User');
    await page.fill('input[placeholder="seu@email.com"]', 'test@example.com');
    await page.click('text=Continuar');

    await expect(page.locator('text=Flaming')).toBeVisible();
    await expect(page.locator('text=Exclusão Social')).toBeVisible();
    await expect(page.locator('text=Difamação')).toBeVisible();
  });

  test('should require scenario selection before continuing', async ({ page }) => {
    await page.goto('/tutor');

    await page.fill('input[placeholder="Seu nome"]', 'Test User');
    await page.fill('input[placeholder="seu@email.com"]', 'test@example.com');
    await page.click('text=Continuar');

    const continueButton = page.locator('button:has-text("Continuar")').last();
    await expect(continueButton).toBeDisabled();
  });

  test('should show disclaimer after selecting scenario', async ({ page }) => {
    await page.goto('/tutor');

    await page.fill('input[placeholder="Seu nome"]', 'Test User');
    await page.fill('input[placeholder="seu@email.com"]', 'test@example.com');
    await page.click('text=Continuar');

    await page.click('text=Discussão Acalorada');
    await page.click('button:has-text("Continuar")');

    await expect(page.locator('text=Termo de Consentimento')).toBeVisible();
  });
});
