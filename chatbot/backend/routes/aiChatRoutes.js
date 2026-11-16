const express = require("express");
const aiChatController = require("../controllers/aiChatController");

const router = express.Router();

router.post("/chat", aiChatController.handleChat);
router.get("/doctors", aiChatController.getDoctors);
router.post("/book-appointment", aiChatController.bookAppointmentWithPayment);

module.exports = router;
