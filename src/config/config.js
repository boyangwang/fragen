var config = {};

config.env = 'development';
config.db = {};
config.db.host = 'localhost';
config.db.user = 'root';
config.db.password = 'root';
config.db.database = 'laughing_avenger';
config.AUTH_COOKIE_NAME = 'express.sid';
config.SECRET_KEY = 'secret';
console.log(process.env.NODE_ENV);
config.AUTH_CALLBACK_URL = process.env.NODE_ENV == 'dev' ?
    "http://lvh.me:4321/auth/google/callback" :
    "http://fragen.wangboyang.com/auth/google/callback";

// Port that express listens to
config.port = 4321;

module.exports = config;
