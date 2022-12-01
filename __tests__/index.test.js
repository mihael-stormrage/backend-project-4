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
let img;

beforeAll(async () => {
  url = new URL('https://ru.hexlet.io/courses');
  img = await getFixture('nodejs.png', null);
  nock(url.origin).get(url.pathname).reply(200, await getFixture('ru-hexlet-io-courses.initial.html'));
  nock(url.origin).get(/\/assets\/.+/).reply(200, img);
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
  const savedImg = await fs.readFile(savedImgPath);
  expect(file).toBe(cheerio.load(await getFixture('ru-hexlet-io-courses.html')).html());
  expect(savedImg).toStrictEqual(img);
});

test('should output help', async () => {
  const help = await getFixture('help');
  const actual = program.helpInformation()
    .replace(/(?<=default:)\s+"\/.+?"/, ' "/home/user/current-dir"');
  expect(actual).toBe(help);
});
