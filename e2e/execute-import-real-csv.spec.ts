import { test, expect } from '@playwright/test';
import path from 'path';

test('Execute real CSV import via web UI and verify success', async ({ page }) => {
  test.setTimeout(90000);

  // Set viewport
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Go to Login page
  await page.goto('http://localhost:3300/login');
  await page.waitForLoadState('networkidle');

  // 2. Login as Superadmin
  await page.locator('input[type="email"]').fill('admin@moklet.sch.id');
  await page.locator('input[type="password"]').fill('SuperAdmin@2026');
  await page.getByRole('button', { name: /masuk/i }).click();

  // Wait for login redirect
  await page.waitForTimeout(3000);

  // 3. Go to Dashboard
  await page.goto('http://localhost:3300/dashboard');
  await page.waitForLoadState('networkidle');

  // Activate members tab
  const membersTabBtn = page.getByRole('button', { name: /manajemen pengguna/i }).first();
  await expect(membersTabBtn).toBeVisible({ timeout: 10000 });
  await membersTabBtn.click();
  await page.waitForTimeout(1000);

  // 4. Click Import Button
  const importBtn = page.getByRole('button', { name: /^Import$/i });
  await expect(importBtn).toBeVisible({ timeout: 10000 });
  await importBtn.click();

  const modalHeading = page.getByRole('heading', { name: 'Import Pengguna' });
  await expect(modalHeading).toBeVisible({ timeout: 5000 });

  // 5. Attach the real CSV file
  const realCsvPath = '/Users/nabilkencana/Downloads/format_import_pengguna.csv';
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(realCsvPath);

  // Verify file is selected
  await expect(page.getByText('format_import_pengguna.csv')).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(600);

  // Screenshot 1: Modal Step 1 with CSV file attached
  await page.screenshot({
    path: 'public/screenshots/real-csv-import-step1.png',
  });

  // 6. Click Preview Data
  const previewBtn = page.getByRole('button', { name: 'Preview Data' });
  await expect(previewBtn).toBeEnabled();
  await previewBtn.click();

  // 7. Verify Step 2 preview
  await expect(page.getByText('Total Data: 154')).toBeVisible({ timeout: 20000 });
  // Verify error is 0
  await expect(page.getByText('Error: 0')).toBeVisible();

  // Verify phone numbers are present as strings with leading 0
  await expect(page.locator('input[value="085100147183"]')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('input[value="081233654155"]')).toBeVisible();

  await page.waitForTimeout(800);

  // Screenshot 2: Modal Step 2 with 154 records previewed and string phone numbers
  await page.screenshot({
    path: 'public/screenshots/real-csv-import-step2.png',
  });

  // 8. Submit Import
  const submitBtn = page.getByRole('button', { name: 'Submit Import' });
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();

  // 9. Verify success toast
  const successToast = page.getByText(/Data berhasil diimport|berhasil/i).first();
  await expect(successToast).toBeVisible({ timeout: 30000 });

  // Modal should close
  await expect(modalHeading).not.toBeVisible({ timeout: 10000 });

  // Wait for table to reload users
  await page.waitForTimeout(2000);

  // Screenshot 3: Dashboard with imported users displayed
  await page.screenshot({
    path: 'public/screenshots/real-csv-import-step3.png',
  });
});
