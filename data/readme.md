# Rule sets data for cellular automata (elementary, one-dimensional)

This `data` directory started as a fork of [css-properties](https://github.com/johnotander/css-properties) by John Otander.

`build.js` scrapes [CA rules from Wolfram Atlas](http://atlas.wolfram.com/01/01/rulelist.html) to output a json file containing all 256 rule sets for one-dimensional elementary cellular automata.

`index.html` makes an XMLHttpRequest to `ruleSets.json` to initiate the automata.

Build `ruleSets.json` by running:

```bash
npm install

npm run build
```
