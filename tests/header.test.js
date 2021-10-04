const puppeteer = require('puppeteer'); // With this, we can work with chromium

describe('Testing the header', () => {

    test('Launching Chromium Instances', async () => {

        const browser = await puppeteer.launch({ headless: false });
        const newPage = await browser.newPage();

        await newPage.goto('localhost:3000');

        // Verifying if 'Blogster' name appears in the header
        const headerText = await newPage.$eval('a.brand-logo', element => element.innerHTML);
        expect(headerText).toEqual('Blogster');
    })

})