/// <reference types="protractor" />

import * as puppeteer from 'puppeteer-core';
import * as lighthouse from 'lighthouse';

declare module 'protractor-puppeteer-plugin' {
    export function setup(): Promise<void>;

    export const name: string;
}

declare module 'protractor' {
    export class ProtractorBrowser {
        public readonly puppeteer: typeof puppeteer;

        public readonly har: {
            start(): Promise<void>,

            stop(reportName?: string): Promise<void>
        };

        public readonly cdp: {
            readonly target: puppeteer.Target,

            readonly client: puppeteer.CDPSession,

            readonly page: puppeteer.Page,

            readonly browser: puppeteer.Browser
        };

        public readonly lighthouse: (
            url: string,
            params?: {
                flags?: lighthouse.Flags, config?: lighthouse.Config.Json,
                connection?: lighthouse.Connection, reportName?: string
            }
        ) => Promise<lighthouse.RunnerResult>
    }

    export interface PluginConfig {
        readonly configFile?: string;
        readonly configOptions?: {
            readonly connectToBrowser?: boolean;
            readonly connectOptions?: puppeteer.ConnectOptions;
            readonly timeout?: number;
            readonly defaultArgs?: puppeteer.BrowserLaunchArgumentOptions;
            readonly harDir?: string;
            readonly selenoid?: {
                readonly host: string,
                readonly port?: number
            };
            readonly lighthouse?: {
                readonly enabled?: boolean,
                readonly flags?: lighthouse.Flags,
                readonly config?: lighthouse.Config.Json
                readonly reportsDir?: string
            };
            readonly logLevel?: 'verbose' | 'info' | 'warn' | 'error' | 'silent';
        }
    }
}
