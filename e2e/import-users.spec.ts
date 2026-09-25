import { test, expect } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';
// Helpers ─────────────────────────────────────────────────────────────────────

function makeMockToken(role = 'SUPERADMIN') {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ id: 'admin-super-id', role, exp: Math.floor(Date.now() / 1000) + 86400 }),
  ).toString('base64url');
  return `${header}.${payload}.mock-signature`;
}

async function setupAuthAndCommonRoutes(page: import('@playwright/test').Page, context: import('@playwright/test').BrowserContext) {
  await context.addCookies([
async function setupAuthAndCommonRoutes(page: Page, context: BrowserContext) {
  ]);

  await page.route('**/users/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'admin-super-id',
        name: 'Super Admin',
        email: 'superadmin@moklet.sch.id',
        role: 'SUPERADMIN',
        userType: 'KARYAWAN',
        isActive: true,
      }),
    }),
  );

  await page.route('**/units', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
  );

  await page.route('**/complaints**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
  );

  await page.route('**/stats**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ total: 0, pending: 0, inProgress: 0, resolved: 0 }),
    }),
  );

  await page.route('**/users', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    } else {
      route.continue();
    }
  });
}

// Minimal CSV content matching the expected format
const CSV_CONTENT = `Nama,Email,Nomor HP,Role,Unit
Budi Santoso,budi@moklet.org,08123456789,Siswa,
Siti Aminah,siti@moklet.org,08987654321,Guru,Kurikulum`;

const PREVIEW_RESPONSE = {
  data: [
    { name: 'Budi Santoso', email: 'budi@moklet.org', phone_number: '08123456789', role: 'SISWA', unit: '', isValid: true, isDuplicate: false },
    { name: 'Siti Aminah', email: 'siti@moklet.org', phone_number: '08987654321', role: 'GURU', unit: 'Kurikulum', isValid: true, isDuplicate: false },
  ],
};

// Tests ───────────────────────────────────────────────────────────────────────

test.describe('Import Pengguna — Submit Import', () => {
  test('Submit Import mengirim multipart/form-data dengan field "file" dan berhasil', async ({ page, context }) => {
    await setupAuthAndCommonRoutes(page, context);

    // ── Mock preview endpoint ──────────────────────────────────────────────
    await page.route('**/users/bulk-import-preview', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(PREVIEW_RESPONSE),
      }),
    );

    // ── Intercept bulk-import and capture request details ─────────────────
    let capturedContentType: string | null = null;
    let capturedPostData: string | null = null;
    let bulkImportCalled = false;

    await page.route('**/users/bulk-import', async (route) => {
      if (route.request().method() === 'POST') {
        capturedContentType = route.request().headers()['content-type'] ?? null;
        capturedPostData = route.request().postData();
        bulkImportCalled = true;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Data berhasil diimport', totalImported: 2 }),
        });
      } else {
        await route.continue();
      }
    });

    // ── Write a temporary CSV file so Playwright can attach it ─────────────
    const tmpDir = os.tmpdir();
    const csvPath = path.join(tmpDir, 'test_import.csv');
    fs.writeFileSync(csvPath, CSV_CONTENT, 'utf-8');

    await page.addInitScript(() => {
      localStorage.setItem('adminActiveTab', 'members');
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // ── Open Import modal ─────────────────────────────────────────────────
    const importBtn = page.getByRole('button', { name: /Import Pengguna/i });
    await expect(importBtn).toBeVisible({ timeout: 10000 });
    await importBtn.click();

    const modalHeading = page.getByRole('heading', { name: 'Import Pengguna' });
    await expect(modalHeading).toBeVisible();

    // ── Step 1: upload file ───────────────────────────────────────────────
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);

    // File name should appear
    await expect(page.getByText('test_import.csv')).toBeVisible({ timeout: 5000 });

    const previewBtn = page.getByRole('button', { name: 'Preview Data' });
    await expect(previewBtn).toBeEnabled();
    await previewBtn.click();

    // ── Step 2: verify data table is shown ───────────────────────────────
    await expect(page.getByText('Total Data:')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Budi Santoso')).toBeVisible();
    await expect(page.getByText('Siti Aminah')).toBeVisible();

    // ── Step 3: click Submit Import ───────────────────────────────────────
    const submitBtn = page.getByRole('button', { name: 'Submit Import' });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // ── Assert: success toast ─────────────────────────────────────────────
    await expect(page.getByText('Data berhasil diimport')).toBeVisible({ timeout: 8000 });

    // ── Assert: bulk-import was called ───────────────────────────────────
    expect(bulkImportCalled).toBe(true);

    // ── Assert: request was multipart/form-data (must contain "file" boundary field) ──
    expect(capturedContentType).toMatch(/multipart\/form-data/i);

    // postData contains the raw multipart body; "file" field name must be present
    expect(capturedPostData).toContain('name="file"');

    // "data" field (edited rows as JSON string) must also be present
    expect(capturedPostData).toContain('name="data"');

    // Modal should close after success
    await expect(modalHeading).not.toBeVisible({ timeout: 5000 });

    // Clean up temp file
    fs.unlinkSync(csvPath);
  });

  test('Submit Import menampilkan error toast ketika backend menolak', async ({ page, context }) => {
    await setupAuthAndCommonRoutes(page, context);

    await page.route('**/users/bulk-import-preview', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(PREVIEW_RESPONSE),
      }),
    );

    // Backend returns validation error
    await page.route('**/users/bulk-import', (route) =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'File Excel wajib diunggah pada field "file"' }),
      }),
    );

    const tmpDir = os.tmpdir();
    const csvPath = path.join(tmpDir, 'test_import_err.csv');
    fs.writeFileSync(csvPath, CSV_CONTENT, 'utf-8');

    await page.addInitScript(() => {
      localStorage.setItem('adminActiveTab', 'members');
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const importBtn = page.getByRole('button', { name: /Import Pengguna/i });
    await expect(importBtn).toBeVisible({ timeout: 10000 });
    await importBtn.click();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);
    await expect(page.getByText('test_import_err.csv')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Preview Data' }).click();
    await expect(page.getByText('Total Data:')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Submit Import' }).click();

    // Error toast from backend must surface
    await expect(
      page.getByText(/File Excel wajib diunggah/i),
    ).toBeVisible({ timeout: 8000 });

    fs.unlinkSync(csvPath);
  });
});
