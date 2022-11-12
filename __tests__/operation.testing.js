const puppeteer = require("puppeteer");
/**
 * Test Case Title: Update student first name on the database
 * Test Case Type: System Testing
*/
test("Test: Getting the information of student through the user interface.", async () => {

  // Create browser using puppeteer
  const browser = await puppeteer.launch();
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
  // Click on "Update" button to search for the student
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
