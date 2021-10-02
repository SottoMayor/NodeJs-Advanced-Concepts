const puppeteer = require('puppeteer'); // With this, we can work with chromium

describe('Testing the header', () => {

    test('Launching Chromium Instances', async () => {

        const browser = await puppeteer.launch({ headless: false });
        const newPage = browser.newPage();
    })

})