// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './data/jwtAuth.sqlite3'
    },
    useNullAsDefault: true
  }

};
