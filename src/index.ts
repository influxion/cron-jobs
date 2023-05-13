#!/usr/bin/env ts-node
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import chalk from 'chalk';
import puppeteer from 'puppeteer';
import * as importReadline from 'readline';
dotenv.config();

const GITHUB_LOGIN_URL = `${process.env.GITHUB_URL!}/login`;
const GITHUB_REPO_URL = `${process.env.GITHUB_URL!}/${process.env
  .GITHUB_USERNAME!}/${process.env.GITHUB_REPO!}/new/main`;

async function auth() {
  const readline = importReadline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const browser = await puppeteer.launch({
    headless: 'new',
    slowMo: 250,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  await page.goto(GITHUB_LOGIN_URL, { waitUntil: 'networkidle2' });

  // Please replace 'your_username' and 'your_password' with your actual username and password.
  await page.type('#login_field', process.env.GITHUB_USERNAME!, { delay: 100 });
  await page.type('#password', process.env.GITHUB_PASSWORD!, { delay: 100 });

  await Promise.all([
    page.waitForNavigation(),
    page.click('input[type="submit"]'),
  ]);

  let code: string = await new Promise((resolve) => {
    readline.question('Code: ', (codeInput) => {
      resolve(codeInput);
      readline.close();
    });
  });

  await page.keyboard.type(code, { delay: 100 });

  await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]'),
  ]);

  run();
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    slowMo: 250,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  await page.goto(GITHUB_LOGIN_URL, { waitUntil: 'networkidle2' });

  // Please replace 'your_username' and 'your_password' with your actual username and password.
  await page.type('#login_field', process.env.GITHUB_USERNAME!, { delay: 100 });
  await page.type('#password', process.env.GITHUB_PASSWORD!, { delay: 100 });

  await Promise.all([
    page.waitForNavigation(),
    page.click('input[type="submit"]'),
  ]);

  const randomNumber = Math.floor(Math.random() * 3) + 1;
  console.log(
    `${chalk.bgWhite(
      `Attemping ${randomNumber} commits`
    )}: ${new Date().toISOString()}`
  );

  for (let i = 1; i <= randomNumber; i++) {
    try {
      console.log(`${chalk.bgBlue('Starting')}: ${i}/${randomNumber}`);
      await page.goto(GITHUB_REPO_URL, { waitUntil: 'networkidle2' });
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      // const month = date.getMonth();
      await page.type('input[type="text"]', `${year}/${month}/${day}/${i}`, {
        delay: 100,
      });
      await page.click('div[class="CodeMirror-scroll"]');
      await page.keyboard.type(date.toISOString(), { delay: 100 });

      await page.click('[data-hotkey="Meta+s,Control+s"]');
      const [button] = await page.$x("//button[contains(., 'Commit changes')]");
      //@ts-expect-error
      await button.click();
      await page.waitForNavigation({ timeout: 30000 });
    } catch (error) {
      console.log(`${chalk.bgRed('Failed')}: ${i}/${randomNumber}`);
      console.log(chalk.red(JSON.stringify(error)));
      continue;
    }
    console.log(`${chalk.bgGreen('Completed')}: ${i}/${randomNumber}`);
  }

  await browser.close();
}

auth().catch(console.error);
console.log('STARTED');

// cron.schedule(`0 12 * * *`, async () => {
//   console.log(chalk.bold('Cron task initiated'));
//   run();
// });
