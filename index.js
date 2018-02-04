const exphbs  = require('express-handlebars');
const express = require('express');
const request = require('request');
const csv     = require('csv');

console.log(' --');
console.log(' - Welcome to the google sheets glossary generator');
console.log(' --');
console.log('');

if(!process.env.GOOGLE_SHEETS_URL) {
  console.log(' Error - Please define the environment variable GOOGLE_SHEETS_URL');
  process.exit();
}

let app = {
  sheet_url: process.env.GOOGLE_SHEETS_URL,
  data: null,
  err: null,

  init() {
    this.data = [];
    this.fetchData();

    var app = express();
    app.engine('handlebars', exphbs({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');
    app.get('/', this.routeCallbacks.home.bind(this));
    app.listen(8082);
  },

  fetchData() {
    console.log('Syncing data from google sheet...');

    request(this.sheet_url, (err, resp, body) => {
      csv.parse(body, (err, data) => {
        this.err = err;

        if(!err) {
          this.data = data.map((val) => { return { word: val[0], desc: val[1]}});
          console.log('Fetched data successfully!');
        } else {
          console.log(`Error fetching data! - ${err}`);
        }
      });
    });
  },

  routeCallbacks: {
    home(req, res) {
      res.render('home', {data: {terms: this.data}});
    }
  }
};

app.init();
