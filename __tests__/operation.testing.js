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
 * Test Case Title: Getting information of second student in database with /students and /student/:id
 */
describe("Integration Test I: Getting information of second student in database with /students and /student/:id", () => {
  let secondStudent;
  test("Test: GET all students via /students", async () => {
    const res = await request(app).get("/students");
    expect(res.body.data[1]).toEqual({
      STU_ID: 2,
      STU_FNAME: "Alexandra",
      STU_LNAME: "Brown",
      STU_AGE: 25,
    });
    secondStudent = res.body.data[1];
  });
  test("Test: Get the information of the second student via /student/:id", async () => {
    const res = await request(app).get(`/student/${secondStudent.STU_ID}`);
    expect(res.body.data).toEqual(secondStudent);
  });
});

/**
 * @Test
 * Test Case ID: Fun_04
 * Test Case Type: Integration Testing
 * Test Case Title: Adding a student, update the new student, and get the new student
 */

// (TO DO) Code
describe("Integration Test II: Adding a student, update the new student, and get the new student", () => {
  const hanzo = {
    STU_ID: 100,
    STU_FNAME: "hanzo",
    STU_LNAME: "Shimada",
    STU_AGE: 38,
  };
  test("Test: POST a new student via /student", async () => {
    const res = await request(app)
      .post("/student")
      .send({
        student: {
          STU_ID: 100,
          STU_FNAME: "Genji",
          STU_LNAME: "Shimada",
          STU_AGE: 35,
        },
      });
    expect(res.body).toEqual({
      data: 1,
      error: false,
      message: "New student has been created successfully.",
    });
  });
  test("Test: PUT student STU_FNAME and STU_AGE via /student", async () => {
    const res = await request(app).put("/student").send({
      student: hanzo,
    });
    expect(res.body).toEqual({
      data: 1,
      error: false,
      message: "Student has been updated successfully.",
    });
  });
  test("Test: Get the Hanzo information via /student/:id", async () => {
    const res = await request(app).get(`/student/${hanzo.STU_ID}`);
    expect(res.body.data).toEqual(hanzo);
    
    // Restore the database (Delete the newly created student)
    await request(app).delete(`/student`).send({ student_id: hanzo.STU_ID });
  });
});

/**
 * @Test
 * Test Case ID: Fun_05
 * Test Case Type: System Testing
 * Test Case Title: Update student information on the  database through the user interface.
 */
test("System Test I: Update student information on the  database through the user interface.", async () => {
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