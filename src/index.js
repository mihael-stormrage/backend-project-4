import path from 'node:path';
import fs from 'node:fs/promises';
import kebabCase from 'lodash/kebabCase.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const makeFileName = ({ hostname, pathname }) => `${kebabCase(`${hostname}${pathname}`)}`;

export default (url, out = process.cwd()) => axios(url).then(({ data }) => {
  const urlObject = new URL(url);
  const filename = makeFileName(urlObject);
  const filepath = path.join(out, `${filename}.html`);
  const dirname = `${filename}_files`;
  const dirPath = path.join(out, dirname);
  const $ = cheerio.load(data);
  const promises = [];
  const preparePromise = fs.mkdir(dirPath, { recursive: true }).then(() => $('img').each((i, e) => {
    const src = $(e).attr('src');
    const imgUrl = new URL(src, urlObject);
    const imgName = makeFileName(imgUrl).replace(/-([a-z]+)$/, '.$1');
    const newSrc = path.join(dirname, imgName);
    $(e).attr('src', newSrc);
    promises.push(axios(imgUrl.href, { responseType: 'stream' })
      .then((img) => fs.writeFile(path.join(out, newSrc), img.data)));
  }));
  return preparePromise.then(() => Promise.all(promises))
    .then(() => fs.writeFile(filepath, $.html()))
    .then(() => filepath);
});
