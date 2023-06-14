const express = require("express");

const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", userController.signUpGET);
router.post("/", userController.signUpPOST);

module.exports = router;
