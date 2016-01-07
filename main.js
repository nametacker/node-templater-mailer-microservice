'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
Promise.longStackTraces();
Promise.promisifyAll(require('fs'));
var config = require('./config');

var bunyan = require('bunyan');
var logging = bunyan.createLogger({name: config.get('app')});

var redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
var redisClient = redis.createClient(config.get('redis'));
redisClient.on('error', function (err) {
  logging.error(err);
});

var Repository = require('./repository');
var SmtpCredentialRepository = new Repository(redisClient, config.get('app') + ':smtp_credentials');
function logItems(info, itemList) {
  logging.info(info);
  _.map(itemList, function (item) {
    logging.info(item[0] + ':', item[1]);
  });
}
SmtpCredentialRepository.list().then(logItems.bind(null, 'Configured SMTP-Credentials:'));
var TemplateRepository = new Repository(redisClient, config.get('app') + ':templates');
TemplateRepository.list().then(logItems.bind(null, 'Configured Templates:'));

// Set up app
var express = require('express');
var app = express();
require('./api')(app, config, logging, SmtpCredentialRepository, TemplateRepository);

// Expose app
app.listen(config.get('port'), config.get('host'));
logging.info(config.get('app') + ' v' + config.get('version') + ' (Node ' + process.version + ') started');
logging.info('--port ' + config.get('port'));
logging.info('--host ' + config.get('host'));
logging.info('--redis.port ' + config.get('redis').port);
logging.info('--redis.host ' + config.get('redis').host);

module.exports = app;
