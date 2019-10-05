'use strict';
const protractor = require("protractor");
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

        const pluginLog = () => {
            const date = new Date();
            return `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}] I/plugins - Protractor and Puppeteer`
        };

        const {configFile, configOptions} = plugin;

        const {
            connectToBrowser,
            connectOptions,
            timeout,
            catchRequests,
            catchResponses
        } = configFile ? require.resolve(configFile) : configOptions;

        let _puppeteer = {puppeteer};

        if (connectToBrowser && typeof connectToBrowser === 'boolean') {
            const _capabilities = await protractor.browser.getCapabilities();
            const {debuggerAddress} = _capabilities.get('goog:chromeOptions');

            const browser = await puppeteer.connect({
                browserURL: `http://${debuggerAddress}`,
                ...connectOptions
            });

            const target = await browser.waitForTarget(t => t.type() === 'page');
            const client = await target.createCDPSession();
            const page = await target.page();

            if (timeout) {
                page.setDefaultTimeout(timeout);
            }

            if (catchRequests) {
                const {finished, failed, overrides} = catchRequests;
                await page.setRequestInterception(true);

                page.on('request', request => {
                    request.continue(overrides);
                });

                if (finished) {
                    page.on('requestfinished', request => {
                        const logData = {
                            url: request.url(),
                            method: request.method(),
                            postData: request.postData(),
                            headers: request.headers(),
                            status: request.response().status()
                        };

                        console.log(pluginLog(), '[Finished request]', logData);
                    });
                }

                if (failed) {
                    page.on('requestfailed', request => {
                        const logData = {
                            url: request.url(),
                            method: request.method(),
                            postData: request.postData(),
                            headers: request.headers(),
                            status: request.response().status()
                        };

                        console.log(pluginLog(), '[Failed request]', logData);

                        page.on('response', response => {
                            const logData = {
                                url: response.url(),
                                status: response.status(),
                                method: response.request().method(),
                                headers: response.headers()
                            };

                            console.log(pluginLog(), '[Response of failed request]', logData);
                        });
                    });
                }
            }

            if (catchResponses) {
                page.on('response', response => {
                    const logData = {
                        url: response.url(),
                        status: response.status(),
                        method: response.request().method(),
                        headers: response.headers()
                    };

                    console.log(pluginLog(), '[Response]', logData);
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
        console.log(pluginLog(), 'were merged.');
    }
};
