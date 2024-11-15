import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    }
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME }
  );
};

// Register User
export const register = async (req, res) => {
  const { email, password } = req.body;

  // check is email exist
  if (!email) return res.status(400).json({ message: "email are required" });

  // check is password exist
  if (!password)
    return res.status(400).json({ message: "password are required" });

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "email is already taken" });
    }

    const newUser = await User.create({ email, password });
    return res
      .status(201)
      .json({ message: "User created", userId: newUser.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Login User
export const login = async (req, res) => {
  const { email, password } = req.body;

  // check is email exist
  if (!email) return res.status(400).json({ message: "email are required" });

  // check is password exist
  if (!password)
    return res.status(400).json({ message: "password are required" });

  try {
    const user = await User.findOne({ where: { email } });

    // check is user exist
    if (!user)
      return res
        .status(400)
        .json({ message: "User not found check email or password" });

    // check is password valid
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Refresh Token
export const refresh = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
};
