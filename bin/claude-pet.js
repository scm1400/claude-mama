#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const electronPath = require('electron');
const appPath = path.join(__dirname, '..', 'dist', 'main', 'main', 'main.js');

const child = spawn(electronPath, [appPath], {
  stdio: 'ignore',
  detached: true,
});

child.unref();
