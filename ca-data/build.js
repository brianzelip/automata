'use strict'

var fs = require('fs')
var cheerio = require('cheerio')
var got = require('got')
var eachAsync = require('each-async')
var trailingLine = require('single-trailing-newline')

let rules = ["10", "11", "12", "13", "14", "15"];

function scrape(ruleNumber) {
  var REF = 'http://atlas.wolfram.com/01/01/' + ruleNumber + '/01_01_106_' + ruleNumber + '.html';
  function build (refUrl, callback) {
    var props = []
    if (!callback) {
      callback = refUrl
      refUrl = REF
    }

    got.get(refUrl, function (err, body) {
      if (err) {
        callback(err)
        return
      }

      var $ = cheerio.load(body)
      var solution = $('body').text().slice(11,33);
      console.log('solution' + ruleNumber, solution);
      var solutionArr = solution.split(', ');
      console.log('solutionArr' + ruleNumber, solutionArr);

      eachAsync(solutionArr, function (item, index, done) {
        props.push(item)
        fs.writeFile('rule' + ruleNumber + 'solution.json', trailingLine(JSON.stringify(props)))
        done()
      }, function () {

      })
    })
  }
  build();
}

for (let i = 0; i<rules.length; i++) {
    scrape(rules[i]);
}
