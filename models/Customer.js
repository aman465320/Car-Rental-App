const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  emailID: String,
  fullName: String,
  password: String,
  postBody: String,
});

module.exports = new mongoose.model("Customer", customerSchema);
