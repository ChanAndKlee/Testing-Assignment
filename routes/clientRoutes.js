const express = require("express"),
  router = express.Router(),
  path = require("path");

// Add js to Node.js Server
router.get("/js/callStudentService.js", function (req, res) {
  res.sendFile(path.join(path.resolve("./"), "/js/callStudentService.js"));
});

router.get("/", function (req, res) {
  res.sendFile(path.join(path.resolve("./"), "/views/studentForm.html"));
});

module.exports = router;
