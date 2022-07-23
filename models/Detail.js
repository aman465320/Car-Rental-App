const mongoose = require("mongoose");

const detailSchema = new mongoose.Schema({
  fullName: String,
  pickUpLocation: String,
  emailID: String,
  dropLocation: String,
  mobileNumber: String,
  pickupDate: Date,
  dropDate: Date,
  pinCode: String,
  carName: String,
});

module.exports = new mongoose.model("Detail", detailSchema);
