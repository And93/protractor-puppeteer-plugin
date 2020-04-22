'use strict';
const har = require('chrome-har');
const {FileSystemHelper} = require('./FileSystemHelper');
const logHelper = require('./LogHelper');

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

    constructor(page, path = './artifacts/har/') {
        this._page = page;
        this._fileSystemHelper = new FileSystemHelper(path);
    }

    async start() {
        this._client = await this._page.target().createCDPSession();

        await this._client.send('Page.enable');
        await this._client.send('Network.enable');

        observe.forEach(method => {
            this._client.on(method, params => {
                events.push({method, params});
            });
        });

        logHelper.generate('Protractor and Puppeteer', '"Har" capture began.').print();
    }

    stop() {
        const harFromMessages = har.harFromMessages(events);
        const name = `${new Date().valueOf()}_PID_${process.pid}_chrome_browser_har_log.har`;

        observe.forEach(method => this._client.removeAllListeners(method));

        this._fileSystemHelper.makeDir();
        this._fileSystemHelper.writeFileStream(JSON.stringify(harFromMessages), name);

        logHelper
            .generate('Protractor and Puppeteer', `"Har" capture completed. File name: ${name}`)
            .print();

        return Promise.resolve();
    }
}

module.exports = {HarHelper};
