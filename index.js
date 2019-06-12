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

const port = 4040;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
})