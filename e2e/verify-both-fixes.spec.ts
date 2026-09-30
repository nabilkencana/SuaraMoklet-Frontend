import { test, expect } from '@playwright/test';

test('Verify both fixes: Superadmin global complaints visibility and Unit status update', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });

  // ─── 1. Login as Superadmin ──────────────────────────────────────────────────
  await page.goto('http://localhost:3300/login');
  await page.waitForLoadState('networkidle');

  await page.locator('input[type="email"]').fill('admin@moklet.sch.id');
  await page.locator('input[type="password"]').fill('SuperAdmin@2026');
  await page.getByRole('button', { name: /masuk/i }).click();

  await page.waitForTimeout(3000);

  // ─── 2. Navigate to Dashboard -> Tab "Keluhan" (Daftar Keluhan Global) ──────
  await page.goto('http://localhost:3300/dashboard');
  await page.waitForLoadState('networkidle');

  const complaintsMenuBtn = page.getByRole('button', { name: /^Keluhan$/i }).first();
  await expect(complaintsMenuBtn).toBeVisible({ timeout: 10000 });
  await complaintsMenuBtn.click();
  await page.waitForTimeout(1500);

  // Verify Heading "Daftar Keluhan Global"
  await expect(page.getByRole('heading', { name: /Daftar Keluhan Global/i })).toBeVisible();

  // Verify complaint "penambahan mata pelajaran Budaya Moklet" is VISIBLE in table!
  const complaintRow = page.getByText('penambahan mata pelajaran Budaya Moklet').first();
  await expect(complaintRow).toBeVisible({ timeout: 10000 });

  // Capture Screenshot 1: Daftar Keluhan Global showing the complaint
  await page.screenshot({
    path: 'public/screenshots/fix-bug2-superadmin-complaints-list.png',
  });

  // ─── 3. Go to Unit Complaints page (/unit/complaints or /dashboard?tab=unit-complaints) ──
  // Check Kurikulum PIC login or navigate to /unit
  await page.goto('http://localhost:3300/unit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // If redirected or on unit complaints list
  // If not on unit page, login as pic.kurikulum@moklet.sch.id
  if (page.url().includes('/login') || !page.url().includes('/unit')) {
    await page.goto('http://localhost:3300/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill('pic.kurikulum@moklet.sch.id');
    await page.locator('input[type="password"]').fill('Password@123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForTimeout(3000);
    await page.goto('http://localhost:3300/unit');
    await page.waitForLoadState('networkidle');
  }

  // Verify complaint card exists in Unit Complaints
  const unitComplaintTitle = page.getByText('penambahan mata pelajaran Budaya Moklet').first();
  await expect(unitComplaintTitle).toBeVisible({ timeout: 10000 });

  // Verify initial status is "Baru"
  const statusBadge = page.locator('span:has-text("Baru")').first();
  await expect(statusBadge).toBeVisible();

  // Click "Respon Sekarang" or "Perbarui Status"
  const responBtn = page.getByRole('button', { name: /respon sekarang|perbarui status/i }).first();
  await expect(responBtn).toBeVisible();
  await responBtn.click();

  // Modal "TANGGAPI RESMI LAPORAN" should open
  const modalTitle = page.getByText(/Tanggapi Resmi Laporan/i).first();
  await expect(modalTitle).toBeVisible({ timeout: 5000 });

  // Type official response
  const textarea = page.locator('textarea').first();
  await textarea.fill('Usulan penambahan mata pelajaran Budaya Moklet telah diterima dan sedang dikaji oleh tim Kurikulum.');

  // Select "Sedang Diproses (Penanganan)"
  const selectStatus = page.locator('select').first();
  await selectStatus.selectOption('OPEN');

  // Submit response
  const submitBtn = page.getByRole('button', { name: /^Kirim$/i }).first();
  await submitBtn.click();

  // Wait for success toast
  await expect(page.getByText(/Tanggapan berhasil dikirim|berhasil/i).first()).toBeVisible({ timeout: 10000 });

  // Verify that status changed from "Baru" to "Diproses"
  await page.waitForTimeout(2000);
  const diprosesBadge = page.locator('span:has-text("Diproses")').first();
  await expect(diprosesBadge).toBeVisible({ timeout: 10000 });

  // Capture Screenshot 2: Complaint status successfully updated to "Diproses"
  await page.screenshot({
    path: 'public/screenshots/fix-bug1-status-updated-diproses.png',
  });
});
