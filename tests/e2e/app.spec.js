import { test, expect } from '@playwright/test';

test('dashboard, catalog search and detail dialog', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Resumen general' })).toBeVisible();
  await page.screenshot({ path: 'test-results/preview-principal.png', fullPage: true });
  await page.getByRole('link', { name: 'Consultar equipos' }).click();
  await page.getByRole('textbox', { name: 'Buscar equipos' }).fill('Canon');
  // Search matches the visible name/code/category; search for the product name.
  await page.getByRole('textbox', { name: 'Buscar equipos' }).fill('EOS');
  await expect(page.locator('.equipment-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Ver detalles de Cámara EOS R50' }).click();
  await expect(page.getByRole('dialog')).toContainText('24,2 MP');
});
test('reservation persists across reload and can be cancelled', async ({ page }) => {
  await page.goto('/#reservas');
  await page.getByRole('button', { name: 'Nueva reserva' }).click();
  await page.getByRole('combobox', { name: 'Equipo', exact: true }).selectOption('EQ-007');
  await page.getByLabel('Persona responsable').fill('Prueba Automatizada');
  await page.getByLabel('Propósito').fill('Verificación del flujo');
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.reload();
  const row = page.getByRole('row').filter({ hasText: 'Prueba Automatizada' });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: /Cancelar/ }).click();
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(row).toHaveCount(0);
});
test('damaged return validates notes and updates catalog', async ({ page }) => {
  await page.goto('/#prestamos');
  await page
    .getByRole('row')
    .filter({ hasText: 'ThinkPad' })
    .getByRole('button', { name: 'Registrar devolución' })
    .click();
  await page.getByLabel('Condición del equipo').selectOption('damaged');
  await page.getByRole('dialog').getByRole('button', { name: 'Registrar devolución' }).click();
  await expect(page.getByRole('alert')).toContainText('Describe el daño');
  await page.getByLabel('Observaciones').fill('Pantalla rota');
  await page.getByRole('dialog').getByRole('button', { name: 'Registrar devolución' }).click();
  await page.goto('/#equipos');
  await expect(page.locator('.equipment-card').filter({ hasText: 'ThinkPad' })).toContainText(
    'Mantenimiento',
  );
});
test('mobile navigation and layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir navegación' }).click();
  await page.getByRole('link', { name: 'Equipos 8' }).click();
  await expect(page.getByRole('heading', { name: 'Equipos' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
