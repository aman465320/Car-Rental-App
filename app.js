// Requiring all the packages
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { application } = require("express");
const passport = require("passport");

const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const { check, validationResult } = require("express-validator");

const app = express();

const DB =
  "mongodb+srv://amanmathur:customerDB@cluster0.zudrg.mongodb.net/customerDB?retryWrites=true&w=majority";

mongoose
  .connect(DB, { useNewUrlParser: true })
  .then(() => {
    console.log("connection success");
  })
  .catch((err) => {
    console.log("no connection");
  });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const credentialSchema = new mongoose.Schema({
  username: String,
  password: String,
  fullName: String,
});

credentialSchema.plugin(passportLocalMongoose);

// Models
const Admin = require("./models/Admin");
const Car = require("./models/Car");
const Contact = require("./models/Contact");
const Customer = require("./models/Customer");
const Detail = require("./models/Detail");
const Credential = new mongoose.model("Credential", credentialSchema);

passport.use(Credential.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// Routes
app.get("/", (req, res) => {
  res.render("home", {
    isLoggedIn: req.isAuthenticated(),
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    isLoggedIn: req.isAuthenticated(),
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    isLoggedIn: req.isAuthenticated(),
  });
});

app.get("/publish", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("publish", {
      isLoggedIn: req.isAuthenticated(),
      publisherEmail: req.user.username,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/reviews", (req, res) => {
  Customer.find({}, (err, posts) => {
    res.render("reviews", {
      review: posts,
      isLoggedIn: req.isAuthenticated(),
    });
  });
});

app.get("/cars", (req, res) => {
  Car.find({}, (err, cars) => {
    if (err) {
      res.send(err);
      console.log(err);
    } else {
      res.render("cars", {
        fleet: cars,
        isLoggedIn: req.isAuthenticated(),
      });
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signUp", (req, res) => {
  res.render("signUp");
});

app.get("/rentals", (req, res) => {
  if (req.isAuthenticated()) {
    Detail.find({ emailID: req.user.username }, (err, rents) => {
      res.render("rentals", {
        myrentals: rents,
        isLoggedIn: req.isAuthenticated(),
      });
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/booking", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("booking", {
      isLoggedIn: req.isAuthenticated(),
      bookingUserEmailId: req.user.username,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/");
});

app.post("/publish", (req, res) => {
  const review = new Customer({
    fullName: req.body.fullName,
    postBody: req.body.postBody,
    emailID: req.body.emailID,
  });
  review.save((err) => {
    if (!err) {
      res.redirect("/reviews");
    }
  });
});

app.post("/contact", (req, res) => {
  const contactUs = new Contact({
    fullName: req.body.fullName,
    emailID: req.body.emailID,
    subject: req.body.subject,
    message: req.body.message,
  });
  contactUs.save((err) => {
    if (!err) {
      res.redirect("/contact");
    }
  });
});

// app.post("/login", (req, res) => {
//   const credential = new Credential({
//     emailID: req.body.username,
//     password: req.body.password,
//     fullName: req.body.fullName,
//   });
//   req.logIn(credential, (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       passport.authenticate("local")(req, res, () => {
//         res.redirect("/");
//       });
//     }
//   });
// });

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

app.post("/signUp", (req, res) => {
  Credential.register(
    { username: req.body.username, fullName: req.body.fullName },

    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.send(err);
        res.redirect("/signUp");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/");
        });
      }
    }
  );
});

app.post("/bookedCar", (req, res) => {
  const bookedcar = new Detail({
    fullName: req.body.fullName,
    pickUpLocation: req.body.pickUpLocation,
    emailID: req.user.username,
    dropLocation: req.body.dropLocation,
    mobileNumber: req.body.mobileNumber,
    pickupDate: req.body.pickupDate,
    dropDate: req.body.dropDate,
    pinCode: req.body.pinCode,
    carName: req.body.carName,
  });

  bookedcar.save((err) => {
    if (!err) {
      res.render("confirmedBooking", {
        fullName: req.body.fullName,
        pickUpLocation: req.body.pickUpLocation,
        emailID: req.user.username,
        dropLocation: req.body.dropLocation,
        mobileNumber: req.body.mobileNumber,
        pickupDate: req.body.pickupDate,
        dropDate: req.body.dropDate,
        pinCode: req.body.pinCode,
        carName: req.body.carName,
        bookingID: req.body._id,
        isLoggedIn: req.isAuthenticated(),
      });
    }
  });
});

app.post("/deleteRental", (req, res) => {
  const checkedID = req.body.cancellRental;
  Detail.findByIdAndRemove(checkedID, (err) => {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/rentals");
});

app.get("/admin", (req, res) => {
  res.redirect("/adminLogin");
});

app.get("/adminLogin", (req, res) => {
  res.render("adminLogin");
});

app.get("/adminLogout", (req, res) => {
  req.logOut((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/adminLogin");
  });
});

app.post("/adminLogin", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  Admin.findOne({ username: username }, (err, foundUser) => {
    if (err) {
      res.send(err);
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("admin");
        } else {
          res.redirect("/admin");
        }
      } else {
        res.redirect("/admin");
      }
    }
  });

  // Admin.register(
  //   { username: req.body.username },
  //   // { fullName: req.body.fullName },
  //   req.body.password,
  //   (err, user) => {
  //     if (err) {
  //       console.log(err);
  //       res.redirect("/adminLogin");
  //     } else {
  //       passport.authenticate("local")(req, res, () => {
  //         // res.send(user);
  //         res.redirect("/admin");
  //       });
  //     }
  //   }
  // );
});

app.post("/deleteCar", (req, res) => {
  const checkedID = req.body.deleteCar;
  Car.findByIdAndRemove(checkedID, (err) => {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/admin/adminCars");
});

app.get("/admin/adminDashboard", (req, res) => {
  res.render("adminDashboard");
});

app.get("/admin/adminCars", (req, res) => {
  Car.find({}, (err, cars) => {
    if (err) {
      res.send(err);
      console.log(err);
    } else {
      res.render("adminCars", { carItems: cars });
    }
  });
});

app.get("/admin/adminCustomers", (req, res) => {
  Credential.find({}, (err, credentials) => {
    if (err) {
      res.send(err);
      console.log(err);
    } else {
      res.render("adminCustomers", { customerItems: credentials });
    }
  });
});

app.get("/admin/adminRentals", (req, res) => {
  Detail.find({}, (err, details) => {
    if (err) {
      res.send(err);
      console.log(err);
    } else {
      res.render("adminRentals", { rentalItems: details });
    }
  });
});

app.get("/addCarForm", (req, res) => {
  res.render("addCarForm");
});

app.post("/addCarForm", (req, res) => {
  const car = new Car({
    imgURL: req.body.imgURL,
    carName: req.body.carName,
    price: req.body.price,
    baggage: req.body.baggage,
    seats: req.body.seats,
    fuel: req.body.fuel,
    type: req.body.type,
    transmission: req.body.transmission,
  });
  car.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/admin/adminCars");
    }
  });
});

app.listen(process.env.PORT || 4500, () => {
  console.log("server started at port 4500");
});
