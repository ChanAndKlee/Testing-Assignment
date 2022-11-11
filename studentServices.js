const express = require("express"),
  app = express(),
  port = process.env.SERVICEPORT || 3000,
  router = require("./routes/studentServiceRoutes");

const dotenv = require("dotenv");
dotenv.config();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//add the router
app.use("/", router);

// set port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
