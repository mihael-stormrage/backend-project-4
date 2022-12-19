import path from 'node:path';
import debug from 'debug';
import { STATUS_CODES } from 'http';
import { AxiosError } from 'axios';
import { Command } from 'commander';
import pageLoader from './index.js';

const log = debug('page-loader');

const program = new Command();

const errMsgs = {
  AxiosError: (err) => `${err.message} ${STATUS_CODES[err.response?.status] ?? ''} at resource: ${err.config.url}`,
  ENOENT: (err) => `Output directory '${path.parse(err.path).dir}' does not exist`,
  EEXIST: (err) => `Path already exist: ${err.path}`,
  EACCES: (err) => `Permission denied: ${err.path}`,
};

const handler = (url, { output }) => pageLoader(url, output)
  .then(console.log)
  .catch((err) => {
    process.exitCode = err.errno ?? 1;
    log(`Error type: ${err.constructor.name}`);
    if (err instanceof AxiosError) throw errMsgs.AxiosError(err);
    log(err);
    if (err.syscall) throw errMsgs[err.code]?.(err) ?? err.message;
    throw err.message;
  }).catch(console.error);

program.name('page-loader').version('1.0.0')
  .description('Page loader utility')
  .arguments('<url>')
  .option('-o --output [dir]', 'output dir', process.cwd())
  .action(handler);

export default program;
