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
 * Test Case ID: Fun_01
 * Test Case Type: Unit Testing
 * Test Case Title: Check the inserted age
 * Test Case Description:
 * - Check the age is greater than or equal to 18
 * - Check the age is truthiness (null, undefined, defined truthy, falsy)
 */
test("Test: Checking the inserted age", () => {
  const age = 23;
  expect(age).toBeGreaterThanOrEqual(18);
  expect(age).not.toBeNull();
  expect(age).toBeDefined();
  expect(age).toBeTruthy();
  expect(age).not.toBeFalsy();
});

/**
 * Test Case ID: Fun_02
 * Test Case Type: Unit Testing
 * Test Case Title: Check no duplicated name and Firstname starts with "Y" letter
 * Test Case Description: -
 */
describe('Test: No duplicated name and Firstname starts with "Y" letter', () => {
  const existing_firstname = [
    "Albedo",
    "Aloy",
    "Amber",
    "AratakiItto",
    "Barabara",
    "Beidou",
    "Bennett",
    "Candace",
    "Chongyun",
    "Collei",
    "Cyno",
    "Diluc",
    "Diona",
    "Dori",
    "Eula",
    "Fischl",
    "Ganyu",
    "Gorou",
    "HuTao",
    "Jean",
    "Kazuha",
    "Kaeya",
    "Ayaka",
    "Ayato",
    "Keqing",
    "Klee",
    "Kujou",
    "Kuki",
    "Lisa",
    "Nahida",
  ];

  const new_firstname = ["Yae", "Yelan", "YunJin"];

  // Check new firstname with the existing
  // Check new firstname begins with "Y" letter
  it('"Does not Match with the existing firstname" and "Firstname begins with "Y" "', () => {
    expect(new_firstname).not.toEqual(
      expect.arrayContaining(existing_firstname)
    );
    expect(new_firstname.toString()).toMatch(/^Y/);
  });
});

/**
 * Test Case ID: Fun_03
 * Test Case Type: Integration Testing
 * Test Case Title:
 * Test Case Description:
 */

// (TO DO) Code
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
 * Test Case Description:
 */

// (TO DO) Code
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

  // console.log("The retrieved studentObject:", studentObject);

  expect(studentObject).toEqual({
    id: "80",
    firstName: "Joseph",
    lastName: "Joestar",
    age: "23",
  });

  await browser.close();
}, 20000);