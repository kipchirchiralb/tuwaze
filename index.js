const mysql = require("mysql2");
const express = require("express");
const { getGenderCount } = require("./utilityFunctions");
const app = express();

const connection = mysql.createConnection({
  host: "localhost",
  database: "tuwaze",
  user: "root",
  password: "password",
  port: 3307,
});
app.get("/", (req, res) => {
  res.render("home.ejs");
});
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});
// bcrypt - hash/encrypt passwords
app.post("/signup", express.urlencoded({ extended: true }), (req, res) => {
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

app.listen(3000, () => console.log("server running")); // starting the app
// hoisting in js
