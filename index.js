const mysql = require("mysql2");
const express = require("express");
const app = express();

const connection = mysql.createConnection({
  host: "localhost",
  database: "tuwaze",
  user: "root",
  password: "password",
  port: 3307,
});
app.get("/dashboard", (req, res) => {
  connection.query("SELECT * FROM users;", (dbError, queryResult) => {
    if (dbError) {
      console.log("DB error occured: " + dbError.message);
    } else {
      console.log(getGenderCount(queryResult));
      res.render("dashboard.ejs", {allUsers: queryResult, maleFemaleCount: getGenderCount(queryResult)} )
    }
  });
});

app.listen(3000)
// hoisting in js
function getGenderCount(users) {
  return users.reduce(
    (count, user) => {
      if (user.gender === "Male") count.male += 1;
      if (user.gender === "Female") count.female += 1;
      return count;
    },
    { male: 0, female: 0 },
  );
}
