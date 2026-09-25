import { test, expect } from '@playwright/test';
import path from 'path';

test('Capture screenshots of reset password UI', async ({ page, context }) => {
  const artifactDir = '/Users/nabilkencana/.gemini/antigravity-ide/brain/e861dad9-8b97-4de8-b82d-3417ba584d5e';

  // 1. Generate valid JWT for Superadmin
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      id: 'admin-super-id',
      role: 'SUPERADMIN',
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  ).toString('base64url');
  const mockToken = `${header}.${payload}.mock-signature`;

  await context.addCookies([
    {
      name: 'accessToken',
      value: mockToken,
      domain: 'localhost',
      path: '/',
    },
  ]);

  // 2. Mock APIs
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
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await page.route('**/complaints**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await page.route('**/stats**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"total":0}' });
  });

  const mockUsers = [
    {
      id: 'user-1',
      name: 'Budi Santoso',
      email: 'budi.santoso@moklet.sch.id',
      phone_number: '081234567890',
      role: 'USER',
      userType: 'SISWA',
      isActive: true,
      unitMemberships: [],
    },
    {
      id: 'user-2',
      name: 'Siti Rahmawati',
      email: 'siti.rahmawati@moklet.sch.id',
      phone_number: '081298765432',
      role: 'USER',
      userType: 'GURU',
      isActive: true,
      unitMemberships: [],
    },
    {
      id: 'user-3',
      name: 'Rian Saputra',
      email: 'rian.saputra@moklet.sch.id',
      phone_number: '082155554444',
      role: 'UNIT_MEMBER',
      userType: 'KARYAWAN',
      isActive: true,
      unitMemberships: [{ id: 'm-1', unitId: 'u-1', unit: { id: 'u-1', name: 'Sarpras' } }],
    },
  ];

  await page.route('**/users', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUsers),
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/users/*/reset-password', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Password berhasil direset' }),
    });
  });

  // Activate members tab
  await page.addInitScript(() => {
    localStorage.setItem('adminActiveTab', 'members');
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dashboard');
  await page.waitForLoadState('domcontentloaded');

  // Verify table is loaded
  await expect(page.locator('text=Budi Santoso').first()).toBeVisible({ timeout: 10000 });

  // Hover over the reset password button to show tooltip
  const resetBtn = page.getByRole('button', { name: 'Reset Password Budi Santoso' });
  await resetBtn.hover();
  await page.waitForTimeout(500);

  // Capture screenshot 1: Table view with Reset Password button
  await page.screenshot({
    path: path.join(artifactDir, 'members_table_reset_button.png'),
    fullPage: false,
  });

  // Click Reset Password button to open modal
  await resetBtn.click();
  const modalHeading = page.getByRole('heading', { name: 'Reset Password Pengguna' });
  await expect(modalHeading).toBeVisible();

  // Fill in sample password
  const passwordInput = page.getByPlaceholder(/Minimal 8 karakter/i);
  await passwordInput.fill('PasswordBaruPilihan123');

  // Toggle eye visibility so user sees entered password
  const eyeToggleBtn = passwordInput.locator('..').locator('button');
  await eyeToggleBtn.click();
  await page.waitForTimeout(500);

  // Capture screenshot 2: Modal open with target user & new password
  await page.screenshot({
    path: path.join(artifactDir, 'reset_password_modal.png'),
    fullPage: false,
  });

  // Submit form to trigger toast
  const submitBtn = page.getByRole('button', { name: 'Reset Password', exact: true });
  await submitBtn.click();

  // Wait for toast
  await expect(page.getByText('Password berhasil direset')).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(600);

  // Capture screenshot 3: Success toast message
  await page.screenshot({
    path: path.join(artifactDir, 'reset_password_success.png'),
    fullPage: false,
  });
});
