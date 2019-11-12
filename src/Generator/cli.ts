#!/usr/bin/env node

import { CLI, Shim } from 'clime';
import path from 'path';

const cli = new CLI('documen.ts', path.join(__dirname, 'Commands'));
const shim = new Shim(cli);

// eslint-disable-next-line no-console
shim.execute(process.argv).catch(err => console.error(err));
