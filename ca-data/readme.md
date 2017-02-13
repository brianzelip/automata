# Cellular automata (elementary, one-dimensional) data

This `ca-data` directory started as a fork of [css-properties](https://github.com/johnotander/css-properties) by John Otander.

`build.js` scrapes [CA rules from Wolfram Atlas](http://atlas.wolfram.com/01/01/rulelist.html) to output a javascript object containing all 256 rule sets for one-dimensional elementary cellular automata.

Then `index.html` makes an XMLHttpRequest to `ruleSets.json` to initiate the automata.

Build `ruleSets.json` by running:

```bash
npm install

npm run build
```
