'use strict';
const {protractor, ProtractorBrowser} = require('protractor');
const request = require('request-promise-native');
const puppeteer = require('puppeteer-core');

module.exports = async function () {

    const {capabilities, plugins} = await protractor.browser.getProcessedConfig();

    if (capabilities.browserName !== 'chrome') {
        return;
    }

    for (const plugin of plugins) {
        const date = new Date();
        const {name} = plugin.inline;

        if (name !== 'protractor-puppeteer-plugin') {
            return;
        }

        const {connectToBrowser, sizeWindow, timeout, catchRequests} = plugin;

        let _puppeteer = {puppeteer};

        if (connectToBrowser) {
            const _capabilities = await protractor.browser.getCapabilities();
            const {debuggerAddress} = _capabilities.get('goog:chromeOptions');

            const {webSocketDebuggerUrl} = await request({
                method: 'GET',
                uri: `http://${debuggerAddress}/json/version`,
                json: true
            });

            const browser = await puppeteer.connect({
                browserWSEndpoint: webSocketDebuggerUrl,
                defaultViewport: sizeWindow
            });

            const target = await browser.waitForTarget(t => t.type() === 'page');
            const client = await target.createCDPSession();
            const page = await target.page();

            page.setDefaultTimeout(timeout);

            if (catchRequests) {
                await page.setRequestInterception(catchRequests);

                page.on('request', _request => {
                    _request.continue();
                });
            }

            _puppeteer = {
                puppeteer,
                channel: {
                    target,
                    client,
                    page,
                    browser
                }
            }
        }

        Object.assign(ProtractorBrowser.prototype, _puppeteer);
        console.log(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] PROTRACTOR AND PUPPETEER WERE MERGED.`)
    }
};
