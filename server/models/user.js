const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
      message: "You must enter a valid URL",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: "You must enter a valid email",
    },
  },
  password: {
    type: String,
    required: true,
    select: false, // Don't return password by default
  },
});

// 🔐 Add the custom static method to the schema
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select("+password") // must manually select password
    .then((user) => {
      if (!user) {
        throw new Error("Incorrect email or password");
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new Error("Incorrect email or password");
        }

        return user;
      });
    });
};

module.exports = mongoose.model("user", userSchema);
