const express = require("express");
const connection = require("../db");
const router = express.Router();

router.get("/signup", (req, res) => {
  res.render("auth/signup.ejs");
});

router.post("/signup", (req, res) => {
  const insertStatement = `INSERT INTO users(full_name, phone_number, email, gender, password_hash, role, ward, is_anonymous_allowed) VALUES('${req.body.fullname}', '${req.body.phone}', '${req.body.email}', '${req.body.gender}', '${req.body.password}', 'citizen', '${req.body.location}', TRUE);`;

  // Need to get connection from somewhere
  // For now, placeholder
  connection.query(insertStatement, (insertError) => {
    if (insertError) {
      res.status(500).send("Server Error!!" + insertError.message);
    } else {
      res.redirect("/login");
    }
  });
});

router.get("/login", (req, res) => {
  res.render("auth/login.ejs");
});

router.get("/logout", (req, res) => {
  req.session.destroy(); // retire your cookie
  res.redirect("/");
});

router.post("/auth", (req, res) => {
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

module.exports = router;
