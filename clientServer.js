const express = require("express"),
  app = express(),
  port = process.env.CLIENTPORT || 3100,
  router = require("./routes/clientRoutes");

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
  console.log(`Client app listening on port ${port}`);
});
