'use strict';

class LogHelper {

    generate(from, value) {
        const date = new Date();
        const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
        this._log = `[${time}] [${from}] PID: ${process.pid}. ${value}`;
        return this;
    }

    print() {
        console.log(this._log);
    }
}

const logHelper = new LogHelper();

module.exports = {logHelper};
