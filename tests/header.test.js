const puppeteer = require('puppeteer'); // With this, we can work with chromium

// Now, this variables are in global scope
let newPage, browser;

// This will be executes before each running test
beforeEach(async () => {
    browser = await puppeteer.launch({ headless: false });
    newPage = await browser.newPage();

    await newPage.goto('localhost:3000');
})

// This will be executes after each running test
afterEach(async () => browser.close());


describe('Testing the header', async () => {

    test('Launching Chromium Instances', async () => {

        // Verifying if 'Blogster' name appears in the header
        const headerText = await newPage.$eval('a.brand-logo', element => element.innerHTML);
        expect(headerText).toEqual('Blogster');
    })

})