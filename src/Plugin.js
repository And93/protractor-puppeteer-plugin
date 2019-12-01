const {resolve} = require('path');
const protractor = require("protractor");
const puppeteer = require('puppeteer-core');
const {HarHelper} = require('./helpers/HarHelper');
const {logHelper} = require('./helpers/LogHelper');
const {NetworkHelper} = require('./helpers/NetworkHelper');

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
            continue;
        }

        const {configFile, configOptions} = plugin;

        const {
            connectToBrowser,
            connectOptions,
            timeout,
            harDir,
            capture
        } = configFile ? require(resolve(configFile)) : configOptions;

        let puppeteerExtendObj = {puppeteer};

        if (connectToBrowser) {
            const _capabilities = await protractor.browser.getCapabilities();
            const {debuggerAddress} = _capabilities.get('goog:chromeOptions');

            const browser = await puppeteer.connect({
                browserURL: `http://${debuggerAddress}`,
                ...connectOptions
            });

            const target = await browser.waitForTarget(t => t.type() === 'page');
            const client = await target.createCDPSession();
            const page = await target.page();

            let har;

            if (timeout) {
                page.setDefaultTimeout(timeout);
            }

            if (harDir) {
                har = new HarHelper(page, harDir);
            }

            if (capture) {
                const {setRequestInterception, logsDir, overrides, requestfinished, requestfailed, response} = capture;

                if (setRequestInterception) {

                    const networkHelper = new NetworkHelper(page, logsDir);

                    await networkHelper.setRequestInterception(true);

                    networkHelper.catchTraffic('request', 'on', request => {
                        request.continue(overrides);
                    });

                    if (requestfinished) {
                        networkHelper.catchTrafficAndWriteFile('requestfinished');
                    }

                    if (requestfailed) {
                        networkHelper.catchTrafficAndWriteFile('requestfailed');
                    }

                    if (response) {
                        networkHelper.catchTrafficAndWriteFile('response');
                    }
                }
            }

            puppeteerExtendObj = {
                puppeteer,
                har,
                channel: {
                    target,
                    client,
                    page,
                    browser
                }
            }
        }

        Object.assign(protractor.ProtractorBrowser.prototype, puppeteerExtendObj);
        logHelper.generate('Protractor and Puppeteer', 'were merged.').print();
    }
};
