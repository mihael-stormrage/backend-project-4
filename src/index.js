import path from 'node:path';
import fs from 'node:fs/promises';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const makeFileName = ({ hostname, pathname }) => `${hostname}${pathname}`
  .replace(/\/|\.(?=.*[./])/g, '-')
  .replace(/-$/, '');

export default (url, out = process.cwd()) => axios(url).then(({ data }) => {
  const urlObject = new URL(url);
  const filename = makeFileName(urlObject);
  const filepath = path.join(out, `${filename}.html`);
  const dirname = `${filename}_files`;
  const dirPath = path.join(out, dirname);
  const $ = cheerio.load(data);
  const promises = [];
  const preparePromise = fs.mkdir(dirPath, { recursive: true }).then(() => $('img, link, script').each((i, e) => {
    const attr = e.name === 'link' ? 'href' : 'src';
    const src = $(e).attr(attr);
    const assetUrl = new URL(src, urlObject);
    if (!src || assetUrl.hostname !== urlObject.hostname) return;
    const assetName = makeFileName(assetUrl)
      .replace(/^([^.]+)(?!\.)$/, '$1.html');
    const newSrc = path.join(dirname, assetName);
    $(e).attr(attr, newSrc);
    promises.push(axios(assetUrl.href, { responseType: 'stream' })
      .then((asset) => fs.writeFile(path.join(out, newSrc), asset.data)));
  }));
  return preparePromise.then(() => Promise.all(promises))
    .then(() => fs.writeFile(filepath, $.html()))
    .then(() => filepath);
});
