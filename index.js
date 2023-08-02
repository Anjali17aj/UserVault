const express = require("express");
const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method")); //sending patch request so url encoded data will come therefore we have to parse it
app.use(express.urlencoded({ extended: true })); //parsing urlencoded data
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "public"))); //css file

let getUser = () => {
  return [
    faker.datatype.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

const connection = mysql.createConnection({ //connecting node and db -> npm mysql2 website page 
  host: 'localhost',
  user: 'root',
  database: 'my_app',
  password: 'mysql@anjali17'
});

app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let data = result;
      res.render("users.ejs", { data });
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.patch("/user/:id", (req, res) => { //1. patch request
  let { id } = req.params; // with patch request comes id
  let { username, password } = req.body; // with patch request comes pass and newusrname
  console.log(username);
  let q = `SELECT * FROM user WHERE id='${id}'`;// sql query to find user's info from db

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) { //checking if forms passwrd is matching with db password
        res.send("WRONG Password entered!"); //if not matching then wrong passwrd
      } else {
        let q2 = `UPDATE user SET username='${username}' WHERE id='${id}'`; //if matched then update username
        connection.query(q2, (err, result) => {
          if (err) throw err; //if updating username throws err thn show err or else give result
          else {
            console.log(result);
            console.log("updated!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  //Query to Insert New User
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});


//server check
app.listen("8080", () => {
  console.log("server running on port 8080"); //localhost:8080/user
});