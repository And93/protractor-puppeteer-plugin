export class LogHelper {

    private _log!: string;

    public generate(from: string, value: string): LogHelper {
        const date = new Date();
        const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
        this._log = `[${time}] [${from}] PID: ${process.pid}. ${value}`;
        return this;
    }

    public print(): void {
        // tslint:disable-next-line:no-console
        console.log(this._log);
    }
}

export const logHelper = new LogHelper();
