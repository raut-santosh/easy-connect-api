const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const checkAuth = require("../middleware/check-auth");

/* GET users listing. */
router.get("/", (req, res, next) => {
  User.find()
    .then((data) => {
      if (data.length >= 1) {
        return res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

// Signup
router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email }).then((user) => {
    if (user.length >= 1) {
      return res.status(422).json({
        message: "Email already exists",
      });
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err,
          });
        } else {
          const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            date_of_birth: req.body.date_of_birth,
            password: hash,
          });
          user
            .save()
            .then((result) => {
              console.log(result);
              res.status(201).json({
                message: "User is created",
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                error: err,
              });
            });
        }
      });
    }
  });
});

// login
router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user.length < 1) {
        res.status(404).json({
          message: "User doesn't exits",
        });
      } else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) {
            res.status(500).json({
              error: err,
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user.email,
                userId: user._id,
              },
              process.env.JWT_KEY,
              {
                expiresIn: "1h",
              }
            );
            res.status(200).json({
              message: "Login successfully",
              token: token,
            });
          } else {
            res.status(401).json({
              message: "Wrong password",
            });
          }
        });
      }
    })
    .catch(() => {
      res.status(500).json({
        error: "User not exists",
      });
    });
});

// Update user
router.patch("/:id", checkAuth, (req, res, next) => {
  const id = req.params.id;
  const updateOps = {};
  // require array to be passed by body
  // [{
  //   "propName": "price",
  //   "value": 200
  // }]
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  User.updateOne({ _id: id }, { $set: updateOps })
    .then((result) => {
      res.status(201).json({
        message: "User updated",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Delete user
router.delete("/:userId", (req, res) => {
  User.deleteOne({ _id: req.params.userId })
    .then((result) => {
      res.status(200).json({
        message: "User is deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
