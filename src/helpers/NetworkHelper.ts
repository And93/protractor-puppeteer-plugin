import {EventEmitter} from 'events';
import {Page, PageEventObj, Request, Response} from 'puppeteer-core';
import {FileSystemHelper} from './FileSystemHelper';

export class NetworkHelper {

    private readonly fileSystemHelper: FileSystemHelper;

    constructor(private page: Page, path: string = './artifacts/network/') {
        this.fileSystemHelper = new FileSystemHelper(path);
    }

    public setRequestInterception(state: boolean): Promise<void> {
        return this.page.setRequestInterception(state);
    }

    public catchTraffic<K extends keyof PageEventObj>(
        eventName: K,
        method: keyof EventEmitter,
        handler?: (e: PageEventObj[K], ...args: any[]) => void
    ): void {
        // @ts-ignore
        this.page[method](eventName, handler);
    }

    public catchTrafficAndWriteFile(param: 'requestfinished' | 'requestfailed' | 'response'): void {
        this.catchTraffic(param, 'on', (re: Request | Response) => {
            this.fileSystemHelper.makeDir();
            this.fileSystemHelper.writeFileStream(JSON.stringify(re), this.fileName(param));
        });
    }

    private fileName(name: string) {
        return `${new Date().valueOf()}_PID_${process.pid}_network_browser_${name}.log`
    }
}
