'use strict';
const protractor = require("protractor");
const request = require('request-promise-native');
const puppeteer = require('puppeteer-core');

module.exports = async function () {

    const {capabilities, plugins} = await protractor.browser.getProcessedConfig();

    if (capabilities.browserName !== 'chrome') {
        return;
    }

    for (const plugin of plugins) {

        if (
            plugin.hasOwnProperty('package') && plugin.package !== 'protractor-puppeteer-plugin'
            || plugin.hasOwnProperty('path') && !plugin.path.includes('protractor-puppeteer-plugin')
        ) {
            return;
        }

        const date = new Date();
        const {connectToBrowser, sizeWindow, timeout, catchRequests} = plugin;

        let _puppeteer = {puppeteer};

        if (connectToBrowser && typeof connectToBrowser === 'boolean') {
            const _capabilities = await protractor.browser.getCapabilities();
            const {debuggerAddress} = _capabilities.get('goog:chromeOptions');

            const {webSocketDebuggerUrl} = await request({
                method: 'GET',
                uri: `http://${debuggerAddress}/json/version`,
                json: true
            });

            if (
                !sizeWindow.hasOwnProperty('width')
                || typeof sizeWindow.width !== 'number'
                || !sizeWindow.hasOwnProperty('height')
                || typeof sizeWindow.height !== 'number'
            ) {
                throw Error(`The property: "sizeWindow" is mandatory and must have the following types: sizeWindow: {width: number, height: number}`)
            }

            const browser = await puppeteer.connect({
                browserWSEndpoint: webSocketDebuggerUrl,
                defaultViewport: sizeWindow
            });

            const target = await browser.waitForTarget(t => t.type() === 'page');
            const client = await target.createCDPSession();
            const page = await target.page();

            if (timeout && typeof timeout === 'number') {
                page.setDefaultTimeout(timeout);
            }

            if (catchRequests && typeof catchRequests === 'boolean') {
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

        Object.assign(protractor.ProtractorBrowser.prototype, _puppeteer);
        console.log(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] I/plugins - Protractor and Puppeteer were merged.`);
    }
};
