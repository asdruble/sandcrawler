/**
 * Sandcrawler Static Engine
 * ==========================
 *
 * Using request to retrieve given urls statically.
 */
var request = require('request'),
    artoo = require('artoo-js'),
    cheerio = require('cheerio'),
    extend = require('../helpers.js').extend;

// Bootstrapping cheerio
artoo.bootstrap(cheerio);

/**
 * Main
 */
function StaticEngine(spider) {

  this.type = 'static';

  // Spider run method
  spider.run = function(callback) {
    if (this.state.running)
      throw Error('sandcrawler.spider.run: spider already running.');
    return spider._start(callback);
  };

  // Fetching method
  this.fetch = function(job, callback) {

    // Request settings
    var settings = {
      headers: extend(job.req.headers, spider.options.headers),
      method: job.req.method || spider.options.method,
      timeout: job.req.timeout || spider.options.timeout,
      uri: job.req.url
    };

    if (job.req.auth || spider.options.auth)
      settings.auth = extend(job.req.auth, spider.options.auth);

    var bodyType = job.req.bodyType || spider.options.bodyType,
        body = typeof job.req.body === 'string' ?
          job.req.body :
          extend(job.req.body, spider.options.body);

    if (body) {
      if (bodyType === 'json') {
        if (typeof body === 'string') {
          settings.body = body;
          settings.headers['Content-Type'] = 'application/json';
        }
        else {
          settings.json = true;
          settings.body = body;
        }
      }
      else {
        settings.form = body;
      }
    }

    request(settings, function(err, response, body) {

      // If an error occurred
      if (err) {
        if (err.message === 'ETIMEDOUT')
          return callback(new Error('timeout'));
        if (~err.message.search(/getaddrinfo/))
          return callback(new Error('host-not-found'));
        return callback(err);
      }

      // Overloading
      job.res.url = response.request.href;
      job.res.body = body;
      job.res.status = response.statusCode;
      job.res.headers = response.caseless.dict;

      // Status error
      if (response.statusCode >= 400) {
        var error = new Error('status-' + (response.statusCode || 'unknown'));
        error.status = response.statusCode;
        return callback(error);
      }

      // Parsing
      if (spider.scraperScript) {
        var $ = cheerio.load(job.res.body);

        if (spider.synchronousScraperScript) {
          try {
            job.res.data = spider.scraperScript.call(spider, $);
          }
          catch (e) {
            return callback(e);
          }

          return callback(null, job.res.data);
        }
        else {
          try {
            spider.scraperScript.call(spider, $, function(err, data) {
              job.res.data = data;
              return callback(err, data);
            });
          }
          catch (e) {
            return callback(e);
          }
        }
      }
      else {
        return callback(null, job);
      }
    });
  };
}

/**
 * Exporting
 */
module.exports = StaticEngine;
