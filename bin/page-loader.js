#!/usr/bin/env node

import { Command } from 'commander';
import pageLoader from '../src/index.js';

const program = new Command();

const cwd = process.cwd();

program.name('page-loader').version('1.0.0')
  .description('Page loader utility')
  .arguments('<url>')
  .option('-o --output [dir]', `output dir (default: "${cwd}")`, cwd)
  .action((url) => console.log(pageLoader(url, program.opts().output)));

program.parse();
