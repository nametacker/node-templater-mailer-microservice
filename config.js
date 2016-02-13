'use strict'

// Case insensitive env variables
// See https://github.com/indexzero/nconf/pull/177
Object.keys(process.env).forEach(function (key) {
  process.env[key.toLowerCase()] = process.env[key]
})

var nconf = require('nconf')

nconf
  .file('local', {file: 'config.local.json'})   // read local overwrite
  .argv()                                       // Allow overwrites from command-line
  .env()                                        // Allow overwrites from env
  .file('default', {file: 'config.json'})      // read defaults

nconf.set('deployVersion', +new Date())
nconf.set('version', require('./package.json').version)
nconf.set('app', require('./package.json').name)

module.exports = nconf
