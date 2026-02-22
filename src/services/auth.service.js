const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("../models/user.model");
const { getUserByPhoneNumber } = require("../models/user.model");
const { checkUserExists } = require("../models/user.model");
const { createUser } = require("../models/user.model");

// Register User
exports.register = async (name, email, phone, password, role) => {
  try {
    const existingUser = await checkUserExists(email, phone);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser(name, email, phone, hashedPassword, role);

    return newUser;
  } catch (error) {
    console.log(error);
  }
};

// Login User
exports.login = async (email, password) => {
  try {
    const userByEmail = await getUserByEmail(email);
    if (!userByEmail) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, userByEmail.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    return userByEmail;
  } catch (error) {
    console.log(error);
  }
};
