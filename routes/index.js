var express = require('express');
var fs = require('fs');
var router = express.Router();
var https = require('https');
var request = require('request');
var mongoose = require('mongoose'); //Adds mongoose as a usable dependency

mongoose.connect('mongodb://localhost/deckDB', { useMongoClient: true }); //Connects to a mongo database called "commentDB"

var commentSchema = mongoose.Schema({ //Defines the Schema for this database
name: String,
imageUrl: String
});

var Deck = mongoose.model('Deck', commentSchema); //Makes an object from that schema as a model

var db = mongoose.connection; //Saves the connection as a variable to use
db.on('error', console.error.bind(console, 'connection error:')); //Checks for connection errors
db.once('open', function() { //Lets us know when we're connected
console.log('Connected');
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('mtg.html', {root: 'public'});
});

router.get('/getcard', function(req,res,next){
  var url = 'https://api.magicthegathering.io/v1/cards?name=' + req.query.q
  //var url = "https://api.magicthegathering.io/v1/sets/" + req.query.q + "/booster";
  request(url).pipe(res);
});

router.get('/getdeck', function(req, res, next) {
  Deck.find(function(err, deck){
    if(err){ return next(err); }
    res.json(deck);
  });
});

router.post('/addcard', function(req, res, next) {
  var deck = new Deck(req.body);
  deck.save(function(err, deck){
    if(err){ return next(err); }
    res.json(deck);
  });
});

router.param('card', function(req, res, next, id) {
  var query = Deck.findById(id);
  query.exec(function (err, card){
    if (err) { return next(err); }
    if (!card) { return next(new Error("can't find comment")); }
    req.card = card;
    return next();
  });
});


router.delete('/removecard/:card', function(req, res) {
  req.card.remove();
  res.sendStatus(200);
});
router.get('/removecard/:card', function(req, res) {
  req.card.remove();
  res.sendStatus(200);
});

module.exports = router;
