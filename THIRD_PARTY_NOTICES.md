# Website design acknowledgments

## PDF reader

The on-site PDF reader uses Mozilla's [PDF.js 6.3.289 legacy distribution](https://github.com/mozilla/pdf.js/releases/tag/v6.3.289), licensed under Apache 2.0. Its license and bundled font/resource notices are retained in `assets/vendor/pdfjs/`. Source maps, debugging tools, and the example PDF are omitted. The viewer HTML loads a local site skin and configuration; the PDF.js JavaScript bundles are unchanged.

The current visual presentation follows [Pavlo Bazilinskyy’s website](https://github.com/bazilinskyy/bazilinskyy.github.io): its fixed navigation, typography, page proportions, light/dark palette, and publication catalogue. The local implementation uses this repository’s own Jekyll layouts, bibliography, and JavaScript; the reference site’s personal content, data, and analytics are not included.

The previous academic presentation was adapted from [Leonid Keselman's Jekyll template](https://github.com/leonidk/leonidk.github.io), itself based on [Jon Barron's website](https://jonbarron.info/).

The implementation retains this site's Jekyll/al-folio foundation and its existing license in `LICENSE`. The template's personal text, photographs, publications, and project images are not included. The following upstream notice is retained for the template's Jekyll Now ancestry.

## Jekyll Now / Leonid Keselman template license

Source: https://github.com/leonidk/leonidk.github.io/blob/master/LICENSE

The MIT License (MIT)

Copyright (c) 2015 Barry Clark

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
