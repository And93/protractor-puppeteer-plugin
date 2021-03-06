'use strict';

const har = require('chrome-har');

const FileSystem = require('./helpers/fileSystem');

const {Logger} = require('./helpers/logger');
const logger = Logger('Protractor and Puppeteer');

const observe = [
    'Page.loadEventFired',
    'Page.domContentEventFired',
    'Page.frameStartedLoading',
    'Page.frameAttached',
    'Page.frameScheduledNavigation',
    'Network.requestWillBeSent',
    'Network.requestServedFromCache',
    'Network.dataReceived',
    'Network.responseReceived',
    'Network.resourceChangedPriority',
    'Network.loadingFinished',
    'Network.loadingFailed',
];

const events = [{}];

class HarHelper {

    /**
     * @param page {Page}
     * @param path {string=}
     */
    constructor(page, path = './artifacts/har/') {
        this.page = page;
        this.fileSystem = new FileSystem(path);
    }

    /**
     * @return {Promise<void>}
     */
    async start() {
        this.client = await this.page.target().createCDPSession();

        await this.client.send('Page.enable');
        await this.client.send('Network.enable');

        observe.forEach(method => {
            this.client.on(method, params => {
                logger.debug({method, params});
                events.push({method, params});
            });
        });

        logger.info('"Har" capture is started.');
    }

    /**
     * @param reportName {string=}
     * @return {Promise<void>}
     */
    stop(reportName = 'chrome_browser_har_log') {

        if (typeof reportName !== 'string' || reportName.length > 200) {
            const currentName = {
                name: reportName,
                type: typeof reportName,
                length: reportName.length
            }
            throw new Error(`The type of 'HAR' report prefix must be 'string' and contain no more than 200 symbols. Current ${JSON.stringify(currentName)}`);
        }

        const harFromMessages = har.harFromMessages(events);

        const name = `${new Date().valueOf()}_PID_${process.pid}_${reportName.replace(/ /gm, '_')}.har`;

        observe.forEach(method => this.client.removeAllListeners(method));

        this.fileSystem.makeDir();
        this.fileSystem.writeFileStream(JSON.stringify(harFromMessages), name);

        logger.info(`"Har" capture is finished. Report name: ${name}`);

        return Promise.resolve();
    }
}

module.exports = HarHelper;
