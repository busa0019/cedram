const express = require("express");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");

const router = express.Router();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/", limiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });
    if (!email?.trim()) return res.status(400).json({ message: "Email is required" });
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return res.status(400).json({ message: "Valid email is required" });
    if (!message?.trim()) return res.status(400).json({ message: "Message is required" });

    // Gmail SMTP (free, but with limits)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,      // e.g. ecrmi8787@gmail.com
        pass: process.env.GMAIL_APP_PASS,  // App Password (NOT your Gmail password)
      },
    });

    await transporter.sendMail({
      from: `NDRC Contact <${process.env.GMAIL_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,   // receiver
      replyTo: email.trim(),              // when you hit Reply, it replies to the sender
      subject: subject?.trim()
        ? `[Contact] ${subject.trim()}`
        : `[Contact] Message from ${name.trim()}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || "-"}\n\n${message}`,
    });

    res.json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact send error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;