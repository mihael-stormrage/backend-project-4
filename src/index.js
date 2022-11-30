import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import kebabCase from 'lodash/kebabCase.js';
import axios from 'axios';

export const makeFileName = ({ hostname, pathname }) => `${kebabCase(`${hostname}${pathname}`)}.html`;

export default (url, out = process.cwd()) => {
  axios(url).then(({ data }) => {
    const filename = makeFileName(new URL(url));
    const filepath = path.join(out, filename);
    return writeFile(filepath, data).then(() => filepath);
  });
};
