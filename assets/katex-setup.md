# KaTeX

The website loads KaTeX 0.19.1 from jsDelivr (pinned version and Subresource Integrity).
No API key or processing server is required. Normal content remains legible if KaTeX is offline.
To make mathematical typesetting fully offline, download the KaTeX release bundle
from https://github.com/KaTeX/KaTeX/releases and place `katex.min.js`,
`katex.min.css`, and the `fonts` directory under `assets/vendor/katex/`.
Then replace the CDN URLs in the HTML build templates with the relative local URLs,
rebuild the pages, and redistribute under KaTeX's MIT terms.
Never include a font file obtained from an unlicensed source.
