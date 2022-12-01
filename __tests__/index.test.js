import fs from 'node:fs/promises';
import os from 'os';
import path from 'path';
import nock from 'nock';
import * as cheerio from 'cheerio';
import pageLoader, { makeFileName } from '../src';
import program from '../src/cli.js';

nock.disableNetConnect();

const getFixturePath = (file) => path.join('__fixtures__', file);
const getFixture = (file) => fs.readFile(getFixturePath(file), 'utf-8');

let url;
let tmpdir;

beforeAll(async () => {
  url = new URL('https://ru.hexlet.io/courses');
  nock(url.origin).get(url.pathname).reply(200, await getFixture('html.html'));
});

beforeEach(async () => {
  tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

afterEach(async () => {
  await fs.rmdir(await tmpdir, { recursive: true });
});

test('filepath should be kebab-case', () => {
  expect(makeFileName(url)).toBe('ru-hexlet-io-courses.html');
});

test('should generate file in out dir', async () => {
  const filepath = await pageLoader(url.href, tmpdir);
  const file = await fs.readFile(filepath, 'utf-8');
  const $ = cheerio.load(file, null, false);
  expect($('img').attr().src).toBe('https://freenaturestock.com/wp-content/uploads/freenaturestock-2086-1024x589.jpg');
});

test('should output help', async () => {
  const help = await getFixture('help');
  const actual = program.helpInformation()
    .replace(/(?<=default:)\s+"\/.+?"/, ' "/home/user/current-dir"');
  expect(actual).toBe(help);
});
