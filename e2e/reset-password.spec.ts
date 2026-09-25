import { test, expect } from '@playwright/test';

test.describe('Super Admin Reset Password Feature', () => {
  test('Superadmin can open reset password modal, validate input, and reset user password', async ({
    page,
    context,
  }) => {
    // 1. Generate valid JWT format for Edge proxy decoding
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        id: 'admin-super-id',
        role: 'SUPERADMIN',
        exp: Math.floor(Date.now() / 1000) + 86400,
      }),
    ).toString('base64url');
    const mockToken = `${header}.${payload}.mock-signature`;

    // 1. Setup authenticated superadmin session
    await context.addCookies([
      {
        name: 'accessToken',
        value: mockToken,
        domain: 'localhost',
        path: '/',
      },
    ]);

    // 2. Intercept API endpoints
    await page.route('**/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'admin-super-id',
          name: 'Super Admin User',
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
        body: JSON.stringify([]),
      });
    });

    await page.route('**/complaints**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/stats**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total: 10,
          pending: 2,
          inProgress: 3,
          resolved: 5,
        }),
      });
    });

    const targetUser = {
      id: 'target-user-uuid-999',
      name: 'Budi Santoso',
      email: 'budi.santoso@moklet.sch.id',
      phone_number: '081234567890',
      role: 'USER',
      userType: 'SISWA',
      isActive: true,
      unitMemberships: [],
    };

    await page.route('**/users', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([targetUser]),
        });
      } else {
        await route.continue();
      }
    });

    // Track reset-password API request
    let resetPasswordRequestPayload: any = null;
    let resetPasswordAuthHeader: string | null = null;
    let resetPasswordCalled = false;

    await page.route('**/users/*/reset-password', async (route) => {
      if (route.request().method() === 'PATCH') {
        resetPasswordCalled = true;
        resetPasswordAuthHeader = route.request().headers()['authorization'] || null;
        try {
          resetPasswordRequestPayload = JSON.parse(route.request().postData() || '{}');
        } catch {
          resetPasswordRequestPayload = null;
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Password berhasil direset',
          }),
        });
      } else {
        await route.continue();
      }
    });

    // 3. Set activeTab to members in localStorage before navigation
    await page.addInitScript(() => {
      localStorage.setItem('adminActiveTab', 'members');
    });

    // 4. Navigate to Dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 5. Ensure 'Manajemen Pengguna' tab in sidebar is clicked if needed
    const membersTabNav = page.getByRole('button', { name: 'Manajemen Pengguna' });
    if (await membersTabNav.isVisible()) {
      await membersTabNav.click();
    }

    // 5. Verify the user table shows target user Budi Santoso
    await expect(page.locator(`text=${targetUser.name}`).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${targetUser.email}`).first()).toBeVisible();

    // 6. Find and click Reset Password button for Budi Santoso
    const resetPasswordBtn = page.getByRole('button', { name: `Reset Password ${targetUser.name}` });
    await expect(resetPasswordBtn).toBeVisible();
    await resetPasswordBtn.click();

    // 7. Verify modal opens with user information
    const modalHeading = page.getByRole('heading', { name: 'Reset Password Pengguna' });
    await expect(modalHeading).toBeVisible();
    await expect(page.locator('.bg-white').filter({ hasText: targetUser.name }).first()).toBeVisible();
    await expect(page.locator('.bg-white').filter({ hasText: targetUser.email }).first()).toBeVisible();

    // 8. Test Validation: Password < 8 characters
    const passwordInput = page.getByPlaceholder(/Minimal 8 karakter/i);
    await passwordInput.fill('short');
    const submitBtn = page.getByRole('button', { name: 'Reset Password', exact: true });
    await submitBtn.click();

    // Validation error must appear and request must NOT be sent
    await expect(page.getByText('Password baru minimal 8 karakter')).toBeVisible();
    expect(resetPasswordCalled).toBe(false);

    // 9. Test password eye visibility toggle
    await passwordInput.fill('PasswordBaruPilihan123');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    const eyeToggleBtn = passwordInput.locator('..').locator('button');
    await eyeToggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await eyeToggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // 10. Submit valid password reset
    await submitBtn.click();

    // 11. Verify API was invoked with exact contract requested
    await expect(async () => {
      expect(resetPasswordCalled).toBe(true);
      expect(resetPasswordAuthHeader).toBe(`Bearer ${mockToken}`);
      expect(resetPasswordRequestPayload).toEqual({
        password: 'PasswordBaruPilihan123',
      });
    }).toPass();

    // 12. Verify toast message appears
    await expect(page.getByText('Password berhasil direset')).toBeVisible({ timeout: 5000 });

    // 13. Verify modal is closed
    await expect(modalHeading).not.toBeVisible();
  });

  test('Superadmin can cancel reset password modal and handle backend errors gracefully', async ({
    page,
    context,
  }) => {
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

    await page.route('**/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'admin-super-id',
          name: 'Super Admin User',
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

    const targetUser = {
      id: 'target-user-uuid-888',
      name: 'Dewi Lestari',
      email: 'dewi.lestari@moklet.sch.id',
      phone_number: '081298765432',
      role: 'USER',
      userType: 'GURU',
      isActive: true,
      unitMemberships: [],
    };

    await page.route('**/users', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([targetUser]),
        });
      } else {
        await route.continue();
      }
    });

    // Mock API returning error on reset password
    await page.route('**/users/*/reset-password', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'User tidak ditemukan atau nonaktif',
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.addInitScript(() => {
      localStorage.setItem('adminActiveTab', 'members');
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Open modal
    const resetPasswordBtn = page.getByRole('button', { name: `Reset Password ${targetUser.name}` });
    await expect(resetPasswordBtn).toBeVisible({ timeout: 10000 });
    await resetPasswordBtn.click();

    const modalHeading = page.getByRole('heading', { name: 'Reset Password Pengguna' });
    await expect(modalHeading).toBeVisible();

    // Test Cancel button closes the modal
    const cancelBtn = page.getByRole('button', { name: 'Batal' });
    await cancelBtn.click();
    await expect(modalHeading).not.toBeVisible();

    // Reopen modal to test backend error handling
    await resetPasswordBtn.click();
    await expect(modalHeading).toBeVisible();

    const passwordInput = page.getByPlaceholder(/Minimal 8 karakter/i);
    await passwordInput.fill('ValidPassword123');

    const submitBtn = page.getByRole('button', { name: 'Reset Password', exact: true });
    await submitBtn.click();

    // Error toast should appear
    await expect(page.getByText('User tidak ditemukan atau nonaktif')).toBeVisible({ timeout: 5000 });
  });
});

