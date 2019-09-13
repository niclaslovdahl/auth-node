const router = require("express").Router();
const User = require("../model/User");
const { registerValidation } = require("../validation");
const bcrypt = require("bcryptjs");

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

module.exports = router;
