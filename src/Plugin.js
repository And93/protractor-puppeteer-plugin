'use strict';

const {resolve} = require('path');
const protractor = require('protractor');
const puppeteer = require('puppeteer-core');
const HarHelper = require('./helpers/HarHelper');
const logHelper = require('./helpers/LogHelper');

module.exports = async function () {

    const {capabilities, plugins} = await protractor.browser.getProcessedConfig();

    if (capabilities.browserName !== 'chrome') {
        throw logHelper.generate('Protractor and Puppeteer', 'Supported only Chrome browser.').print();
    }

    for (const plugin of plugins) {

        if (
            'inline' in plugin
            || 'package' in plugin && plugin.package !== 'protractor-puppeteer-plugin'
            || 'path' in plugin && !plugin.path.includes('protractor-puppeteer-plugin')
        ) {
            continue;
        }

        const {configFile, configOptions} = plugin;

        const {
            connectToBrowser,
            connectOptions,
            timeout,
            harDir,
            defaultArgs,
            selenoid
        } = configFile ? require(resolve(configFile)) : configOptions;

        let puppeteerExtendObj = {puppeteer};

        if (connectToBrowser) {

            // Chrome: http://${host}:${port}
            let browserURL;

            // Chrome: ws://${host}:${port}/devtools/browser/${sessionId}
            // Selenoid: ws://${host}:${port}/devtools/${sessionId}
            let browserWSEndpoint;

            if (defaultArgs) {
                puppeteer.defaultArgs(defaultArgs);
            }

            if (selenoid) {
                const session = await protractor.browser.getSession();
                const sessionId = await session.getId();

                browserWSEndpoint = `ws://${selenoid.host}:${selenoid.port || 4444}/devtools/${sessionId}`;

                logHelper
                    .generate('Protractor and Puppeteer', `Connecting to Selenoid via: browserWSEndpoint: ${browserWSEndpoint}`)
                    .print();
            } else {
                const _capabilities = await protractor.browser.getCapabilities();
                const {debuggerAddress} = _capabilities.get('goog:chromeOptions');

                browserURL = `http://${debuggerAddress}`;

                logHelper
                    .generate('Protractor and Puppeteer', `Connecting to Chrome via: browserURL: ${browserURL}`)
                    .print();
            }

            const browser = await puppeteer.connect({
                browserURL,
                browserWSEndpoint,
                ...connectOptions
            });

            const target = await browser.waitForTarget(t => t.type() === 'page');
            const client = await target.createCDPSession();
            const page = await target.page();

            const har = new HarHelper(page, harDir);

            if (timeout) {
                page.setDefaultTimeout(timeout);
            }

            logHelper.generate('Protractor and Puppeteer', 'Puppeteer was connected to Protractor.').print();

            puppeteerExtendObj = {
                puppeteer,
                har,
                cdp: {
                    target,
                    client,
                    page,
                    browser
                }
            }
        }

        Object.assign(protractor.ProtractorBrowser.prototype, puppeteerExtendObj);
        logHelper.generate('Protractor and Puppeteer', 'Plugin added successfully.').print();
    }
};
