const router = require("express").Router();
const User = require("../model/User");
const { registerValidation, loginValidation } = require("../validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send("Email already exists");
  } catch (err) {
    return res.status(400).send("Could not lookup in db.");
  }

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  try {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
  } catch (err) {
    return res.status(400).send("Hashing went wrong.");
  }

  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (err) {
    res.status(400).send("Could not save user to db.");
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid password or email.");

    try {
      const validate = await bcrypt.compare(req.body.password, user.password);
      if (!validate) return res.status(400).send("Invalid password or email.");

      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
      res.header("auth-token", token).send(token);
    } catch (err) {
      return res.status(400).send("Validation went wrong.");
    }
  } catch (err) {
    return res.status(400).send("Database error.");
  }
});

module.exports = router;
