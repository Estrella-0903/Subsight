import {copyFile} from 'node:fs/promises';
// GitHub Pages serves 404.html for client-side routes such as /Subsight/login.
await copyFile(new URL('../dist/index.html',import.meta.url),new URL('../dist/404.html',import.meta.url));
