const { register, login } = require("../services/auth.service");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

// Register User
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newUser = await register(name, email, phone, password, role);

    return res
      .status(201)
      .json({ message: "User registered successfully", newUser });
  } catch (error) {
    next(error);
  }
};

// Login User
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const currUser = await login(email, password);

    const accessToken = generateAccessToken(currUser);
    const refreshToken = generateRefreshToken(currUser);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({
      success: true,
      accessToken,
      currUser,
    });
  } catch (error) {
    next(error);
  }
};

// Logout User
exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
