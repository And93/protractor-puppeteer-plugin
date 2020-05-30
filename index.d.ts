import * as pptr from 'puppeteer-core';

declare module 'protractor-puppeteer-plugin' {
    export function setup(): promise.Promise<void>;

    export const name: string;
}

declare module 'protractor' {
    interface ProtractorBrowser {
        puppeteer: pptr;

        har: {
            start(): Promise<void>,

            stop(): Promise<void>
        };

        cdp: {
            target: pptr.Target,

            client: pptr.CDPSession,

            page: pptr.Page,

            browser: pptr.Browser
        };
    }
}
