import { test, expect } from '@playwright/test';

test.skip(true, 'Requires built extension path and Chrome channel with extensions');

test('placeholder', async () => {
  expect(1).toBe(1);
});
