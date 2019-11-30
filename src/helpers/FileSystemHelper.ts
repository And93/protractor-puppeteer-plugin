import {createWriteStream, mkdirSync} from 'fs';
import {join, resolve} from 'path';

export class FileSystemHelper {
    constructor(private path: string) {
    }

    public getDirPath(dirname = this.path) {
        return resolve(join(process.cwd(), dirname));
    }

    public makeDir(): void {
        return mkdirSync(this.getDirPath());
    }

    public writeFileStream(data: string, name: string, encoding?: BufferEncoding): void {
        const file = join(process.cwd(), this.path, name);
        const stream = createWriteStream(file);
        stream.write(Buffer.from(data, encoding));
        stream.end();
    }
}
