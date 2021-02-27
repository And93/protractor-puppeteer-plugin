'use strict';

const puppeteerLib = require('puppeteer-core');

const {Logger} = require('./helpers/logger');
const logger = Logger('Protractor and Puppeteer');

class Puppeteer {

    /**
     * @param defaultArgs {puppeteerLib.BrowserLaunchArgumentOptions=}
     * @param timeout {number=}
     * @param browserURL {string=}
     * @param browserWSEndpoint {string=}
     * @param connectOptions {puppeteerLib.ConnectOptions=}
     */
    constructor({defaultArgs, timeout, browserURL, browserWSEndpoint, connectOptions}) {
        this.defaultArgs = defaultArgs;
        this.timeout = timeout;

        this.options = {
            browserURL,
            browserWSEndpoint,
            ...connectOptions
        }
    }

    /**
     * @return {Promise<{browser: Browser, client: CDPSession, page: Page, target: Target}>}
     */
    async connect() {
        if (this.defaultArgs) {
            puppeteerLib.defaultArgs(this.defaultArgs);
        }

        logger.debug(this.options);

        const browser = await puppeteerLib.connect(this.options);
        const target = await browser.waitForTarget(t => t.type() === 'page');
        const client = await target.createCDPSession();
        const page = await target.page();

        if (this.timeout) {
            page.setDefaultTimeout(this.timeout);
        }

        logger.info('Puppeteer was connected to Protractor.');

        return {
            browser,
            target,
            client,
            page
        }
    }
}

module.exports = Puppeteer;
