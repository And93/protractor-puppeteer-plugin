/// <reference path="../protractor/built/browser.d.ts" />

import * as puppeteer from 'puppeteer';

declare module 'protractor-puppeteer-plugin' {
    export function setup(): Promise<void>;

    export const name: string;
}

declare module 'protractor' {
    export class ProtractorBrowser {
        public puppeteer: typeof puppeteer;

        public har: {
            start(): Promise<void>,

            stop(): Promise<void>
        };

        public cdp: {
            target: puppeteer.Target,

            client: puppeteer.CDPSession,

            page: puppeteer.Page,

            browser: puppeteer.Browser
        };
    }
}
