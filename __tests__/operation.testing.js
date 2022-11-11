const puppeteer = require("puppeteer");

/**
 * Test Case ID: 
 * Test Case Title: Select STU_ID#12 from the database
 * Test Case Type: System Testing
*/
test("Test: Getting the information of student through the user interface.", async () => {

  // Create browser using puppeteer
  const browser = await puppeteer.launch();
  // Create a new page
  const page = await browser.newPage();
  // Set the page to the web location
  await page.goto("http://localhost:3100/");

  // Click and type value "2" into the textbox STU_ID""
  await page.click("input#STU_ID");
  await page.type("input#STU_ID", "12");
  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });
  // Click on "Select" button to search for the student
  await page.click("input#select");

  // Check all information in term of Object
  const studentObject = await page.evaluate(() => {
    return {
      firstName: document.getElementById("STU_FNAME").value,
      lastName: document.getElementById("STU_LNAME").value,
      age: document.getElementById("STU_AGE").value,
    };
  });
  
  console.log("studentObject:", studentObject);

  expect(studentObject).toEqual({
  firstName: "Kulawut",
    lastName: "Makkamoltham",
    age: "3",
  });

  await browser.close();
}, 20000);
