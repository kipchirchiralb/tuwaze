const express = require("express");
const connection = require("../db");
const { getGenderCount } = require("../utilityFunctions");
const router = express.Router();

router.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    res.status(401).render("errors/401.ejs");
    return;
  }
  connection.query("SELECT * FROM users;", (dbError, queryResult) => {
    if (dbError) {
      res.status(500).send("Server Error!!");
    } else {
      connection.query(
        "SELECT * FROM anonymous_tips;",
        (dbError2, tipsQueryResult) => {
          if (dbError2) {
            res.send("Server Error!!" + dbError2.message);
          } else {
            res.render("dashboard/dashboard.ejs", {
              allUsers: queryResult,
              maleFemaleCount: getGenderCount(queryResult),
              allTips: tipsQueryResult,
            });
          }
        },
      );
    }
  });
});

router.post("/tips", (req, res) => {
  const insertNewTip = `INSERT INTO anonymous_tips(category,description)
                          VALUES('${req.body.category}','${req.body.description}');`;
  connection.query(insertNewTip, (dbError) => {
    if (dbError) {
      console.log("DB error occured: " + dbError.message);
      res.status(500).send("Server Error!!");
    } else {
      res.send("Tip submitted successfully!!");
    }
  });
});

module.exports = router;
