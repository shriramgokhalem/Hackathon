import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import { writeFileSync , mkdirSync } from 'fs';
import { launch } from 'chrome-launcher';

// Replace with your login URL and credentials

const urls={
  "Case" : "https://qaapp8.clarizen.com/develop_20240809_4055_Application/Case",
  // "Project": "https://qaapp8.clarizen.com/develop_20240809_4055_Application/Project",
  // "Task": "https://qaapp8.clarizen.com/develop_20240809_4055_Application/GenericTask"
};

const runNumber = process.argv[2];

const loginUrl = 'https://qaapp8.clarizen.com/develop_20240809_4055_Application/Pages/Service/Login.aspx';
// const targetUrl = 'https://qaapp8.clarizen.com/develop_20240809_4055_Application/Case'; // The page after login
const username = 'julia.liskot';
const password = 'Password1!';

// (async () => {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Go to login page
  await page.goto(loginUrl, { timeout: 600000 });

  // Fill in the login form and submit
  await page.type('#txtLogin', username); // Replace #username with the actual username input selector
  await page.type('#txtPassword', password); // Replace #password with the actual password input selector
  await page.click('#lbtLogin');     // Replace #loginButton with the actual submit button selector

  // Wait for navigation after login
  // await page.waitForNavigation();

  await page.waitForSelector('#CalendarViewContainer_CalendarView > div.fc-view-container > div > table > tbody > tr > td > div > div > div:nth-child(2) > div.fc-bg > table > tbody > tr > td.fc-day.fc-widget-content.fc-thu.fc-past.no-drop-resource.fc-droppable-element.ui-droppable',{ timeout: 600000 });

  // Get the browser's connection to use with Lighthouse
  const browserWSEndpoint = browser.wsEndpoint();

  // // Launch Lighthouse using the authenticated session
  // // const chrome = await launch({ chromeFlags: ['--headless'], chromeWSEndpoint: browserWSEndpoint });
  // const browser1 = await puppeteer.connect({
  //   browserWSEndpoint,  // WebSocket endpoint to the running browser
  //   headless: true,     // Optionally specify headless mode if desired (though the browser is already running)
  // });
  // // const chrome = await launch({ chromeWSEndpoint: browserWSEndpoint });
  // const options = { logLevel: 'info', output: 'html', port: chrome.port };

  // await page.goto('https://example.com');

  // const runnerResult = await lighthouse(targetUrl, options);

  mkdirSync(`./result/`+`${runNumber}/`);

  for (let page in urls) {

    const runnerResult = await lighthouse(urls[page], {
      port: (new URL(browserWSEndpoint)).port,  // Use Puppeteer's port for Lighthouse
      output: 'json',  // Output report in HTML format
      logLevel: 'info',
      chromeFlags: ['--headless']
    });

    let reportHtml = runnerResult.report;
    
    writeFileSync(`./result/`+`${runNumber}/`+`${page}`+`.json`, reportHtml);

    console.log('Lighthouse performance score:', runnerResult.lhr.categories.performance.score * 100);

  };

  // let runnerResult = await lighthouse(page.url(), {
  //   port: (new URL(browserWSEndpoint)).port,  // Use Puppeteer's port for Lighthouse
  //   output: 'json',  // Output report in HTML format
  //   logLevel: 'info',
  // });

  // Save the Lighthouse report
  // let reportHtml = runnerResult.report;
  // writeFileSync('lighthouse-report.html', reportHtml);

  // console.log('Lighthouse performance score:', runnerResult.lhr.categories.performance.score * 100);

  // // // Close Puppeteer and Lighthouse


  // runnerResult = await lighthouse("https://qaapp8.clarizen.com/develop_20240809_4055_Application/Project", {
  //   port: (new URL(browserWSEndpoint)).port,  // Use Puppeteer's port for Lighthouse
  //   output: 'html',  // Output report in HTML format
  //   logLevel: 'info',
  // });

  // // Save the Lighthouse report
  // reportHtml = runnerResult.report;
  // writeFileSync('lighthouse-report1.html', reportHtml);

  // console.log('Lighthouse performance score:', runnerResult.lhr.categories.performance.score * 100);

  await browser.close();
  // await browser1.kill();
  // await chrome.kill();
// })
// ();
