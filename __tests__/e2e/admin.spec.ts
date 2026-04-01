import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('text=Painel Administrativo')).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('text=Total de Sessões')).toBeVisible();
    await expect(page.locator('text=Sessões Completas')).toBeVisible();
    await expect(page.locator('text=Sessões Tutor')).toBeVisible();
    await expect(page.locator('text=Sessões Observador')).toBeVisible();
  });

  test('should display scenarios table', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('text=Cenários')).toBeVisible();
    await expect(page.locator('th:has-text("Nome")')).toBeVisible();
    await expect(page.locator('th:has-text("Tipo")')).toBeVisible();
    await expect(page.locator('th:has-text("Mensagens")')).toBeVisible();
    await expect(page.locator('th:has-text("Sessões")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should display mock scenarios', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('text=Discussão Acalorada')).toBeVisible();
    await expect(page.locator('text=Exclusão do Grupo')).toBeVisible();
    await expect(page.locator('text=Rumores Falsos')).toBeVisible();
  });

  test('should have new scenario button', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('button:has-text("Novo Cenário")')).toBeVisible();
  });

  test('should have export button', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('button:has-text("Exportar CSV")')).toBeVisible();
  });

  test('should navigate back to home', async ({ page }) => {
    await page.goto('/admin');

    await page.click('text=Voltar ao Início');

    await expect(page).toHaveURL('/');
  });
});
