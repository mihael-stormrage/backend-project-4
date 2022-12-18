import debug from 'debug';
import { AxiosError } from 'axios';
import { Command } from 'commander';
import pageLoader from './index.js';

const log = debug('page-loader');

const program = new Command();

const errMsgs = {
  AxiosError: (err) => `${err.message} at resource: ${err.config.url}`,
  ENOENT: () => `Output directory '${program.opts().output}' does not exist`,
  EEXIST: (err) => `Path already exist: ${err.path}`,
  EACCES: (err) => `Permission denied: ${err.path}`,
};

const handler = (url) => pageLoader(url, program.opts().output)
  .then((res) => console.log(res))
  .catch((err) => {
    process.exitCode = err.errno ?? 1;
    log(`Error type: ${err.constructor.name}`);
    if (err instanceof AxiosError) return errMsgs.AxiosError(err);
    log(err);
    if (err.syscall) return errMsgs[err.code]?.(err) ?? err.message;
    return err.message;
  }).then((msg) => console.error(msg));

program.name('page-loader').version('1.0.0')
  .description('Page loader utility')
  .arguments('<url>')
  .option('-o --output [dir]', 'output dir', process.cwd())
  .action(handler);

export default program;
