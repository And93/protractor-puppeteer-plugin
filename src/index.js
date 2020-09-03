'use strict';

const {resolve} = require('path');
const protractor = require('protractor');
const puppeteerLib = require('puppeteer-core');

const Har = require('./har');
const Lighthouse = require('./lighthouse');
const Puppeteer = require('./puppeteer');
const Endpoint = require('./endpoint');

let {logger: loggerFn, setLogLevel} = require('./helpers/logger');
const logger = loggerFn('Protractor and Puppeteer');

module.exports = async function () {

    const {capabilities, plugins} = await protractor.browser.getProcessedConfig();

    if (capabilities.browserName !== 'chrome') {
        throw new Error('Supported only Chrome browser.');
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
            selenoid,
            lighthouse: lighthouseConfig,
            logLevel
        } = configFile ? require(resolve(configFile)) : configOptions;

        setLogLevel(logLevel);

        logger.debug({
            connectToBrowser,
            connectOptions,
            timeout,
            harDir,
            defaultArgs,
            selenoid,
            lighthouse: lighthouseConfig,
            logLevel
        });

        let protractorExtendObj = {puppeteer: puppeteerLib};

        let browserURL;
        let browserWSEndpoint;

        if (connectToBrowser || lighthouseConfig) {
            const endpoint = new Endpoint();
            const currentEndpoint = await endpoint.get(selenoid);

            browserWSEndpoint = currentEndpoint.browserWSEndpoint;
            browserURL = currentEndpoint.browserURL;
        }

        if (connectToBrowser) {
            const puppeteer = new Puppeteer({defaultArgs, browserURL, browserWSEndpoint, connectOptions, timeout});
            const {page, browser, target, client} = await puppeteer.connect();
            const har = new Har(page, harDir);

            protractorExtendObj = Object.assign({}, {
                puppeteer: puppeteerLib,
                har,
                cdp: {
                    target,
                    client,
                    page,
                    browser
                }
            });
        }

        if (lighthouseConfig && 'enabled' in lighthouseConfig) {
            const {lighthouse} = new Lighthouse({lighthouseConfig, url: browserURL || browserWSEndpoint});
            protractorExtendObj = Object.assign(protractorExtendObj, {lighthouse});
            logger.info('Lighthouse was added to Protractor.');
        }

        Object.assign(protractor.ProtractorBrowser.prototype, protractorExtendObj);

        logger.info('Plugin was added successfully.');
    }
};
