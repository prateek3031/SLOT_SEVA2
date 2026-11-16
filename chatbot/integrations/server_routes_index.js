const express = require("express");

const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/clinics", require("./clinicRoutes"));
router.use("/doctors", require("./doctorRoutes"));
router.use("/appointments", require("./appointmentRoutes"));
router.use("/reviews", require("./reviewRoutes"));
router.use("/ai", require("./aiChatRoutes"));

module.exports = router;
