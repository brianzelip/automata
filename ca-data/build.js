'use strict'

const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
const eachAsync = require('each-async');
const trailingLine = require('single-trailing-newline');

const numberOfRules = 256;
const ruleSets = {};
const ruleNeighborhoodMap = {
  0: "111",
  1: "110",
  2: "101",
  3: "100",
  4: "011",
  5: "010",
  6: "001",
  7: "000"
};//this is the order for the 8 options for every solution for elementary one-dimensional CA on the Wolfram site

function scrape(ruleNumber) {
  let REF = 'http://atlas.wolfram.com/01/01/' + ruleNumber + '/01_01_106_' + ruleNumber + '.html';
  function build (refUrl, callback) {
    let ruleSetsArr = []
    if (!callback) {
      callback = refUrl
      refUrl = REF
    }

    got.get(refUrl, function (err, body) {
      if (err) {
        return
      };

      let $ = cheerio.load(body);
      let solution = $('body').text().slice(11,33);
      // console.log('solution' + ruleNumber, solution);
      let solutionArr = solution.split(', ');
      // console.log('solutionArr' + ruleNumber, solutionArr);
      // console.log('solution' + ruleNumber, 'typeof(solution) = ' + typeof(solution), 'solutionArr' + ruleNumber, solutionArr, 'typeof(solution' + ruleNumber + ')', typeof(solutionArr));
      ruleSets[ruleNumber] = {};
      // console.log('ruleSets', ruleSets)

      eachAsync(solutionArr, function (item, index, done) {
        ruleSetsArr.push(item)
        ruleSets[ruleNumber][(ruleNeighborhoodMap[index])] = (item == '1' ? 'active' : 'inactive');
        // console.log('after the eachAsync, ruleSetsArr is now: ', ruleSetsArr, 'and solutionArr is', solutionArr)
        done()
      }, function () {
        // console.log('ruleSets is finally ', ruleSets)
        fs.writeFile('ruleSets.json', trailingLine(JSON.stringify(ruleSets, null, 2)));
      })
    })
  }
  build();
}

const compileRuleSets = function() {
  for (let i=0; i<numberOfRules; i++) {
    scrape(i);
  };
};

compileRuleSets();
