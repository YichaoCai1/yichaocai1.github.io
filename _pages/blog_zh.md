---
layout: default
permalink: /zh/blog/
title: 博客
lang: zh
lang_en_url: /blog/
lang_zh_url: /zh/blog/
nav: false
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
blog_name: 博客
blog_description: Essays and notes on machine learning, representation learning, and adjacent ideas.
---

{% include blog-index.liquid %}
