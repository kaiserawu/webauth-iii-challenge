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

const port = 4040;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
})