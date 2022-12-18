import fs from 'node:fs/promises';
import os from 'os';
import path from 'path';
import nock from 'nock';
import * as cheerio from 'cheerio';
import pageLoader, { makeFileName } from '../src';
import program from '../src/cli.js';

nock.disableNetConnect();

const getFixturePath = (file) => path.join('__fixtures__', file);
const getFixture = (file, encoding = 'utf-8') => fs.readFile(getFixturePath(file), encoding);

let url;
let tmpdir;
let htmlFixture;
let imgFixture;
let cssFixture;
let jsFixture;

beforeAll(async () => {
  url = new URL('https://ru.hexlet.io/courses');
  htmlFixture = await getFixture('ru-hexlet-io-courses.initial.html');
  imgFixture = await getFixture('nodejs.png', null);
  cssFixture = await getFixture('application.css');
  jsFixture = await getFixture('runtime.js');
  const pNock = nock(url.origin).persist();
  pNock.get(url.pathname).reply(200, htmlFixture);
  pNock.get(/\/assets\/.+?\.png/).reply(200, imgFixture);
  pNock.get(/\/assets\/.+?\.css/).reply(200, cssFixture);
  pNock.get(/\/packs\/js\/.+?\.js/).reply(200, jsFixture);
});

beforeEach(async () => {
  tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

afterEach(async () => {
  await fs.rmdir(await tmpdir, { recursive: true });
});

test('filepath should be kebab-case', () => {
  expect(makeFileName(url)).toBe('ru-hexlet-io-courses');
});

test('should generate files in out dir', async () => {
  const filepath = await pageLoader(url.href, tmpdir);
  const file = await fs.readFile(filepath, 'utf-8');
  const $ = cheerio.load(file);

  const savedImgPath = path.join(tmpdir, $('img').attr().src);
  const savedLinkPath = path.join(tmpdir, $('link:nth-of-type(2)').attr().href);
  const savedScriptPath = path.join(tmpdir, $('script:last-child').attr().src);
  const savedImg = await fs.readFile(savedImgPath);
  const savedLink = await fs.readFile(savedLinkPath, 'utf8');
  const savedScript = await fs.readFile(savedScriptPath, 'utf8');

  expect(file).toBe(cheerio.load(await getFixture('ru-hexlet-io-courses.html')).html());
  expect(savedImg).toStrictEqual(imgFixture);
  expect(savedLink).toStrictEqual(cssFixture);
  expect(savedScript).toStrictEqual(jsFixture);
});

test('should output help', async () => {
  const help = await getFixture('help');
  const actual = program.helpInformation()
    .replace(/(?<=default:)\s+"\/.+?"/, ' "/home/user/current-dir"');
  expect(actual).toBe(help);
});

/* TODO
 * Test exceptions:
 * - library should throw
 * - script should fail gracefully with:
 *   - proper exit code
 *   - user-friendly message
 *
 * test cases:
 *   $ page-loader -o /etc https://scrapeme.live/shop/
 *   > Permission denied: /etc/scrapeme-live-shop_files
 *
 *   $ page-loader -o /baz https://scrapeme.live/shop/
 *   > Output directory '/baz' does not exist
 *
 *   $ page-loader -o tmp https://scrapeme.live/shop/
 *   > Path already exist: tmp/scrapeme-live-shop_files
 */
