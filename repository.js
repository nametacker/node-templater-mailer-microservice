'use strict'

var _ = require('lodash')
var Promise = require('bluebird')

/**
 * @param {redis} redis
 * @param {String} prefix
 * @constructor
 */
var Repository = function (redis, prefix) {
  this.redis = redis
  this.prefix = _.trim(prefix, ':') + ':'
}

/**
 * @param {String} id
 * @param {String} data
 * @return {promise}
 */
Repository.prototype.store = function (id, data) {
  var self = this
  return Promise.try(function () {
    return self.redis.setAsync(self.prefix + id, JSON.stringify(data))
  })
}

/**
 * @param {String} id
 * @return {promise}
 */
Repository.prototype.fetch = function (id) {
  var self = this
  return Promise.try(function () {
    return self.redis.getAsync(self.prefix + id)
  }).then(function (data) {
    return JSON.parse(data)
  })
}

function scan (redis, prefix, cursor) {
  return redis.scanAsync(cursor, 'MATCH', prefix + '*', 'COUNT', '100')
}

/**
 * @return {promise}
 */
Repository.prototype.list = function () {
  var self = this
  return Promise.try(function () {
    var cursor = '0'
    var keys = []
    var scanFunc = scan.bind(scan, self.redis, self.prefix)
    return scanFunc(cursor)
      .then(function (result) {
        cursor = result[0]
        keys = keys.concat(result[1])
        if (cursor === '0') {
          return keys
        }
        return scanFunc(cursor).then(this)
      })
  }).then(function (keys) {
    return Promise.map(keys, function (key) {
      return self.redis.getAsync(key).then(function (data) {
        return [_.trimLeft(key, self.prefix), JSON.parse(data)]
      })
    })
  })
}

module.exports = Repository
