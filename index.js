const express = require('express');
const knex = require('knex');
const knexConfig = require('./knexfile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secrets = require('./auth/secrets');

const db = knex(knexConfig.development);

const server = express();

server.use(express.json());

server.post('/api/register', async (req, res) => {
  try {
    const user = req.body;
    user.password = await bcrypt.hash(user.password, 14);
    const returnedIdArr = await db.insert(user).into('users');
    const dbEntry = await db.select().from('users').where({ id: returnedIdArr[0] }).first();
    console.log(dbEntry);

    res.status(201).json(dbEntry);
  } catch (err) {
    res.status(500).json({ error: err });
  }
})

server.post('/api/login', async (req, res) => {
  try {
    const user = req.body;
    console.log('user', user);
  
    const dbUserData = await db.select().from('users').where({ username: user.username }).first();
    console.log('dbUserData', dbUserData);

    if (dbUserData && await bcrypt.compare(user.password, dbUserData.password)) {
      const token = generateToken(dbUserData);
  
      res.json({ message: `Welcome, here's a token!`, token: token });
    } else {
      res.status(401).json({ message: 'You shall not pass!' });
    }
  } catch(err) {
    res.status(500).json({ error: err });
  }
})

server.get('/api/users', jwtAuth, async (req, res) => {
  try {
    const dbData = await db.select().from('users');
    console.log(req.userId);
    res.json({ users: dbData });
  } catch(err) {
    res.status(500).json({ error: err });
  }
})

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };

  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
}

function jwtAuth(req, res, next) {
  const token = req.headers.authorization;

  if (token) {
    console.log(token);
    jwt.verify(token, secrets.jwtSecret, (err, payload) => {
      if (err) {
        console.log(err);
        res.status(403).json({ message: 'You are not authorized.'})
      } else {
        console.log(payload);
        req.userId = payload.userId;
        next();
      }
    });
  } else {
    res.status(400).json({ message: 'No credentials provided.' });
  }
}

const port = 4040;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
})