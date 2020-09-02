'use strict';

/**
 * @param namespace {string}
 */
function logger(namespace) {
    const date = new Date();
    const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;

    /**
     * @param value {string}
     * @return {string}
     */
    const log = value => `[${time}] [${namespace}] PID: ${process.pid}. ${value}`;

    return {
        /**
         * @param value {string}
         * @return {void}
         */
        info(value) {
            return console.info(log(value));
        },
        /**
         * @param value {string}
         * @return {void}
         */
        debug(value) {
            return console.debug(log(value));
        },
        /**
         * @param value {string}
         * @return {void}
         */
        error(value) {
            return console.error(log(value));
        },
        /**
         * @param value {string}
         * @return {void}
         */
        warn(value) {
            return console.warn(log(value));
        }
    }
}

module.exports = {logger};
