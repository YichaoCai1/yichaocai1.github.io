---
layout: default
permalink: /blog/
title: Blog
nav_title: blog
nav_title_zh: 博客
nav_url_zh: /zh/blog/
lang: en
lang_en_url: /blog/
lang_zh_url: /zh/blog/
nav: true
nav_order: 4
pagination:
  enabled: true
  collection: posts
  permalink: /page/:num/
  per_page: 5
  sort_field: date
  sort_reverse: true
  trail:
    before: 1 # The number of links before the current page
    after: 3 # The number of links after the current page
---

{% include blog-index.liquid %}
