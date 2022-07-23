const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  imgURL: String,
  carName: String,
  price: String,
  baggage: String,
  seats: String,
  fuel: String,
  type: String,
  transmission: String,
});

module.exports = new mongoose.model("Car", carSchema);
