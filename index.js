// 1. import and configure modules/packages
const mysql = require("mysql2");
const express = require("express");
const session = require("express-session");
const { getGenderCount } = require("./utilityFunctions");
const app = express();
const connection = mysql.createConnection({
  host: "localhost",
  database: "tuwaze",
  user: "root",
  password: "password",
  port: 3307,
});
// 2. register middleware functions
app.use(
  session({
    secret: "encryptionKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 }, // 1 hour
  }),
);
let isLoggedIn;
let loggedInUser;
const privateRoutes = ["/dashboard", "/profile"];

app.use((req, res, next) => {
  console.log("Middleware function executed!!");
  if (req.session.user) {
    // a valid cookie with the user details was found in the request
    isLoggedIn = true;
    loggedInUser = req.session.user;
  } else {
    isLoggedIn = false;
  }
  if (isLoggedIn || !privateRoutes.includes(req.path)) {
    next();
  } else {
    res.status(401).render("401.ejs");
  }
});
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // to serve static files like css, js, images, etc from the public folder

// 3. register route/pages/endpoint handlers
app.get("/", (req, res) => {
  res.render("home.ejs");
});
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});
// bcrypt - hash/encrypt passwords
app.post("/signup", (req, res) => {
  const insertStatement = `INSERT INTO users(full_name, phone_number, email, gender, password_hash, role, ward, is_anonymous_allowed) VALUES('${req.body.fullname}', '${req.body.phone}', '${req.body.email}', '${req.body.gender}', '${req.body.password}', 'citizen', '${req.body.location}', TRUE);`;

  connection.query(insertStatement, (insertError) => {
    if (insertError) {
      res.status(500).send("Server Error!!" + insertError.message);
    } else {
      res.redirect("/login");
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.post("/auth", (req, res) => {
  console.log(req.body); // req.body.pass -- password in db
  connection.query(
    `SELECT * FROM users WHERE email = '${req.body.email}';`,
    (dbError, queryResult) => {
      if (dbError) {
        console.log("DB error occured: " + dbError.message);
        res.status(500).send("Server Error!!");
      } else {
        console.log(queryResult); // [{},{},...]
        if (queryResult.length > 0) {
          if (req.body.password === queryResult[0].password_hash) {
            // password and email matched
            req.session.user = queryResult[0]; // {id: 1, full_name: '...', ...} // adding user details to the session manager/keys
            res.redirect("/dashboard");
          } else {
            // password did not match
            res.send("Invalid email or password!!");
          }
        } else {
          // email was not  found in the db
          res.send("Invalid email or password!!");
        }
      }
    },
  );
});

app.get("/dashboard", (req, res) => {
  connection.query("SELECT * FROM users;", (dbError, queryResult) => {
    if (dbError) {
      console.log("DB error occured: " + dbError.message);
    } else {
      console.log(getGenderCount(queryResult));
      res.render("dashboard.ejs", {
        allUsers: queryResult,
        maleFemaleCount: getGenderCount(queryResult),
      });
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("404.ejs");
});
// 4. start the app
app.listen(3000, () => console.log("server running")); // starting the app
// hoisting in js
