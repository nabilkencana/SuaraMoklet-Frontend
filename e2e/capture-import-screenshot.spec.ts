import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';

test('Capture screenshots of CSV import with phone number as string', async ({ page, context }) => {
  // 1. Mock token & APIs
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      id: 'admin-super-id',
      role: 'SUPERADMIN',
      email: 'superadmin@moklet.sch.id',
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  ).toString('base64url');
  const mockToken = `${header}.${payload}.mock-signature`;

  await context.addCookies([
    { name: 'accessToken', value: mockToken, domain: 'localhost', path: '/' },
  ]);

  await page.route('**/users/me', async (route) => {
    await route.fulfill({
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
    });
  });

  await page.route('**/units', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 'u1', name: 'Kurikulum' },
        { id: 'u2', name: 'Kesiswaan' },
        { id: 'u3', name: 'Sarpras' },
      ]),
    });
  });

  await page.route('**/audit-logs**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"data":[]}' });
  });
  await page.route('**/complaints/auto-close**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"daysToClose":3}' });
  });
  await page.route('**/complaints**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await page.route('**/notifications**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await page.route('**/whatsapp**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"isConnected":false}' });
  });

  await page.route('**/stats**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"total":0}' });
  });

  await page.route('**/users', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'u-1',
            name: 'Budi Santoso',
            email: 'budi@moklet.org',
            role: 'USER',
            userType: 'SISWA',
            phone_number: '08123456789',
            isActive: true,
            unitMemberships: [],
          },
        ]),
      });
    } else {
      await route.continue();
    }
  });

  const previewData = [
    {
      name: 'Budi Santoso',
      email: 'budi@moklet.org',
      phone_number: '08123456789',
      role: 'SISWA',
      unit: '',
      isValid: true,
      isDuplicate: false,
      errors: [],
    },
    {
      name: 'Siti Aminah',
      email: 'siti@moklet.org',
      phone_number: '08987654321',
      role: 'GURU',
      unit: 'Kurikulum',
      isValid: true,
      isDuplicate: false,
      errors: [],
    },
    {
      name: 'Agus Supriyanto',
      email: 'agus@example.com',
      phone_number: '08111222333',
      role: 'ORANGTUA',
      unit: '',
      isValid: true,
      isDuplicate: false,
      errors: [],
    },
  ];

  await page.route('**/users/bulk-import-preview', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: previewData }),
    });
  });

  await page.route('**/users/bulk-import', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Data pengguna dari file CSV berhasil diimport',
        totalImported: 3,
      }),
    });
  });

  // Prepare CSV file on disk
  const csvContent = [
    'Nama,Email,Nomor HP,Role,Unit',
    'Budi Santoso,budi@moklet.org,08123456789,Siswa,',
    'Siti Aminah,siti@moklet.org,08987654321,Guru,Kurikulum',
    'Agus Supriyanto,agus@example.com,08111222333,Orangtua,',
  ].join('\n');
  const tempCsvPath = path.join(os.tmpdir(), 'data_pengguna_moklet.csv');
  fs.writeFileSync(tempCsvPath, csvContent, 'utf-8');

  // Activate members tab
  await page.addInitScript(() => {
    localStorage.setItem('adminActiveTab', 'members');
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  // Open Import Modal
  const importBtn = page.getByRole('button', { name: /^Import$/i });
  await expect(importBtn).toBeVisible({ timeout: 10000 });
  await importBtn.click();

  const modalHeading = page.getByRole('heading', { name: 'Import Pengguna' });
  await expect(modalHeading).toBeVisible();

  // Screenshot 1: Step 1 dialog showing CSV format preview with string phone number note
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'public/screenshots/import-csv-step1-format.png',
  });

  // Select CSV file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(tempCsvPath);
  await expect(page.getByText('data_pengguna_moklet.csv')).toBeVisible({ timeout: 5000 });

  // Click Preview Data button
  const previewBtn = page.getByRole('button', { name: 'Preview Data' });
  await expect(previewBtn).toBeEnabled();
  await previewBtn.click();

  // Wait for Step 2 preview
  await expect(page.getByText('Total Data: 3')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('input[value="08123456789"]')).toBeVisible();
  await expect(page.locator('input[value="08987654321"]')).toBeVisible();
  await expect(page.locator('input[value="08111222333"]')).toBeVisible();

  await page.waitForTimeout(600);
  // Screenshot 2: Step 2 preview showing imported CSV phone numbers as string with leading 0 preserved
  await page.screenshot({
    path: 'public/screenshots/import-csv-step2-preview.png',
  });

  // Click Submit Import
  const submitBtn = page.getByRole('button', { name: 'Submit Import' });
  await submitBtn.click();

  // Verify toast
  await expect(
    page.getByText('Data pengguna dari file CSV berhasil diimport'),
  ).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(600);

  // Screenshot 3: Success state with toast notification
  await page.screenshot({
    path: 'public/screenshots/import-csv-step3-success.png',
  });

  // Cleanup
  fs.unlinkSync(tempCsvPath);
});
