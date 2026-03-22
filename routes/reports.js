const express = require("express");
const connection = require("../db");
const router = express.Router();

router.get("/report", (req, res) => {
  res.render("reports/report.ejs");
});

router.post("/report", (req, res) => {
  const {
    category,
    title,
    description,
    location_description,
    latitude,
    longitude,
    is_anonymous,
  } = req.body;
  const userId =
    is_anonymous === "true"
      ? null
      : req.session.user
        ? req.session.user.user_id
        : null;
  const insertReport = `INSERT INTO reports(user_id, category, title, description,location_description, latitude, longitude, is_anonymous)
                        VALUES(${userId || "NULL"}, '${category}', '${title}', '${description}','${location_description}', ${latitude}, ${longitude}, ${is_anonymous === "true"});`;
  connection.query(insertReport, (dbError) => {
    if (dbError) {
      console.log("DB error occured: " + dbError.message);
      res.status(500).send("Server Error!!");
    } else {
      res.redirect("/reports");
    }
  });
});

router.get("/reports", (req, res) => {
  if (!req.session.user) {
    res.status(401).render("errors/401.ejs");
    return;
  }
  const userId = req.session.user.user_id;
  const query = `SELECT r.*,
                 (SELECT COUNT(*) FROM report_media WHERE report_id = r.report_id) as media_count
                 FROM reports r WHERE r.user_id = ${userId} ORDER BY r.created_at DESC`;
  connection.query(query, (dbError, queryResult) => {
    if (dbError) {
      console.log("DB error occured: " + dbError.message);
      res.status(500).send("Server Error!!here" + dbError);
    } else {
      res.render("reports/reports.ejs", { reports: queryResult });
    }
  });
});

router.get("/reports/:id/edit", (req, res) => {
  if (!req.session.user) {
    res.status(401).render("errors/401.ejs");
    return;
  }
  const reportId = req.params.id;
  const userId = req.session.user.user_id;
  const query = `SELECT * FROM reports WHERE report_id = ${reportId} AND user_id = ${userId}`;
  connection.query(query, (dbError, queryResult) => {
    if (dbError) {
      console.log("DB error occured: " + dbError.message);
      res.status(500).send("Server Error!!");
    } else if (queryResult.length === 0) {
      res.status(404).render("errors/404.ejs");
    } else {
      res.render("reports/edit-report.ejs", { report: queryResult[0] });
    }
  });
});

router.post("/reports/:id/edit", (req, res) => {
  if (!req.session.user) {
    res.status(401).render("errors/401.ejs");
    return;
  }
  const reportId = req.params.id;
  const userId = req.session.user.user_id;
  const { category, title, description, location_description } = req.body;
  const updateQuery = `UPDATE reports SET category = '${category}', title = '${title}', description = '${description}', location_description = '${location_description}' WHERE report_id = ${reportId} AND user_id = ${userId}`;
  connection.query(updateQuery, (dbError) => {
    if (dbError) {
      console.log("DB error occured: " + dbError.message);
      res.status(500).send("Server Error!!");
    } else {
      res.redirect("/reports");
    }
  });
});

router.post("/reports/:id/media", (req, res) => {
  if (!req.session.user) {
    res.status(401).render("errors/401.ejs");
    return;
  }
  const reportId = req.params.id;
  const userId = req.session.user.user_id;
  // Check if report belongs to user
  const checkQuery = `SELECT * FROM reports WHERE report_id = ${reportId} AND user_id = ${userId}`;
  connection.query(checkQuery, (checkError, checkResult) => {
    if (checkError || checkResult.length === 0) {
      res.status(403).send("Unauthorized");
      return;
    }
    const { file_url, file_type } = req.body;
    const insertMedia = `INSERT INTO report_media(report_id, file_url, file_type) VALUES(${reportId}, '${file_url}', '${file_type}')`;
    connection.query(insertMedia, (dbError) => {
      if (dbError) {
        console.log("DB error occured: " + dbError.message);
        res.status(500).send("Server Error!!");
      } else {
        res.redirect("/reports");
      }
    });
  });
});

module.exports = router;
