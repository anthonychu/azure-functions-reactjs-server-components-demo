const config = {
  host: process.env.DB_HOST || 'localhost',
  database: 'notesapi',
  user: process.env.DB_USER || 'notesadmin',
  password: process.env.DB_PASSWORD || 'password',
  port: '5432',
};

if (process.env.DB_SSL) {
  config.ssl = {
    rejectUnauthorized: false,
  };
}

module.exports = config;