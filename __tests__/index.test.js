import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'os';
import path from 'path';
import nock from 'nock';
import pageLoader, { makeFileName } from '../src';
import program from '../src/cli.js';

nock.disableNetConnect();

const getFixturePath = (file) => path.join('__fixtures__', file);
const getFixture = (file) => readFile(getFixturePath(file), 'utf-8');

let url;
let tmpdir;

beforeAll(() => {
  url = new URL('https://ru.hexlet.io/courses');
});

beforeEach(async () => {
  tmpdir = await mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('filepath should be kebab-case', () => {
  expect(makeFileName(url)).toBe('ru-hexlet-io-courses.html');
});

test.skip('should generate file in out dir', () => {
  // expect(pageLoader(url, tmpdir));
});

test('should output help', async () => {
  const help = await getFixture('help');
  const actural = program.helpInformation()
    .replace(/(?<=default:)\s+"\/.+?"/, ' "/home/user/current-dir"');
  expect(actural).toBe(help);
});
