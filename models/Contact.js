const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  emailID: String,
  fullName: String,
  subject: String,
  message: String,
});

module.exports = new mongoose.model("Contact", contactSchema);
