// --- Main file ---
const express = require('express');
const server = express();
const hbs = require('hbs');
const axios = require('axios');
const bodyParser = require('body-parser');
const filemgr = require('./filemgr');

server.use(bodyParser.urlencoded( {extended: true} ));

server.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

server.get('/', (req,res) => {
  res.render('main.hbs');
});

server.get('/main', (req,res) => {
  res.render('main.hbs');
});

server.get('/result', (req,res) => {
  res.render('result.hbs');
});

server.get('/historical', (req,res) => {
  filemgr.getAllData().then((result) => {
    console.log(result[0]);
    res.render('historical.hbs', result);
  }).catch((errorMessage) => {
    console.log(errorMessage);
  });
});

server.post('/form', (req, res) => {
  res.render('form.hbs');
});

server.post('/getweather', (req, res) => {
  const addr = req.body.address;

  const locationReq = `https://maps.googleapis.com/maps/api/geocode/json?address=${addr}&key=AIzaSyAn7h3tsW_p0md5iISNFzLcJDoRGRgjWPg`;

  axios.get(locationReq).then((response) => {
    console.log(response.data.results[0].formatted_address);
    const lat = response.data.results[0].geometry.location.lat;
    const lng = response.data.results[0].geometry.location.lng;
    const weatherReq = `https://api.darksky.net/forecast/a8657815b96e87afa1e337d1fb2329d8/${lat},${lng}`;
    return axios.get(weatherReq);
  }).then((response) => {

    console.log(response.data.currently.summary);
    const temp = (response.data.currently.temperature - 32) * 0.5556;
    const temperature = temp.toFixed(2);
    const tempStr = `${temperature} C`;

    const weatherresult = {
      address: addr,
      summary: response.data.currently.summary,
      temperature: tempStr,
    };

    filemgr.saveData(weatherresult).then((result) => {
      res.render('result.hbs', weatherresult);
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });


  })
  .catch((error) => {
    console.log(error.code);
  });
});

server.get('/form', (req, res) => {
  res.render('form.hbs');
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
