// @ts-ignore
import * as har from 'chrome-har';
import {Page} from 'puppeteer-core';
import {FileSystemHelper} from './FileSystemHelper';

export class HarHelper {

    private readonly observe = [
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

    private events = [{}];

    private readonly fileSystemHelper: FileSystemHelper;

    constructor(private page: Page, path: string = './artifacts/har/') {
        this.fileSystemHelper = new FileSystemHelper(path);
    }

    public async start(): Promise<void> {
        const client = await this.page.target().createCDPSession();

        await client.send('Page.enable');
        await client.send('Network.enable');

        this.observe.forEach((method: string) => {
            client.on(method, (params: any) => {
                this.events.push({method, params});
            });
        });
    }

    public stop(): Promise<void> {
        const _har = har.harFromMessages(this.events);
        const name = `${new Date().valueOf()}_PID_${process.pid}_chrome_browser_log.har`;

        this.fileSystemHelper.makeDir();
        this.fileSystemHelper.writeFileStream(JSON.stringify(_har), name);

        return Promise.resolve();
    }
}
