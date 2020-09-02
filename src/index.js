'use strict';

const {resolve} = require('path');
const protractor = require('protractor');
const puppeteerLib = require('puppeteer-core');

const Har = require('./har');
const Lighthouse = require('./lighthouse');
const Puppeteer = require('./puppeteer');
const Endpoint = require('./endpoint');

const {logger: loggerFn} = require('./helpers/logger');
const logger = loggerFn('Protractor and Puppeteer');

module.exports = async function () {

    const {capabilities, plugins} = await protractor.browser.getProcessedConfig();

    if (capabilities.browserName !== 'chrome') {
        throw logger.error('Supported only Chrome browser.');
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
            lighthouse: lighthouseConfig
        } = configFile ? require(resolve(configFile)) : configOptions;

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

        if (lighthouseConfig) {
            const {lighthouse} = new Lighthouse(lighthouseConfig, browserURL || browserWSEndpoint);
            protractorExtendObj = Object.assign(protractorExtendObj, {lighthouse});
            logger.info('Lighthouse was added to Protractor.');
        }

        Object.assign(protractor.ProtractorBrowser.prototype, protractorExtendObj);

        logger.info('Plugin added successfully.');
    }
};
