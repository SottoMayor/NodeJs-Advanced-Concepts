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

    test('Verifying if "Blogster" name appears in the header', async () => {

        const headerText = await newPage.$eval('a.brand-logo', element => element.innerHTML);
        expect(headerText).toEqual('Blogster');

    });

    test('Checking if when click login trigger oauth', async () => {
        // Click in the oauth button
        await newPage.click('.right a');
        //Extracting the page url
        const url = await newPage.url();

        // Making sure the url matches the google oauth url
        expect(url).toMatch(/accounts\.google\.com/);
    })

})