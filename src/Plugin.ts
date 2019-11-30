import {resolve} from 'path';
import {protractor} from 'protractor';
import * as puppeteer from 'puppeteer-core';
import {HarHelper} from './helpers/HarHelper';
import {logHelper} from './helpers/LogHelper';
import {NetworkHelper} from './helpers/NetworkHelper';

interface IPlugin {
    connectToBrowser?: boolean,
    connectOptions?: puppeteer.ConnectOptions,
    timeout?: number,
    harDir?: string,
    capture?: {
        setRequestInterception: boolean,
        logsDir?: string,
        overrides?: puppeteer.Overrides,
        requestfinished?: boolean,
        requestfailed?: boolean,
        response?: boolean
    }
}

interface IPuppeteerExtendObj {
    // @ts-ignore
    puppeteer: puppeteer,
    har?: HarHelper,
    channel?: {
        target: puppeteer.Target,
        client: puppeteer.CDPSession,
        page: puppeteer.Page,
        browser: puppeteer.Browser
    }
}

export async function setup(): Promise<void> {

    const {capabilities, plugins} = await protractor.browser.getProcessedConfig();

    if (capabilities.browserName !== 'chrome') {
        return;
    }

    for (const plugin of plugins) {

        if (
            plugin.hasOwnProperty('package') && plugin.package !== 'protractor-puppeteer-plugin'
            || plugin.hasOwnProperty('path') && !plugin.path.includes('protractor-puppeteer-plugin')
        ) {
            continue;
        }

        const {configFile, configOptions} = plugin;

        const {
            connectToBrowser,
            connectOptions,
            timeout,
            harDir,
            capture
        } = (configFile ? require(resolve(configFile)) : configOptions) as IPlugin;

        let puppeteerExtendObj: IPuppeteerExtendObj = {puppeteer};

        if (connectToBrowser) {
            const _capabilities = await protractor.browser.getCapabilities();
            const {debuggerAddress} = _capabilities.get('goog:chromeOptions');

            const browser = await puppeteer.connect({
                browserURL: `http://${debuggerAddress}`,
                ...connectOptions
            });

            const target = await browser.waitForTarget((t: puppeteer.Target) => t.type() === 'page');
            const client = await target.createCDPSession();
            const page = await target.page();

            let har!: HarHelper;

            if (timeout) {
                page.setDefaultTimeout(timeout);
            }

            if (harDir) {
                har = new HarHelper(page, harDir);
            }

            if (capture) {
                const {setRequestInterception, logsDir, overrides, requestfinished, requestfailed, response} = capture;

                if (setRequestInterception) {

                    const networkHelper = new NetworkHelper(page, logsDir);

                    await networkHelper.setRequestInterception(true);

                    networkHelper.catchTraffic('request', 'on', (request: puppeteer.Request) => {
                        request.continue(overrides);
                    });

                    if (requestfinished) {
                        networkHelper.catchTrafficAndWriteFile('requestfinished');
                    }

                    if (requestfailed) {
                        networkHelper.catchTrafficAndWriteFile('requestfailed');
                    }

                    if (response) {
                        networkHelper.catchTrafficAndWriteFile('response');
                    }
                }
            }

            puppeteerExtendObj = {
                puppeteer,
                har,
                channel: {
                    target,
                    client,
                    page,
                    browser
                }
            }
        }

        Object.assign(protractor.ProtractorBrowser.prototype, puppeteerExtendObj);
        logHelper.generate('Protractor and Puppeteer', 'were merged.').print();
    }
}
