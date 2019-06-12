const express = require('express');
const knex = require('knex');
const knexConfig = require('./knexfile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secrets = require('./auth/secrets');

const db = knex(knexConfig.development);

const server = express();

server.use(express.json());

const port = 4040;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
})