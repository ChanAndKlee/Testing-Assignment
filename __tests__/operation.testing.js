const axios = require('axios');
const puppeteer = require("puppeteer");
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
const express = require("express"),
  app = express(),
  { router, dbConn } = require("../routes/studentServiceRoutes"),
  request = require("supertest");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("/", router);

afterAll(() => {
  dbConn.end();
  source.cancel('Operation canceled by the user.');
});

// Function to fetch students data from DB
const functions = {
  fetchPosts: () =>
  axios.get("http://localhost:3000/students", {
    cancelToken: source.token
  })
  .then((response) => response.data)
  .catch((error) => error),
};

/**
 * Test Case ID: Fun_01
 * Test Case Type: Unit Testing
 * Test Case Title: Check the firstname begin with the capital letter
*/
test("Test: Async/Await, the firstname should begin with the capital letter", async() => {
  const posts = await functions.fetchPosts();
  let regExp = /[A-Z]/;

  for(let i = 0; i < Object.keys(posts.data).length; i++) {
    data = posts.data[i].STU_FNAME;
    let isMatch = regExp.test(data.charAt(0));

    // Report where error
    if (isMatch == false) console.log("Error at index [" + posts.data[i].STU_ID + "]: " + data);
    expect(isMatch).not.toBeFalsy();
  }
});

test("Test: Delete student_id = 5", async () => {
  const res = await request(app).delete("/student").send({ student_id: 5 });
  expect(res.body).toEqual({
    error: false,
    data: 1,
    message: "Student has been deleted successfully.",
  });

  // Restore the data
  await request(app)
    .post("/student")
    .send({
      student: {
        STU_ID: 5,
        STU_FNAME: "Christopher",
        STU_LNAME: "Ellison",
        STU_AGE: 25,
      },
    });
});

/**
 * Test Case ID: Fun_02
 * Test Case Type: Unit Testing
 * Test Case Title: Check the age be lesser than 100
*/
test("Test: Async/Await, the age should be lesser than 100", async() => {
  const posts = await functions.fetchPosts();
  for(let i = 0; i < Object.keys(posts.data).length; i++) {
    expect(posts.data[i].STU_AGE).toBeLessThan(100);
  }
});

/**
 * Test Case ID: Fun_03
 * Test Case Type: Integration Testing
 * Test Case Title:
 */
describe("Test: Getting information of the first student in database with /students and /student/:id", () => {
  let firstStudent;
  test("Test: GET all students via /students", async () => {
    const res = await request(app).get("/students");
    expect(res.body.data[0]).toEqual({
      STU_ID: 1,
      STU_FNAME: "Andrew",
      STU_LNAME: "Black",
      STU_AGE: 25,
    });
    firstStudent = res.body.data[0];
  });
  test("Test: Get the information of the first student via /student/:id", async () => {
    const res = await request(app).get(`/student/${firstStudent.STU_ID}`);
    expect(res.body.data).toEqual(firstStudent);
  });
});

/**
 * Test Case ID: Fun_04
 * Test Case Type: Integration Testing
 * Test Case Title:
 */
describe("Test: Adding a student, update the new student, and get the new student", () => {
  const kiriko = {
    STU_ID: 100,
    STU_FNAME: "Kiriko",
    STU_LNAME: "Kamori",
    STU_AGE: 23,
  };
  test("Test: POST a new student via /students", async () => {
    const res = await request(app)
      .post("/student")
      .send({
        student: {
          STU_ID: 100,
          STU_FNAME: "Genji",
          STU_LNAME: "Shimada",
          STU_AGE: 25,
        },
      });
    expect(res.body).toEqual({
      data: 1,
      error: false,
      message: "New student has been created successfully.",
    });
  });
  test("Test: PUT student STU_FNAME and STU_LNAME via /students", async () => {
    const res = await request(app).put("/student").send({
      student: kiriko,
    });
    expect(res.body).toEqual({
      data: 1,
      error: false,
      message: "Student has been updated successfully.",
    });
  });
  test("Test: Get the information Kiriko via /student/:id", async () => {
    const res = await request(app).get(`/student/100`);
    expect(res.body.data).toEqual(kiriko);
    
    // Restore the database
    await request(app).delete(`/student`).send({ student_id: 100 });
  });
});

/**
 * Test Case ID: Fun_05
 * Test Case Type: System Testing
 * Test Case Title: Update student information on the  database
 * Test Case Description:
 * - Test the Student Information page by inputting the Student ID, Student Firstname, Student Lastname, Student Age
 * to update the student information on the database.
 */
test("Test: Getting the information of student through the user interface.", async () => {
  // Create browser using puppeteer
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 5,
    devtools: false,
  });
  // Create a new page
  const page = await browser.newPage();
  // Set the page to the web location
  await page.goto("http://localhost:3100/");

  // Click and type value "80" into the textbox STU_ID
  await page.click("input#STU_ID");
  await page.type("input#STU_ID", "80");
  // Click and type value "Joseph" into the textbox STU_FNAME
  await page.click("input#STU_FNAME");
  await page.type("input#STU_FNAME", "Joseph");
  // Click and type value "Joestar" into the textbox STU_LNAME
  await page.click("input#STU_LNAME");
  await page.type("input#STU_LNAME", "Joestar");
  // Click and type value "23" into the textbox STU_AGE
  await page.click("input#STU_AGE");
  await page.type("input#STU_AGE", "23");

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });
  // Click on "Update" button to update the student information
  await page.click("input#update");

  // Check all information in term of Object
  const studentObject = await page.evaluate(() => {
    return {
      id: document.getElementById("STU_ID").value,
      firstName: document.getElementById("STU_FNAME").value,
      lastName: document.getElementById("STU_LNAME").value,
      age: document.getElementById("STU_AGE").value,
    };
  });

  expect(studentObject).toEqual({
    id: "80",
    firstName: "Joseph",
    lastName: "Joestar",
    age: "23",
  });

  await browser.close();
}, 20000);