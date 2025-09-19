import type { Plugin } from 'vite';
import { readFile } from 'fs/promises';

const viteBase64Loader: Plugin = {
    name: 'vite-base64-loader',
    async transform(_, id) {
        if (id.endsWith('?base64')) {
            const fileBuffer = await readFile(id);
            return fileBuffer.toString('base64');
        }

        return null;
    },
}

export default viteBase64Loader;