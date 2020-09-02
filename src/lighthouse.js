'use strict';
const lighthouseLib = require('lighthouse');
const {URL} = require('url');
const FileSystem = require('./helpers/fileSystem');
const {logger: loggerFn} = require('./helpers/logger');

const logger = loggerFn('Protractor and Lighthouse');

class Lighthouse {

    /**
     * @param lighthouseConfig {{flags: LH.Flags=, config: LH.Config.Json=, reportsDir: string=}}
     * @param url {string}. browserURL or browserWSEndpoint
     */
    constructor(lighthouseConfig, url) {
        this.lighthouseConfig = lighthouseConfig;

        this.fileSystem = new FileSystem(this.lighthouseConfig.reportsDir || './artifacts/lighthouse/');

        const port = new URL(url);

        this.defaultParams = {
            flags: Object.assign(
                {
                    port,
                    logLevel: 'info',
                    output: ['json', 'html']
                },
                this.lighthouseConfig.flags
            ),
            config: this.lighthouseConfig.config || require('lighthouse/lighthouse-core/config/lr-desktop-config.js')
        }
    }

    /**
     * @param url {string}
     * @param flags {LH.Flags=}
     * @param config {LH.Config.Json=}
     * @param connection {LH.Connection=}
     * @return {Promise<LH.RunnerResult>}
     */
    async lighthouse(url, {flags, config, connection} = this.defaultParams) {

        logger.info('Audit is started');

        const result = await lighthouseLib(url, flags, config, connection);

        logger.info('Audit is finished');

        if (flags.output) {
            this.fileSystem.makeDir();

            function writeReport(data, extension) {
                const reportName = `${new Date().valueOf()}_PID_${process.pid}_lighthouse_report.${extension}`;

                logger.info(`The '${extension} report is generated'`);

                this.fileSystem.writeFileStream(data, reportName);
            }

            if (Array.isArray(flags.output)) {
                result.report.forEach((report, i) => writeReport(report, flags.output[i]));
            }

            writeReport(result.report, flags.output);
        }

        return result;
    }
}

module.exports = Lighthouse;
