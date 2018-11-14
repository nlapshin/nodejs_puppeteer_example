const puppeteer = require('puppeteer');
const args = require('yargs').argv;

const inquirer = require('inquirer');
const Table = require('cli-table2');

const colors = require('colors');

(async () => {
  try {
    const answers = await inquirer.prompt([
      { name: 'answer', message: 'Введите поисковый запрос:' }
    ]);
    const answer = answers.answer;

    let browserOpts = {
      timeout: 3000000
    };

    if (args.show === true) {
      browserOpts.headless = false;
    }

    if (args.slowMo) {
      browserOpts.slowMo = parseInt(args.slowMo);
    }

    const browser = await puppeteer.launch();

    log('Browser started!');

    const page = await browser.newPage();

    await page.goto('https://google.ru');
    await page.waitFor('#lst-ib');

    log('Google page opened!');

    await page.type('#lst-ib', answer);
    await page.waitFor(2000);
    
    log('Search query entered!');

    await page.click('input[name=btnK]');
    await page.waitForNavigation();

    log('Search request ended!');

    const result = await page.evaluate(searchResultEvaluate);
    await page.waitFor(2000);
    log('Parse search response ended!');

    await browser.close();

    log('Browser closed!');

    showResult(result);
  } catch(err) {
    throw err;
  }

  function log(message) {
    this.step = this.step ? this.step + 1 : 1;

    console.log(`${this.step}. ${message}`.yellow);
  }

  function searchResultEvaluate() {
    const container = document.querySelector('.srg');
    const linksContainer = container.querySelectorAll('.g .rc');

    return Array.from(linksContainer).map(linkContainer => {
      let titleLink = linkContainer.querySelector('.r > a');

      return {
        link: titleLink.getAttribute('href'),
        title: titleLink.querySelector('h3').innerHTML
      };
    });
  }

  function showResult(result) {
    var table = new Table({ 
      head: ["Title", "Link"]
    });

    result.forEach(row => {
      table.push([ 
        row.link, 
        row.title
      ]);
    });

    console.log(table.toString());
  }

})();

