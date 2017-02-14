
let ruleSets = {};

//XHR code to load external json
//adapted from http://stackoverflow.com/a/14388512/2145103
function fetchJSON(path, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (callback) callback(data);
      }
    }
  };
  xhr.open('GET', path, false);//the third arg here, false, forces sync
  //instead of async, resulting in the function waiting until json is
  //fully loaded to move forward
  //see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
  xhr.send();
}
fetchJSON('data/ruleSets.json', (data) => { ruleSets = data });

const cw = document.getElementById('cellular-world');
const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//variable to capture row and cell measurements
/*
  argh!!! damn safari inserts its own stylesheet AFTER all of the document's stylesheets, so my code below doesn't work for targeting the css style values in safari.
  A solution might lie in https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement, especially CSSValues or something similar.
  HOWEVER - i'm not trying to go forward with the approach of defining these key variables based on the hard coded css values. instead i'm thinking about implementing media queries to determine the layout based on device viewport, and THEN define the cell and row variables below based on the dimensions of #cellular-world.
*/
const internalStyleSheet = document.styleSheets[document.styleSheets.length - 1];
const worldWidth = internalStyleSheet["cssRules"][0]["style"]["width"].replace('px', '');
const worldHeight = internalStyleSheet["cssRules"][0]["style"]["height"].replace('px', '');
const cellSize = internalStyleSheet["cssRules"][2]["style"]["height"].replace('px', '');

let rows = {
  create: function() {
    let row = document.createElement('div');
    cw.appendChild(row);
    row.id = 'r' + (cw.children.length - 1);
    row.classList.add('row');
  },
  numRowsPerViewport: ((Math.round(vh / cellSize))),
  numRowsPerWorld: ((Math.round(worldHeight / cellSize)))
}

let cells = {
  grow: function() {
    let row = document.getElementById('r' + (cw.children.length - 1));
    for (let i=0; i<cells.numCellsPerRowPerWorld; i++) {
      let cell = document.createElement('div');
      cell.classList.add('cell');
      cell.id = 'r' + (cw.children.length - 1) + 'c' + i;
      row.appendChild(cell);
    }
  },
  numCellsPerRow: ((Math.round(vw / cellSize))),
  numCellsPerRowPerWorld: ((Math.round(worldWidth / cellSize))),
  godMode: function() {
    function randomBinary() {
      let min = 0;
      let max = 1;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    let cells = document.querySelectorAll('#r' + (cw.children.length - 1) + ' > div');
    Array.from(cells).map(cell => cell.classList.add(randomBinary() ? 'active' : 'inactive'));
  },
  natureMode: function(ruleSet) {
    let previousCells = document.querySelectorAll('#r' + (cw.children.length - 2) + ' > div');
    let currentCells = document.querySelectorAll('#r' + (cw.children.length - 1) + ' > div');

    for (let i=0; i<currentCells.length; i++) {
      let self = currentCells[i];
      let prevSelf = previousCells[i];
      let prevNeighborLeft = previousCells[i - 1] || previousCells[previousCells.length - 1];
      let prevNeighborRight = previousCells[i + 1] || previousCells[0];

      self.classList.add(ruleSets[ruleSet][cells.neiborhoodScore(prevNeighborLeft, prevSelf, prevNeighborRight)]);
    }
  },
  isActive: function(cell) {
    return cell.classList.contains('active');
  },
  neiborhoodScore: function(prevLeft, prevSelf, prevRight) {
    let score = (cells.isActive(prevLeft) ? '1' : '0')
      + (cells.isActive(prevSelf) ? '1' : '0')
      + (cells.isActive(prevRight) ? '1' : '0');
    return score;
  }
}

let initGod = function() {
  rows.create();
  cells.grow();
  cells.godMode();
}

let initNature = function(ruleSet) {
  for (let i = 1; i < rows.numRowsPerWorld; i++) {
    rows.create();
    cells.grow();
    cells.natureMode(ruleSet);
  }
}

let interactions = {
  select: document.querySelector('select'),
  ruleSetOptions: function(index) {
    let option = document.createElement('option');
    interactions.select.appendChild(option);
    option.setAttribute('value', index);
    option.innerText = index;
    // option.classList.add('row');
  },
  numRules: 256,
  initRuleOptions: function() {
    for (let i=0; i<interactions.numRules; i++) {
      interactions.ruleSetOptions(i);
    };
    interactions.randomRuleSelect();
  },
  randomRule: function() {
    min = Math.ceil(0);
    max = Math.floor(255);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  randomRuleSelect: function() {
    let options = document.querySelectorAll('option');
    options[interactions.randomRule()].setAttribute('selected', true);
  }
}

initGod();
initNature(110);
interactions.initRuleOptions();

/*
  REFERENCES:
  - Child selectors, https://developer.mozilla.org/en-US/docs/Web/CSS/Child_selectors
  - Node.cloneNode(), https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
  - Array.from(), https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
  - Math.random(), https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values_inclusive
  ParentNode.children(), https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children
  - getElementById(), https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
  - Node.insertBefore(), https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
  - Node.firstChild, https://developer.mozilla.org/en-US/docs/Web/API/Node/firstChild
  - NodeList.forEach(), https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
  - #Objects and properties, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#Objects_and_properties
  - Element.classList, https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
  - Viewport width and height in js, http://stackoverflow.com/a/8876069/2145103
  -
  -
  -
  - create global variable from external js file, http://stackoverflow.com/a/3244411/2145103
  - XHR boilerplate code, http://stackoverflow.com/a/14388512/2145103
  - XHR.open, https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
  - JSON.parse(), https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
  -
*/
