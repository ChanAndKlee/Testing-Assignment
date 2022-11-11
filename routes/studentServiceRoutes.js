const express = require("express"),
  mysql = require("mysql2"), // https://www.npmjs.com/package/mysql2
  cors = require("cors"),
  router = express.Router();

const dotenv = require("dotenv");
dotenv.config();

let whiteList = ["http://localhost:3100", "http://localhost:3200"];

let corsOptions = {
  origin: whiteList,
  methods: "GET,POST,PUT,DELETE",
};

router.use(cors(corsOptions));

// create the connection to database
const dbConn = mysql.createConnection({
  host: process.env.host,
  user: process.env.DB_user,
  password: process.env.DB_pass,
  database: process.env.DB_name,
});

// default route
router.get("/", function (req, res) {
  return res.send({ error: true, message: "hello" });
});

// Retrieve all students
router.get("/students", function (req, res) {
  dbConn.query("SELECT * FROM student", function (error, results) {
    if (error) throw error;
    return res.send({ error: false, data: results, message: "Student list." });
  });
});

// Retrieve student with id
router.get("/student/:id", function (req, res) {
  let student_id = req.params.id;

  if (!student_id) {
    return res
      .status(400)
      .send({ error: true, message: "Please provide student id." });
  }

  dbConn.query(
    "SELECT * FROM student where STU_ID=?",
    student_id,
    function (error, results) {
      if (error) throw error;
      return res.send({
        error: false,
        data: results[0],
        message: "Student retrieved",
      });
    }
  );
});

// Add a new student
router.post("/student", function (req, res) {
  let student = req.body.student;
  console.log(student);

  if (!student) {
    return res
      .status(400)
      .send({ error: true, message: "Please provide student information" });
  }

  dbConn.query(
    "INSERT INTO student SET ? ",
    student,
    function (error, results) {
      if (error) throw error;
      return res.send({
        error: false,
        data: results.affectedRows,
        message: "New student has been created successfully.",
      });
    }
  );
});

//  Update student with id
router.put("/student", function (req, res) {
  let student_id = req.body.student.STU_ID;
  let student = req.body.student;

  if (!student_id || !student) {
    return res.status(400).send({
      error: student,
      message: "Please provide student information",
    });
  }

  dbConn.query(
    "UPDATE student SET ? WHERE STU_ID = ?",
    [student, student_id],
    function (error, results) {
      if (error) throw error;
      return res.send({
        error: false,
        data: results.affectedRows,
        message: "Student has been updated successfully.",
      });
    }
  );
});

//  Delete student
router.delete("/student", function (req, res) {
  let student_id = req.body.student_id;
  console.log(student_id);

  if (!student_id) {
    return res
      .status(400)
      .send({ error: true, message: "Please provide student id" });
  }
  dbConn.query(
    "DELETE FROM student WHERE STU_ID = ?",
    [student_id],
    function (error, results) {
      if (error) throw error;
      return res.send({
        error: false,
        data: results.affectedRows,
        message: "Student has been deleted successfully.",
      });
    }
  );
});

module.exports = router;
