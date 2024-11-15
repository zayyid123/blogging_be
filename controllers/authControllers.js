import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import RefreshToken from "../models/refreshTokenModel.js";
import dotenv from "dotenv";

dotenv.config();

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION_TIME + "h",
    }
  );
};

// Generate Refresh Token
const generateRefreshToken = async (user) => {
  // Menghasilkan refresh token dengan waktu kedaluwarsa
  const expirationTime = new Date();
  expirationTime.setDate(
    expirationTime.getDate() + process.env.JWT_REFRESH_EXPIRATION_TIME
  ); // Misalnya, 7 hari dari sekarang

  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME + "d" }
  );

  // Simpan refresh token ke database dengan waktu kedaluwarsa
  try {
    await RefreshToken.create({
      userId: user.id,
      refreshToken: refreshToken,
      expirationTime: expirationTime, // Menyimpan waktu kedaluwarsa
    });

    return refreshToken;
  } catch (error) {
    return error;
  }
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

    // Hapus refresh token dari database yang cocok dengan userId
    await RefreshToken.destroy({
      where: {
        userId: user.id,
      },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    return res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Refresh Token
export const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    // Cari refresh token di database
    const tokenRecord = await RefreshToken.findOne({ where: { refreshToken } });

    // Jika refresh token tidak ditemukan
    if (!tokenRecord) {
      return res.status(401).json({ message: "Invalid refresh token, please login again" });
    }

    // Periksa apakah refresh token sudah kedaluwarsa
    const currentTime = new Date();
    if (currentTime > tokenRecord.expirationTime) {
      // Jika token sudah kedaluwarsa, hapus token dari database
      await RefreshToken.destroy({ where: { refreshToken } });
      return res
        .status(401)
        .json({ message: "Refresh token has expired, please login again" });
    }

    // Verifikasi refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Cari user berdasarkan ID yang ada di dalam refresh token
    const user = await User.findOne({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Buat access token baru
    const newAccessToken = generateAccessToken(user);

    // hapus dulu refreshToken lama
    await RefreshToken.destroy({ where: { refreshToken } });

    // Kembalikan new access token ke client
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Error refreshing access token:", err);
    res.status(500).json({ message: "Failed to refresh access token" });
  }
};
