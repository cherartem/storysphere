const express = require("express");

const sphereController = require("../controllers/sphereController");

const router = express.Router();

router.get("/createNew", sphereController.createSphereGET);
router.post("/createNew", sphereController.createSpherePOST);

router.get("/:sphereId", sphereController.sphereDetailsGET);

router.get("/:sphereId/createNew", sphereController.createStoryGET);
router.post("/:sphereId/createNew", sphereController.createStoryPOST);

router.get("/:sphereId/join", sphereController.sphereJoinGET);

router.get("/:sphereId/:storyId/delete", sphereController.deleteStoryGET);
router.post("/:sphereId/:storyId/delete", sphereController.deleteStoryPOST);

router.get("/", sphereController.listOfSpheresGET);

module.exports = router;
