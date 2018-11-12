const puppeteer = require('puppeteer');
const args = require('yargs').argv;

(async () => {
  const browser = await puppeteer.launch({
    headless: args.show === false
  });

  const page = await browser.newPage();
  await page.goto('https://google.ru');

  await page.type('#lst-ib', 'Webpurple Рязань');
  await page.waitFor(2000);

  await page.click('input[name=btnK]');
  await page.waitForNavigation();

  if (args.delay) {
    await page.waitFor(args.delay * 1000);
  };

  await browser.close();
})();

