const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

module.exports = new mongoose.model("Admin", adminSchema);
