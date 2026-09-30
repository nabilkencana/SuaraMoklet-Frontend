import { test, expect } from '@playwright/test';

test('Test status update in Unit Complaints from BARU to DIPROSES and DONE', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 900 });

  // Reset test complaint to NEW
  const adminLogin = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@moklet.sch.id', password: 'SuperAdmin@2026' }),
  });
  const adminData = await adminLogin.json();
  await fetch('http://localhost:4000/api/complaints/805bec69-8a8b-41b8-90d1-4020999f3b0a/status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminData.accessToken}`,
    },
    body: JSON.stringify({ status: 'NEW' }),
  });
  // 1. Login as Kepala Unit Kurikulum
  await page.goto('http://localhost:3300/login');
  await page.waitForLoadState('networkidle');

  await page.locator('input[type="email"]').fill('pic.kurikulum@moklet.sch.id');
  await page.locator('input[type="password"]').fill('Password@123');
  await page.getByRole('button', { name: /masuk/i }).click();

  await page.waitForTimeout(3000);

  // 2. Open /dashboard?tab=keluhan
  await page.goto('http://localhost:3300/dashboard?tab=keluhan');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // 3. Verify complaint card and initial status "BARU"
  await expect(page.getByText('penambahan mata pelajaran Budaya Moklet')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('span:has-text("BARU")').first()).toBeVisible();

  // 4. Click "Respon Sekarang"
  const responBtn = page.getByRole('button', { name: /respon sekarang/i }).first();
  await responBtn.click();

  // 5. Verify modal "TANGGAPI RESMI LAPORAN"
  await expect(page.getByText(/Tanggapi Resmi Laporan/i).first()).toBeVisible({ timeout: 5000 });

  // Screenshot of the open modal
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/screenshots/modal-tanggapi-resmi-open.png' });

  // 6. Fill textarea
  const textarea = page.locator('textarea');
  await textarea.fill('Usulan penambahan mata pelajaran Budaya Moklet telah kami terima dan saat ini sedang ditindaklanjuti oleh tim Kurikulum.');

  // 7. Select "Sedang Diproses (Penanganan)"
  const select = page.locator('select');
  await select.selectOption('OPEN');

  // Screenshot before clicking Kirim
  await page.screenshot({ path: 'public/screenshots/modal-tanggapi-resmi-filled-diproses.png' });

  // 8. Click Kirim
  const kirimBtn = page.getByRole('button', { name: /^Kirim$/i });
  await kirimBtn.click();

  // 9. Verify success toast
  await expect(page.getByText(/Tanggapan berhasil dikirim/i)).toBeVisible({ timeout: 10000 });

  // 10. Verify that status badge is now "Diproses"
  await page.waitForTimeout(2000);
  const diprosesBadge = page.locator('span:has-text("Diproses")').first();
  await expect(diprosesBadge).toBeVisible({ timeout: 10000 });

  // Screenshot showing status updated to Diproses
  await page.screenshot({ path: 'public/screenshots/unit-complaint-status-diproses.png' });

  // 11. Now test updating to DONE ("Selesai")
  const perbaruiBtn = page.getByRole('button', { name: /perbarui status/i }).first();
  await expect(perbaruiBtn).toBeVisible({ timeout: 5000 });
  await perbaruiBtn.click();

  // Modal opens again
  await expect(page.getByText(/Tanggapi Resmi Laporan/i).first()).toBeVisible({ timeout: 5000 });
  await page.locator('textarea').fill('Mata pelajaran Budaya Moklet telah resmi dimasukkan ke dalam kurikulum muatan lokal sekolah.');
  await page.locator('select').selectOption('DONE');

  // Submit DONE
  await page.getByRole('button', { name: /^Kirim$/i }).click();

  // Verify success toast
  await expect(page.getByText(/Tanggapan berhasil dikirim/i)).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2000);

  // Verify status is now "Selesai"
  const selesaiBadge = page.locator('span:has-text("Selesai")').first();
  await expect(selesaiBadge).toBeVisible({ timeout: 10000 });

  // Screenshot showing status updated to Selesai
  await page.screenshot({ path: 'public/screenshots/unit-complaint-status-done.png' });
});
