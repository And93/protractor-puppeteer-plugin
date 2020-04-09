'use strict';

const {resolve} = require('path');
const protractor = require('protractor');
const puppeteer = require('puppeteer-core');
const {HarHelper} = require('./helpers/HarHelper');
const logHelper = require('./helpers/LogHelper');

module.exports = async function () {

    const {capabilities, plugins} = await protractor.browser.getProcessedConfig();

    if (capabilities.browserName !== 'chrome') {
        throw logHelper.generate('Protractor and Puppeteer', 'Supported only Chrome browser.').print();
    }

    for (const plugin of plugins) {

        if (
            'package' in plugin && plugin.package !== 'protractor-puppeteer-plugin'
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
            defaultArgs
        } = configFile ? require(resolve(configFile)) : configOptions;

        let puppeteerExtendObj = {puppeteer};

        if (connectToBrowser) {
            const _capabilities = await protractor.browser.getCapabilities();
            const {debuggerAddress} = _capabilities.get('goog:chromeOptions');

            logHelper.generate('Protractor and Puppeteer', `debuggerAddress: ${debuggerAddress}`).print();

            if (defaultArgs) {
                puppeteer.defaultArgs(defaultArgs);
            }

            const browser = await puppeteer.connect({
                browserURL: `http://${debuggerAddress}`,
                ...connectOptions
            });

            const target = await browser.waitForTarget(t => t.type() === 'page');
            const client = await target.createCDPSession();
            const page = await target.page();

            const har = new HarHelper(page, harDir);

            if (timeout) {
                page.setDefaultTimeout(timeout);
            }

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
