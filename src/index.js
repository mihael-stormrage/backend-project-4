import path from 'node:path';
import fs from 'node:fs/promises';
import kebabCase from 'lodash/kebabCase.js';
import axios from 'axios';

export const makeFileName = ({ hostname, pathname }) => `${kebabCase(`${hostname}${pathname}`)}.html`;

export default (url, out = process.cwd()) => axios({ url: url.href, responseType: 'stream', responseEncoding: 'utf8' }).then(({ data }) => {
  const filename = makeFileName(new URL(url));
  const filepath = path.join(out, filename);
  return fs.open(filepath, 'w')
    .then((fh) => {
      const stream = fh.createWriteStream();
      // eslint-disable-next-line no-promise-executor-return
      const res = new Promise((resolve) => stream.on('finish', resolve));
      data.pipe(process.stdout);
      data.pipe(stream);
      return res;
    })
    .then(() => filepath);
});
