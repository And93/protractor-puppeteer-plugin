'use strict';

const protractor = require('protractor');
const {logger: loggerFn} = require('./helpers/logger');

const logger = loggerFn('Protractor and Puppeteer');

class Endpoint {

    /**
     * @param selenoid {{host: string, port: number=}=}
     * @return {Promise<{browserWSEndpoint: string=, browserURL: string=}>}
     */
    async get(selenoid) {

        // Chrome: ws://${host}:${port}/devtools/browser/${sessionId}
        // Selenoid: ws://${host}:${port}/devtools/${sessionId}
        let browserWSEndpoint;

        // Chrome: http://${host}:${port}
        let browserURL;

        if (selenoid) {
            const session = await protractor.browser.getSession();
            const sessionId = await session.getId();

            browserWSEndpoint = `ws://${selenoid.host}:${selenoid.port || 4444}/devtools/${sessionId}`;

            logger.info(`Connecting to Selenoid via: browserWSEndpoint: ${browserWSEndpoint}`);
        } else {
            const capabilities = await protractor.browser.getCapabilities();
            const {debuggerAddress} = capabilities.get('goog:chromeOptions');

            browserURL = `http://${debuggerAddress}`;

            logger.info(`Connecting to Chrome via: browserURL: ${browserURL}`);
        }

        return {
            browserWSEndpoint,
            browserURL
        }
    }
}

module.exports = Endpoint;
