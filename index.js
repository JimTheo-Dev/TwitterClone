// This is the dynamic server - Backend application
//I will have a backend and a dynamic server
//The backend is for the user
//The dynamic is for the array (json) with the data 


// If i want my server to automatically refresh then
// Use npm i --save-dev nodemon

const express = require('express');
const cors = require('cors');  //middleware
const monk = require('monk'); 
const Filter = require('bad-words');
const rateLimit = require("express-rate-limit");
const app = express();
const db = monk('localhost/meower'); //i can use mongoose but monk is easier to setup
const mews = db.get('mews');
const filter = new Filter();
app.enable("trust proxy");

app.use(cors());  //To allow the client to comminucate
app.use(express.json()); //json body parser 

app.get('/', (req, res) => {
  res.json({
    message: 'Hello Friends!'
  });
});

app.get('/mews', (req, res) => {
app.get('/mews', (req, res, next) => {
  mews
    .find()
    .then(mews => {
      res.json(mews);
    });
    }).catch(next);
});

function isValidMew(mew) {
  return mew.name && mew.name.toString().trim() !== '' && mew.name.toString().trim().length <= 50 &&
    mew.content && mew.content.toString().trim() !== '' && mew.content.toString().trim().length <= 140;
}
app.use(rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 1
}));

app.post('/mews', (req, res, next) => {
  if (isValidMew(req.body)) {
    const mew = {
      name: filter.clean(req.body.name.toString().trim()),
      content: filter.clean(req.body.content.toString().trim()),
      created: new Date()
    };
    mews
      .insert(mew)
      .then(createdMew => {
        res.json(createdMew);
      }).catch(next);
  } else {
    res.status(422);
    res.json({
      message: 'Hey! Name and Content are required! Name cannot be longer than 50 characters. Content cannot be longer than 140 characters.'
    });
  }
});
app.use((error, req, res, next) => {
  res.status(500);
  res.json({
    message: error.message
  });
});
app.listen(5000, () => {
  console.log('Listening on http://localhost:5000');
});