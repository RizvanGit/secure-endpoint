const helmet = require("helmet");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cookieSession = require("cookie-session")
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const { serializeUser } = require("passport");

const PORT = 3000;

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SERCRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_ONE: process.env.COOKIE_KEY_ONE,
  COOKIE_KEY_ROTATION: process.env.COOKIE_KEY_ROTATION,
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SERCRET,
};

function googleAuthVerifyCallback(
  accessToken,
  refreshToken,
  profile,
  doneCallback,
) {
  console.log("Google profile: ", profile);
  doneCallback(null, profile);
}

passport.use(new GoogleStrategy(AUTH_OPTIONS, googleAuthVerifyCallback));

//Save the session to the cookie
passport.serializeUser((user, done) => {
  console.log("Serialize session data: ", user)
  const emails = user.emails.map(email => email.value)
  const serializedData = {
    id: user.id,
    emails,
  }
  done(null, serializedData)
})

//Read the session from the cookie
passport.deserializeUser((obj, done) => {
  console.log("Deserialize function, cookies data: ", obj)
  done(null, obj)
})

const app = express();

app.use(helmet());
app.use(cookieSession({
  name: "session",
  maxAge: 24 * 60 * 60 * 1000,
  keys: [config.COOKIE_KEY_ROTATION, config.COOKIE_KEY_ONE],
}))
app.use(function(req, res, next) {
  if(req.session && !req.session.regenerate){
    req.session.regenerate = (cb) => {
      cb()
    }
  }

  if(req.session && !req.session.save) {
    req.session.save = (cb) => {
      cb()
    }
  }
  next()
})
app.use(passport.initialize());
app.use(passport.session());

function checkLoggedIn(req, res, next) {
  console.log("Current user is: ", req.user)
  //passport built-in method isAuthenticated()
  const isLoggedIn = req.isAuthenticated() && req.user;

  if (!isLoggedIn) {
    return res.status(401).json({
      error: "You must log in",
    });
  }
  next();
}

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email"],
  }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    session: true,
  }),
  function (req, res) {
    console.log("Google called us back!");
    res.redirect("/");
  },
);

app.get("/failure", (req, res) => {
  return res.send("<body><div><h1>Failed to log in</h1></div></body>");
});

//Passport exposes logout function on request object
app.get("/auth/logout", (req, res) => {
  //removes req.user and clears any logged in sessions
  req.logout(function(err) {
    if(err){
      return next(err)
    }
    return res.redirect('/')
  })
});

app.get("/secret", checkLoggedIn,(req, res) => {
  return res.sendFile(path.join(__dirname, "public", "secret.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

https.createServer({
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
}, app).listen(PORT, () => {
  console.log(`Security app started`);
  console.log(`Listening on port ${PORT}...`);
});
