var express = require('express');
var fs = require('fs');
var router = express.Router();
var https = require('https');
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('index.html', {root: 'public'});
});

router.get('/managedecks/', function(req, res, next) {
  res.sendFile('html/manageDecks.html', {root: 'public'});
});

router.get('/deck/', function(req, res, next) {
  res.sendFile('html/deck.html', {root: 'public'});
});

router.get('/battlefield/', function(req, res, next) {
  res.sendFile('html/battlefield.html', {root: 'public'});
});

router.get('/getcard', function(req,res,next){
  var url = `https://api.scryfall.com/cards/search?q=${req.query.q}&include_extras=true`
  console.log(url)
  //var url = 'https://api.magicthegathering.io/v1/cards?name=' + req.query.q

  //var url = "https://api.magicthegathering.io/v1/sets/" + req.query.q + "/booster";
  request(url).pipe(res);
});

module.exports = router;
