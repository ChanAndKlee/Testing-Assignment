const puppeteer = require("puppeteer");
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
});

/**
 * @Test
 * Test CaseID: Fun_01
 * Test Case Type: Unit Testing
 * Test Case Title: Check First Name begin with a capital letter
*/
test("Unit Test I: Check First Name begin with a capital letter", async() => {
  let regExp = /[A-Z]/;
  const res = await request(app).get("/students");

  for(let i = 0; i < Object.keys(res.body.data).length; i++) {
    data = res.body.data[i].STU_FNAME;
    let isMatch = regExp.test(data.charAt(0));

    // Report error location
    if (isMatch == false) console.log("Error at index [" + res.body.data[i].STU_ID + "]: " + data);
    expect(isMatch).not.toBeFalsy();
  }
});

/**
 * @Test
 * Test Case ID: Fun_02
 * Test Case Type: Unit Testing
 * Test Case Title: Delete student_id = 5
*/
test("Unit Test II: Delete student_id = 5", async () => {
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
 * @Test
 * Test Case ID: Fun_03
 * Test Case Type: Integration Testing
 * Test Case Title:
 */
describe("Integration Test II: Getting information of the first student in database with /students and /student/:id", () => {
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
 * @Test
 * Test Case ID: Fun_04
 * Test Case Type: Integration Testing
 * Test Case Title:
 */
describe("Integration Test III: Adding a student, update the new student, and get the new student", () => {
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
 * @Test
 * Test Case ID: Fun_05
 * Test Case Type: System Testing
 * Test Case Title: Update student information on the  database
 */
test("System Test I: Getting the information of student through the user interface.", async () => {
  // Create browser using puppeteer
  const browser = await puppeteer.launch();
  // Create a new page
  const page = await browser.newPage();
  // Set the page to the web location
  await page.goto("http://localhost:3100/");

  // Click and type value into the textbox
  await page.click("input#STU_ID");
  await page.type("input#STU_ID", "80");

  await page.click("input#STU_FNAME");
  await page.type("input#STU_FNAME", "Joseph");

  await page.click("input#STU_LNAME");
  await page.type("input#STU_LNAME", "Joestar");

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