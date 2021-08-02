const { test, expect } = require("@playwright/test");

test("Regex on Title", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  await page.click("text=Config");
  const exampleConfig = require("../src/utils/exampleConfig.json");
  await page.fill(
    "[placeholder='Paste Import Here...']",
    JSON.stringify(exampleConfig)
  );
  await page.click(
    "#app > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button"
  );
  await page.click("#menuButton");
  expect(await page.isVisible("#export")).toBeTruthy();
  await page.click("[placeholder='Title']", { clickCount: 2 });
  await page.keyboard.type("5");
  await page.click("#menuButton");
  await page.click("#export", { force: true });
  expect(await page.isVisible('"Edit your config"')).toBeFalsy();
});