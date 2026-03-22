// 1. import and configure modules/packages
const mysql = require("mysql2");
const express = require("express"); // web server code-- knows http-=--netw
const session = require("express-session");
const { getGenderCount } = require("./utilityFunctions");
const connection = require("./db");
const app = express();

// Set view engine
app.set("view engine", "ejs");
// 2. register middleware functions
app.use(
  session({
    secret: "encryptionKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 }, // 1 hour
  }),
);

app.use((req, res, next) => {
  if (req.session.user) {
    // a valid cookie with the user details was found in the request
    res.locals.isLoggedIn = true; // parsing data to all views
  } else {
    res.locals.isLoggedIn = false;
  }
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // to serve static files like css, js, images, etc from the public folder

// Import routers
const authRouter = require("./routes/auth");
const dashboardRouter = require("./routes/dashboard");
const reportsRouter = require("./routes/reports");

// Use routers
app.use("/", authRouter);
app.use("/", dashboardRouter);
app.use("/", reportsRouter);

// 3. register route/pages/endpoint handlers
app.get("/", (req, res) => {
  res.render("home/home.ejs");
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("errors/404.ejs");
});
// 4. start the app
app.listen(3000, () => console.log("server running on port 3000")); // starting the app
// hoisting in js
