---
layout: page
title: Spider
id: spider
---

# {{ page.title }}

---

**sandcrawler**'s spiders enable you to perform complex scraping tasks.

They aim at visiting series of urls in order to scrape the retrieved pages' contents.

---

*Introduction*

* [Basics](#basics)

*Spider methods*

--*Feeding*

* [spider.url](#url)
* [spider.urls](#urls)
* [spider.addUrl](#addurl)
* [spider.addUrls](#addurls)
* [spider.iterate](#iterate)

--*Scraping*

* [spider.scraper](#scraper)
* [spider.scraperSync](#scraper-sync)

--*Lifecycle*

* [spider.result](#result)
* [spider.before](#before)
* [spider.beforeScraping](#before-scraping)
* [spider.afterScraping](#after-scraping)
* [spider.on/etc.](#on)

--*Configuration*

* [spider.config](#config)
* [spider.timeout](#timeout)
* [spider.limit](#limit)
* [spider.validate](#validate)
* [spider.throttle](#throttle)
* [spider.use](#use)

--*Controls*

* [spider.pause](#pause)
* [spider.resume](#resume)
* [spider.exit](#exit)

*Job specification*

* [job.req](#req)
* [job.res](#res)

*Conclusion*

* [Bonus](#bonus)

---

<h2 id="basics">Basics</h2>

Here is how a spider works:

* You must create it:

```js
var sandcrawler = require('sandcrawler');

var spider = sandcrawler.spider('MySpiderName');
```

* Then you must feed it with urls:

```js
spider.urls([
  'http://url1.com',
  'http://url2.com'
]);
```

* And specify the scraper they will use on those urls:

```js
spider.scraper(function($, done) {
  done($('.yummy-data').scrape());
});
```

* So you can do something with the results of the scraper:

```js
spider.result(function(err, req, res) {
  console.log('Yummy data!', res.data);
});
```

* Finally you must run the spider so it can start doing its job:

```js
spider.run(function(err, remains) {
  console.log('Finished!');
});
```

* Chained, it may look like this:

```js
var spider = sandcrawler('MySpiderName')
  .urls([
    'http://url1.com',
    'http://url2.com'
  ])
  .scraper(function($, done) {
    done(null, $('.yummy-data').scrape());
  })
  .result(function(err, req, res) {
    console.log('Yummy data!', res.data);
  })
  .run(function(err, remains) {
    console.log('Finished!');
  });
```

---

Note that if you need to perform your scraping task in a phantom, you just need to change the spider type and it should work the same:

```js
var spider = sandcrawler.phantomSpider();
// instead of
var spider = sancrawler.spider();
```

Be sure however to pay a visit to the [Phantom Spider]({{ site.baseurl }}/phantom_spider) page of this documentation to avoid typical pitfalls.

---

<h2 id="url">spider.url</h2>

This method can be used to add a single job to your spider's queue.

A job, in its most simple definition, is a mere url but can be described by an object to inform the spider you need finer parameters.

```js
spider.url(feed);
```

*Arguments*

* **feed** *string|object* : either a string representing the url you need to hit, or a descriptive object containing the possible keys listed below:

*Job descriptive object*:

* **url** *string|object*: the url you need to hit as a string or an object to be formatted by node's [url](http://nodejs.org/api/url.html) module.
* **auth** *?object*: an object containing at least a `user` and optionally a `password` to authenticate through http.
* **body** *?object|string*: if `bodyType` is set to `'form'`, either a querystring or an object that will be formatted as a querystring. If `bodyType` is set to `'json'`, either a JSON string or an object that will be stringified.
* **bodyType** *?string* [`'form'`]: either `'form'` or `'json'`.
* **cookies** *?array*: array of cookies to send with the request. Can be given as string or as an object that will be passed to [tough-cookie](https://www.npmjs.com/package/tough-cookie#properties).
* **data** *?mixed*: any arbitrary data, usually an object, you would need to attach to your job and pass along the spider for later user (a database id for instance).
* **headers** *?object*: object of custom headers to send with the request.
* **method** *?string* [`'GET'`]: http method to use.
* **timeout** *?integer* [`5000`]: time in milliseconds to perform the job before triggering a timeout.

*Examples*

```js
// String url
spider.url('http://nicesite.com');

// Url object
spider.url({
  port: 8000,
  hostname: 'nicesite.com'
});

// Job object
spider.url({
  url: {
    port: 8000,
    hostname: 'nicesite.com'
  },
  headers: {
    'User-Agent': 'The jawa avenger'
  },
  data: {
    id: 'nice1',
    location: './test/'
  }
});
```

---

<h2 id="urls">spider.urls</h2>

Same as `spider.url` except you can pass an array of jobs.

```js
spider.urls(feeds);
```

*Examples*

```js
spider.urls([
  'http://nicesite.com',
  'http://prettysite.com'
]);

spider.urls([
  {url: 'http://nicesite.com', method: 'POST'},
  {url: 'http://prettysite.com', method: 'POST'}
]);
```

*Note*

Under the hood, `spider.url` and `spider.urls` are strictly the same. It's just a matter of convention and style to dissociate them.

---

<h2 id="addurl">spider.addUrl</h2>

Alias of `spider.url`.

---

<h2 id="addurls">spider.addUrls</h2>

Alias of `spider.urls`.

---

<h2 id="iterate">spider.iterate</h2>

This method takes a function returning the next url from the result of the last job or `false` if you want to stop.

```js
spider.iterate(fn);
```

The given function will be passed the following arguments:

* **i** *integer*: index of the last job.
* **req** *object*: last job request.
* **res** *object*: last job's response.

*Example*

```js
// Spider starting on a single url and paginating from it
var spider = sandcrawler.spider()
  .url('http://nicesite.com')
  .iterate(function(i, req, res) {
    return res.data.nextUrl || false;
  })
  .scraper(function($, done) {
    done(null, {nextUrl: $('.next-page').attr('href')});
  });

// This is roughly the same as adding the next url at runtime
var spider = sandcrawler.spider()
  .url('http://nicesite.com')
  .scraper(function($, done) {
    done(null, {nextUrl: $('.next-page').attr('href')});
  })
  .result(function(err, req, res) {
    if (!err && res.data.nextUrl)
      this.addUrl(res.data.nextUrl);
  });
```

---

<h2 id="scraper">spider.scraper</h2>

This method registers the spider's scraping function.

```js
spider.scraper(fn);
```

This function will be given the following arguments:

* **$**: the retrieved html loaded into [cheerio](https://github.com/cheeriojs/cheerio) and extended with [artoo.scrape]({{ site.links.artoo }}/scrape).
* **done**: a callback to call when your scraping is done. This function is a typical node.js callback and takes as first argument an error if needed and the scraped data as second argument.

*Example*

```js
// Simplistic example to retrieve the page's title
spider.scraper(function($, done) {
  done(null, $('title').text());
});
```

*Note*

Any error thrown within this function will fail the current job but won't exit the process.

---

<h2 id="scraper-sync">spider.scraperSync</h2>

Synchronous version of `spider.scraper`.

```js
spider.scraperSync(fn);
```

This function will be given the following argument:

* **$**: the retrieved html loaded into [cheerio](https://github.com/cheeriojs/cheerio) and extended with [artoo.scrape]({{ site.links.artoo }}/scrape).

*Example*

```js
// Simplistic example to retrieve the page's title
spider.scraper(function($) {
  return $('title').text();
});
```

*Note*

Any error thrown within this function will fail the current job but won't exit the process.

---

<h2 id="result">spider.result</h2>

Method accepting a callback dealing with jobs' results.

```js
spider.result(fn);
```

This function will be given the following arguments:

* **err**: a potential error that occurred during the job's scraping process.
* **req**: the job's request you passed.
* **res**: the resultant response.

*Example*

```js
spider.result(function(err, req, res) {
  if (err) {
    console.log('Oh, no! An error!', err);
  }
  else {
    saveInDatabase(res.data);
  }
});
```

*Retries*

Note that within the result callback, you are given the opportunity to retry failed jobs.

There are three `req` method that you can use to do so:

* **req.retry/req.retryLater**: put the failed job at the end of the spider's queue so it can be retried later.
* **req.retryNow**: put the failed job at the front of the spider's queue so it can be retried immediately.

```js
spider.result(function(err, req, res) {
  if (err) {
    // Our job failed, let's retry now!
    req.retryNow();
  }
});
```

Note also that you can set a `maxRetries` [setting](#config) not to be trapped within an infinite loop of failures.

---

<h2 id="before">spider.before</h2>

Register a middleware applying before the spider starts its job queue.

This is useful if you need to perform tasks like logging into a website before being able to perform your scraping tasks.

```js
spider.before(fn);
```

The function passed will be given the following argument:

* **next**: the function to call with an optional error if failed. Note that if such an error is passed when applying `before` middlewares, then the spider will fail globally.

*Example*

```js
// Checking whether our database is available before launching the spider
var spider = sandcrawler.spider()
  .url('http://nicesite.com')
  .before(function(next) {
    if (databaseAvailable())
      return next();
    else
      return next(new Error('database-not-available'));
  });

sandcrawler.run(spider, function(err) {
  // database-not-available error here if our middleware failed
});
```

---

<h2 id="before-scraping">spider.beforeScraping</h2>

Register a middleware applying before the spider attempts to perform a scraping job.

This gives you the opportunity to discard a job before it's even performed.

The function passed will be given the following arguments:

* **req**: the request about to be passed.
* **next**: the function to call with an optional error if failed. Note that if such an error is passed when applying `beforeScraping` middlewares, then the job will be discarded.

*Example*

```js
// Checking whether we already scraped the url before
var scrapedUrls = {};

var spider = sandcrawler.spider()
  .url('http://nicesite.com')
  .beforeScraping(function(req, next) {
    if (scrapedUrls[req.url]) {
      return next(new Error('already-scraped'));
    }
    else {
      scrapedUrls[req.url] = true;
      return next();
    }
  });
```

---

<h2 id="after-scraping">spider.afterScraping</h2>

Register a middleware applying after the spider has performed a scraping job.

The function passed will be given the following arguments:

* **req**: the passed request.
* **res**: the resultant response.
* **next**: the function to call with an optional error if failed. Note that if such an error is passed when applying `afterScraping` middlewares, then the job will be failed.

*Example*

```js
// Validate the retrieved data
var spider = sandcrawler.spider()
  .url('http://nicesite.com')
  .scraperSync(function($) {
    return $('.title').scrape({
      title: 'text',
      href: 'href'
    });
  })
  .afterScraping(function(req, res, next) {
    if (!res.data.title || !res.data.href)
      return next(new Error('invalid-data'));
    else
      return next();
  });
```

---

<h2 id="bonus">Bonus</h2>

If you do not fancy spiders and believe they are a creepy animal that should be shunned, you remain free to use less fearsome names such as `droid` or `jawa`:

```js
var spider = sandcrawler.spider();
// is the same as
var droid = sandcrawler.droid();
// and the same as
var jawa = sandcrawler.jawa();
```