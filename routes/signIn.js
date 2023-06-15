const express = require("express");

const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", userController.signInGET);
router.post("/", userController.signInPOST);

module.exports = router;
