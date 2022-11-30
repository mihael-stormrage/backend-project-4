import { Command } from 'commander';
import pageLoader from './index.js';

const program = new Command();

const cwd = process.cwd();

program.name('page-loader').version('1.0.0')
  .description('Page loader utility')
  .arguments('<url>')
  .option('-o --output [dir]', 'output dir', cwd)
  .action((url) => console.log(pageLoader(url, program.opts().output)));

export default program;
