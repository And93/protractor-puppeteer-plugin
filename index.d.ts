/// <reference types="protractor" />

import * as puppeteer from 'puppeteer';
import * as lighthouse from 'lighthouse';

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

        public lighthouse: (
            url: string,
            params?: { flags?: lighthouse.Flags, config?: lighthouse.Config.Json, connection?: lighthouse.Connection }
        ) => Promise<lighthouse.RunnerResult>
    }

    export interface PluginConfig {
        configFile?: string;
        configOptions?: {
            connectToBrowser?: boolean;
            connectOptions?: puppeteer.BrowserOptions;
            timeout?: number;
            defaultArgs?: puppeteer.ChromeArgOptions;
            harDir?: string;
            selenoid?: {
                host: string,
                port?: number
            };
            lighthouse?: {
                enabled?: boolean,
                flags?: lighthouse.Flags,
                config?: lighthouse.Config.Json
                reportsDir?: string
            };
            // logLevel?: 'info' | 'verbose' | 'error' | 'silent'; todo
        }
    }
}
