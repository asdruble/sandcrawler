---
layout: page
title: Phantom Spider
id: phantom_spider
---

# {{ page.title }}

---

**sandcrawler**'s phantom spiders use [phantomjs](http://phantomjs.org/) to perform complex client-side scraping tasks that would not be possible only by retrieving the static markup of the pages you need to scrape.

They work in a quasi-identical way to the static spiders of this library and this page merely aims at explaining what are the key differences of the phantom spiders and outlining frequent pitfalls.

Note however that if what you want is to understand the basics of the library's spiders, you should go [there]({{ site.baseurl }}/spider) instead.

---

* [Creating a phantom spider](#creating)
* [Running a phantom spider](#running)
* [On the concept of jawascript](#jawascript)
* [Scraping environment](#environment)
* [spider.inlineScraper/inlineScraperSync](#inline)
* [Phantom-related configuration](#config)
* [Need a custom phantom?](#custom)

---
