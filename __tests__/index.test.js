import { jest } from '@jest/globals';
import { AxiosError } from 'axios';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
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
let printErr;

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
  const fNock = nock(/foo/).persist();
  fNock.get(/\/\d{3}/).reply((uri) => [Number(uri.slice(1)), uri]);
  printErr = jest.spyOn(console, 'error');
});

beforeEach(async () => {
  tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

afterEach(async () => {
  await fs.rmdir(await tmpdir, { recursive: true });
  printErr.mockClear();
});

afterAll(() => {
  printErr.mockRestore();
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

test('lib should throw', async () => {
  const axiosError = pageLoader('https://foo/501', tmpdir);
  await expect(axiosError).rejects.toThrow(/Request failed .* 501/);
  await expect(axiosError).rejects.toThrow(AxiosError);

  await expect(pageLoader(url.href, '/baz')).rejects.toThrow(/ENOENT/);
  await expect(pageLoader(url.href, '/etc')).rejects.toThrow(/EACCES/);
  await pageLoader(url.href, tmpdir);
  await expect(pageLoader(url.href, tmpdir)).rejects.toThrow(/EEXIST/);
});

test('script should fail gracefully', async () => {
  const promises = [
    {
      argv: ['-o', tmpdir, 'https://foo/500'],
      expected: 'Request failed with status code 500 Internal Server Error at resource: https://foo/500',
    },
    { argv: ['-o', '/baz', url.href], expected: "Output directory '/baz' does not exist" },
    { argv: ['-o', '/etc', url.href], expected: 'Permission denied: /etc/ru-hexlet-io-courses_files' },
    { argv: ['-o', tmpdir, url.href], expected: '' },
    { argv: ['-o', tmpdir, url.href], expected: 'Path already exist: ' },
  ].map(async ({ argv, expected }) => {
    await program.parseAsync(argv, { from: 'user' });
    await expect(printErr).toHaveBeenCalledWith(expect.stringMatching(expected));
  });
  await Promise.all(promises);
});
