// 1. import and configure modules/packages
const mysql = require("mysql2");
const express = require("express"); // web server code-- knows http-=--netw
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
const privateRoutes = ["/dashboard", "/profile", "/report", "/reports"];

app.use((req, res, next) => {
  if (req.session.user) {
    // a valid cookie with the user details was found in the request
    isLoggedIn = true;
    loggedInUser = req.session.user;
    res.locals.isLoggedIn = isLoggedIn; // parsing data to all views
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
app.get("/logout", (req, res) => {
  req.session.destroy(); // retire your cookie
  res.redirect("/");
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
      res.status(500).send("Server Error!!");
    } else {
      connection.query(
        "SELECT * FROM anonymous_tips;",
        (dbError2, tipsQueryResult) => {
          if (dbError2) {
            res.send("Server Error!!" + dbError2.message);
          } else {
            res.render("dashboard.ejs", {
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

app.post("/tips", (req, res) => {
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

app.get("/report", (req, res) => {
  res.render("report.ejs");
});

app.post("/report", (req, res) => {
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
    is_anonymous === "true" ? null : loggedInUser ? loggedInUser.user_id : null;
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

app.get("/reports", (req, res) => {
  if (!isLoggedIn) {
    res.status(401).render("401.ejs");
    return;
  }
  const userId = loggedInUser.user_id;
  const query = `SELECT r.*, 
                 (SELECT COUNT(*) FROM report_media WHERE report_id = r.report_id) as media_count 
                 FROM reports r WHERE r.user_id = ${userId} ORDER BY r.created_at DESC`;
  connection.query(query, (dbError, queryResult) => {
    if (dbError) {
      console.log("DB error occured: " + dbError.message);
      res.status(500).send("Server Error!!");
    } else {
      res.render("reports.ejs", { reports: queryResult });
    }
  });
});

app.get("/reports/:id/edit", (req, res) => {
  if (!isLoggedIn) {
    res.status(401).render("401.ejs");
    return;
  }
  const reportId = req.params.id;
  const userId = loggedInUser.user_id;
  const query = `SELECT * FROM reports WHERE report_id = ${reportId} AND user_id = ${userId}`;
  connection.query(query, (dbError, queryResult) => {
    if (dbError) {
      console.log("DB error occured: " + dbError.message);
      res.status(500).send("Server Error!!");
    } else if (queryResult.length === 0) {
      res.status(404).render("404.ejs");
    } else {
      res.render("edit-report.ejs", { report: queryResult[0] });
    }
  });
});

app.post("/reports/:id/edit", (req, res) => {
  if (!isLoggedIn) {
    res.status(401).render("401.ejs");
    return;
  }
  const reportId = req.params.id;
  const userId = loggedInUser.user_id;
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

app.post("/reports/:id/media", (req, res) => {
  if (!isLoggedIn) {
    res.status(401).render("401.ejs");
    return;
  }
  const reportId = req.params.id;
  const userId = loggedInUser.user_id;
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

// 404 handler
app.use((req, res) => {
  res.status(404).render("404.ejs");
});
// 4. start the app
app.listen(3000, () => console.log("server running")); // starting the app
// hoisting in js
