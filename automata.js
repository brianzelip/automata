
let ruleSets = {};

const cw = document.getElementById('cellular-world');
const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

const select = document.querySelector('select');
let selectOptions = document.querySelectorAll('option');
const numRules = 256;
const randomRuleOnPageLoad = randomRule();
const clearBtn = document.getElementById('clear');

const internalStyleSheet = document.styleSheets[document.styleSheets.length - 1];
// const worldWidth = internalStyleSheet["cssRules"][0]["style"]["width"].replace('px', '');
// const worldHeight = internalStyleSheet["cssRules"][0]["style"]["height"].replace('px', '');
// const cellSize = internalStyleSheet["cssRules"][2]["style"]["height"].replace('px', '');

const worldWidth = (cw.offsetWidth - 1);
const worldHeight = (vh - document.querySelector('header').offsetHeight) - 16;
const cellSize = internalStyleSheet["cssRules"][2]["style"]["height"].replace('px', '');


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

//variable to capture row and cell measurements
/*
  argh!!! damn safari inserts its own stylesheet AFTER all of the document's stylesheets, so my code below doesn't work for targeting the css style values in safari.
  A solution might lie in https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement, especially CSSValues or something similar.
  HOWEVER - i'm not trying to go forward with the approach of defining these key variables based on the hard coded css values. instead i'm thinking about implementing media queries to determine the layout based on device viewport, and THEN define the cell and row variables below based on the dimensions of #cellular-world.
*/

let rows = {
  create: function() {
    let row = document.createElement('div');
    cw.appendChild(row);
    row.id = 'r' + (cw.children.length - 1);
    row.classList.add('row', 'center');
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


function ruleSetOptions(index) {
  let option = document.createElement('option');
  select.appendChild(option);
  option.setAttribute('value', index);
  option.innerText = index;
  // option.classList.add('row');
};

function initRuleOptions() {
  for (let i=0; i<numRules; i++) {
    ruleSetOptions(i);
  };
  selectRandomRule();
};

function randomRule() {
  min = Math.ceil(0);
  max = Math.floor(255);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function selectRandomRule() {
  let options = document.querySelectorAll('option');
  options[randomRule()].setAttribute('selected', true);
};

function clearWorld() {
  while (cw.lastChild) {
    cw.removeChild(cw.lastChild);
  };
};

clearBtn.addEventListener('click', function() {
  clearWorld();
})

function renderUserSelectedRule(ruleNumber) {
  clearWorld();
  initGod();
  initNature(ruleNumber);
};

select.addEventListener('change', function() {
  let ruleSelectedByUser = this.value;
  renderUserSelectedRule(ruleSelectedByUser);
});

// selectOptions.addEventListener('keydown', function() {
//   let ruleSelectedByUser = this.value
//   renderUserSelectedRule(ruleSelectedByUser);
// });

initGod();
initNature(randomRuleOnPageLoad);
initRuleOptions();

/*
  REFERENCES:
  - funfunfunction #49, https://www.youtube.com/watch?v=bc-fVdbjAwk
  - Wolfram's rules of one-dimensional, elementary, cellular automata, http://atlas.wolfram.com/01/01/
  - Nature of Code Chapter 7. Cellular Automata, http://natureofcode.com/book/chapter-7-cellular-automata/
  - Child selectors, https://developer.mozilla.org/en-US/docs/Web/CSS/Child_selectors
  - Node.cloneNode(), https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
  - Array.from(), https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
  - Math.random(), https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values_inclusive
  ParentNode.children, https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children
  - getElementById(), https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
  - Node.insertBefore(), https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
  - Node.firstChild, https://developer.mozilla.org/en-US/docs/Web/API/Node/firstChild
  - NodeList, https://developer.mozilla.org/en-US/docs/Web/API/NodeList
  - NodeList.forEach(), https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
  - using data attributes, https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children
  - element.attributes, https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes
  - Working with objects#Objects and properties, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#Objects_and_properties
  - bind and this funfunfunction, https://www.youtube.com/watch?v=GhbhD1HR5vk
  - function.bind(), https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
  - working with functions, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects
  - bind function to another func, http://stackoverflow.com/q/17137329/2145103
  - Element.id, https://developer.mozilla.org/en-US/docs/Web/API/Element/id
  - Element.classList, https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
  - Combinators and multiple selectors, https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Combinators_and_multiple_selectors
  - Viewport width and height in js, http://stackoverflow.com/a/8876069/2145103
  - COPY() FROM THE CONSOLE -- used this for a data scraping tool, https://css-tricks.com/can-copy-console/
  - how to get a browser to nav to a URL -- ended up not using it during the data scraping process, but fun to learn about, http://stackoverflow.com/a/1226718/2145103
  - Window.location, https://developer.mozilla.org/en-US/docs/Web/API/Window/location
  - css-propers scraping repo, https://github.com/johnotander/css-properties/blob/master/build.js
  - create global variable from external js file, http://stackoverflow.com/a/3244411/2145103
  - XHR boilerplate code, http://stackoverflow.com/a/14388512/2145103
  - XHR.open, https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
  - JSON.parse(), https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
  - String.slice(), https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice
  - String.split(), https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
  - each-async, https://github.com/sindresorhus/each-async
  - fs.writeFile, https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
  - how do i write files in node, https://docs.nodejitsu.com/articles/file-system/how-to-write-files-in-nodejs/
  - json lint, http://jsonlint.com/
  - JSON.stringify(), https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
  - using .offsetWidth & .offsetHeight to get element size, http://stackoverflow.com/a/294273/2145103

  # References for accessing stylesheets and indexed rules (yikes - sounds unscalable!) via javascript, all for getting the cell dimensions.
  - https://developer.mozilla.org/en-US/docs/Web/API/CSSRuleList
  - CSSRuleList, https://developer.mozilla.org/en-US/docs/Web/API/CSSRuleList
  - StyleSheet, https://developer.mozilla.org/en-US/docs/Web/API/Stylesheet
  - CSSStyleSheet, https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet
  - Using dynamic styling info, https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Using_dynamic_styling_information
  - CSSStyleDeclaration, https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration
  - HTMLElement.style, https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
  - HTMLElement.offsetWidth, https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth
  - HTMLElement.offsetHeight, https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
  - String, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
  - String.match(), https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
  - String.subtr(), https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substr
  - String.replace(), https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
  - RegExp, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp

  # References for getting the user input, event listeners, select rule on arrow up and down keys when navigating through select > option.
  - child selectors, https://developer.mozilla.org/en-US/docs/Web/CSS/Child_selectors
  - event target, https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
  - event reference, https://developer.mozilla.org/en-US/docs/Web/Events
  - select, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
  - select event reference, https://developer.mozilla.org/en-US/docs/Web/Events/select
  - HTMLSelectElement.selectedIndex, https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedIndex
  - SelectElement.add(), https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/add
  - option, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option
  - Element.setAttribute(), https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
  - Node.appendChild(), https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
  - my solution for clearing the world for a new rule rendering upon user input, using when(){}, http://javascript.info/task/removechildren
  - addEventListener(), https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  - click event, https://developer.mozilla.org/en-US/docs/Web/Events/click
  - change event, https://developer.mozilla.org/en-US/docs/Web/Events/change
  - this.value for selected option, http://stackoverflow.com/a/38087038/2145103
  - add eventlistener on nodelist, http://stackoverflow.com/questions/12362256/addeventlistener-on-nodelist#12362466
  - disable arrow keys for dropdown/selector element, http://stackoverflow.com/a/13992776/2145103
  - input type="color", https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input/color
*/


/*
next ideas:
- let randomRuleOnPageLoad =
- addEventListener to select element that when changed, passes the selection value as the ruleSet to initNature().
- figure out the Safari bug
- make #cellular-world have a dynamic width based on the viewport sizes at page load (so as to not dig into CSS stylesheets and whatnot)
*/
