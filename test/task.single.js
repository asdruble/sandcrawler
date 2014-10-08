/**
 * Sandcrawler Single Url Task Tests
 * ==================================
 *
 * Basic tests where we want to scrape the content of single urls. Useful to
 * scaffold the basics of the API.
 */
var assert = require('assert'),
    sandcrawler = require('../index.js');

describe('Single Url Task', function() {

  // Crawler used throughout the tests
  var crawler = null;

  // Validation data
  var simpleList = [
    'http://nicesite.com',
    'http://awesomesite.com',
    'http://prettysite.com',
    'http://unknownsite.com'
  ];

  before(function(done) {
    sandcrawler.create({}, function(err, instance) {
      crawler = instance;

      // Debug hook
      crawler.on('single:phantom:log', function(message) {
        console.log('single:phantom:log', message);
      });

      crawler.on('single:phantom:error', function(message) {
        console.log('single:phantom:error', message);
      });

      done();
    });
  });

  it('should be possible to scrape from a lone url.', function(done) {

    crawler
      .task('http://localhost:8001/basic.html')
      .inject(function() {

        var data = artoo.scrape('.url-list a', 'href');
        artoo.done(data);
      })
      .then(function(data) {

        assert.deepEqual(data, simpleList);
        done();
      });
  });

  it('should be possible to provide a string as the scraper.', function(done) {

    crawler
      .task('http://localhost:8001/basic.html')
      .inject("var data = artoo.scrape('.url-list a', 'href'); artoo.done(data);")
      .then(function(data) {

        assert.deepEqual(data, simpleList);
        done();
      });
  });

  it('should be possible to provide a file as the scraper.', function(done) {
    crawler
      .task('http://localhost:8001/basic.html')
      .injectScript(__dirname + '/resource/basic_scraper.js')
      .then(function(data) {

        assert.deepEqual(data, simpleList);
        done();
      });
  });

  it('should be possible to validate the retrieved data against a function.', function(done) {

    crawler
      .task('http://localhost:8001/basic.html')
      .inject(function() {

        var data = artoo.scrape('.url-list a', 'href');
        artoo.done(data);
      })
      .validate(function(data) {
        return data instanceof Array;
      })
      .then(function(data) {

        assert.deepEqual(data, simpleList);
        done();
      });
  });

  it('should be possible to validate the retrieved data against type definition.', function(done) {

    crawler
      .task('http://localhost:8001/basic.html')
      .inject(function() {

        var data = artoo.scrape('.url-list a', 'href');
        artoo.done(data);
      })
      .validate('array|object')
      .then(function(data) {

        assert.deepEqual(data, simpleList);
        done();
      });
  });

  it('should fail when the retrieved data is not valid.', function(done) {
    crawler
      .task('http://localhost:8001/basic.html')
      .inject(function() {

        var data = artoo.scrape('.url-list a', 'href');
        artoo.done(data);
      })
      .validate('string')
      .fail(function(err) {
        assert.strictEqual(err.message, 'invalid-data');
        done();
      });
  });

  it('should be possible to subscribe to the page log.', function(done) {

    crawler
      .task('http://localhost:8001/basic.html')
      .inject(function() {
        console.log('Hello world!');
        artoo.done();
      })
      .on('page:log', function(url, message) {
        assert(url === 'http://localhost:8001/basic.html');
      })
      .then(done);
  });

  it('should be possible to subscribe to the page errors.', function(done) {

    crawler
      .task('http://localhost:8001/basic.html')
      .config({timeout: 100})
      .inject(function() {
        throw Error('test');
      })
      .on('page:error', function(url, message) {
        assert(url === 'http://localhost:8001/basic.html');
        assert(message === 'Error: test');
      })
      .fail(function(err) {
        done();
      });
  });

  it('should be possible to scrape a real-life page.', function(done) {

    crawler
      .task('http://localhost:8001/transparency1.html')
      .inject(function() {
        var data = $('.decisions').scrape({
          title: {
            sel: '.sous-titre > h3'
          },
          date: {
            sel: '.date'
          },
          text: {
            sel: '.date + div'
          }
        });
        artoo.done(data);
      })
      .then(function(data) {
        assert(data.length === 15);
        done();
      });
  });

  after(function() {
    crawler.spy.kill();
  });
});