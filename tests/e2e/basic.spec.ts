/**
 * DatePicker E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('DatePicker 基本功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002'); // Vue 示例
  });

  test('应该正确渲染日期选择器', async ({ page }) => {
    const picker = page.locator('.ldate-picker');
    await expect(picker).toBeVisible();
  });

  test('点击输入框应该打开面板', async ({ page }) => {
    const input = page.locator('.ldate-input');
    await input.click();

    const panel = page.locator('.ldate-popper');
    await expect(panel).toBeVisible();
  });

  test('选择日期应该更新输入框', async ({ page }) => {
    const input = page.locator('.ldate-input__inner');
    await input.click();

    // 选择15号
    const cell = page.locator('.ldate-cell').filter({ hasText: '15' }).first();
    await cell.click();

    const value = await input.inputValue();
    expect(value).toContain('15');
  });

  test('清除按钮应该清空值', async ({ page }) => {
    const input = page.locator('.ldate-input__inner');
    await input.click();

    const cell = page.locator('.ldate-cell').filter({ hasText: '15' }).first();
    await cell.click();

    const clearBtn = page.locator('.ldate-input__suffix');
    await clearBtn.click();

    const value = await input.inputValue();
    expect(value).toBe('');
  });
});

test.describe('DatePicker 范围选择', () => {
  test('应该支持范围选择', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // 切换到范围选择模式
    const rangeInput = page.locator('.ldate-range-input').first();
    await rangeInput.click();

    // 选择起始日期
    const startCell = page.locator('.ldate-cell').filter({ hasText: '10' }).first();
    await startCell.click();

    // 选择结束日期
    const endCell = page.locator('.ldate-cell').filter({ hasText: '20' }).first();
    await endCell.click();

    // 验证范围
    const startInput = page.locator('.ldate-range-input__inner').first();
    const endInput = page.locator('.ldate-range-input__inner').nth(1);

    const startValue = await startInput.inputValue();
    const endValue = await endInput.inputValue();

    expect(startValue).toContain('10');
    expect(endValue).toContain('20');
  });
});

test.describe('DatePicker 键盘导航', () => {
  test('应该支持 Escape 键关闭面板', async ({ page }) => {
    await page.goto('http://localhost:3002');

    const input = page.locator('.ldate-input__inner').first();
    await input.click();

    const panel = page.locator('.ldate-popper');
    await expect(panel).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel).not.toBeVisible();
  });

  test('应该支持方向键导航', async ({ page }) => {
    await page.goto('http://localhost:3002');

    const input = page.locator('.ldate-input__inner').first();
    await input.click();

    // 使用方向键导航
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');

    // Enter 键选择
    await page.keyboard.press('Enter');

    const panel = page.locator('.ldate-popper');
    await expect(panel).not.toBeVisible();
  });
});

test.describe('DatePicker 可访问性', () => {
  test('应该有正确的 ARIA 属性', async ({ page }) => {
    await page.goto('http://localhost:3002');

    const picker = page.locator('.ldate-picker').first();
    const ariaLabel = await picker.getAttribute('aria-label');

    expect(ariaLabel).toBeTruthy();
  });

  test('应该支持键盘焦点管理', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Tab 导航
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('DatePicker 移动端', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('应该在移动端正确渲染', async ({ page }) => {
    await page.goto('http://localhost:3002');

    const picker = page.locator('.ldate-picker').first();
    await expect(picker).toBeVisible();

    // 检查移动端类名
    const hasMobileClass = await picker.evaluate((el) => {
      return el.classList.contains('ldate-mobile');
    });

    expect(hasMobileClass).toBeTruthy();
  });

  test('应该支持触摸手势', async ({ page }) => {
    await page.goto('http://localhost:3002');

    const input = page.locator('.ldate-input__inner').first();
    await input.tap();

    const panel = page.locator('.ldate-popper');
    await expect(panel).toBeVisible();
  });
});

