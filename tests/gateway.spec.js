const { test, expect } = require("@playwright/test");

test("Parse chains from pre-alpha config", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  const exampleConfig = require("../src/utils/exampleConfig.json");
  await page.fill("textarea", JSON.stringify(exampleConfig));
  await page.click("[type='submit']");

  const titleValue = await page.$eval(
    "[placeholder='Title']",
    (el) => el.value
  );
  expect(titleValue).toContain("Forge");
  expect(await page.isVisible("text=rinkeby1")).toBeTruthy();
  expect(await page.isVisible("text=rsk-tn")).toBeTruthy();
  await page.click(".mdi-database-cog");
  let chainsCard = await page.waitForSelector("#chainsCard");
  await chainsCard.waitForSelector('[type="checkbox"]');
  const checkboxes = await chainsCard.$$('[type="checkbox"]');
  expect(checkboxes.length).toBe(5);
  await page.check("text=Kovan");

  await page.click("text=Submit");
  await page.waitForSelector("#chainsCard", { state: "hidden" });
  expect(await page.isVisible("text=Kovan")).toBeTruthy();
});
