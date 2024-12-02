const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const config = process.env;

const sessionMiddleware = () => {
  return session({
    secret: config.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/",  // MongoDB URL
      collectionName: "sessions",  // You can specify a custom collection for storing sessions
    }),
    cookie: {
      httpOnly: true,
      secure: true,  // Set to `true` if using HTTPS in production
      maxAge: 1000 * 60 * 60 * 24, // Session expiry time (1 day)
    },
  });
};

const verifySession = (req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log(req.session);
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized. No valid session." });
  }
  next(); // Proceed if the session is valid
};

const verifyAdmin = (req, res, next) => {
	if (!req.session.user || req.cookies.isAdmin !== 'true') {
    	return res.status(401).json({ message: "Forbidden. Must be an Admin." });
  	}

  	next(); // Proceed if the session is valid
}

module.exports = { sessionMiddleware, verifySession, verifyAdmin};
