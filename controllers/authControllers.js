import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import RefreshToken from "../models/refreshTokenModel.js";
import dotenv from "dotenv";
import errorHandler from "../utils/errorHandling.js";
import CustomError from "../utils/customError.js";

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
  try {
    const { email, password } = req.body;

    const newUser = await User.create({ email, password });
    return res
      .status(201)
      .json({ message: "User created", userId: newUser.id });
  } catch (error) {
    errorHandler(error, res);
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    // check is user exist
    if (!user)
      throw new CustomError(
        "User not found check email or password",
        400,
        "auth_error"
      );

    // check is password valid
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      throw new CustomError("Invalid password", 400, "auth_error");

    // Hapus refresh token dari database yang cocok dengan userId
    await RefreshToken.destroy({
      where: {
        userId: user.id,
      },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    return res.json({ accessToken, refreshToken });
  } catch (error) {
    errorHandler(error, res);
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
      throw new CustomError("Invalid refresh token, please login again", 401);
    }

    // Periksa apakah refresh token sudah kedaluwarsa
    const currentTime = new Date();
    if (currentTime > tokenRecord.expirationTime) {
      // Jika token sudah kedaluwarsa, hapus token dari database
      await RefreshToken.destroy({ where: { refreshToken } });
      throw new CustomError(
        "Refresh token has expired, please login again",
        401
      );
    }

    // Verifikasi refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Cari user berdasarkan ID yang ada di dalam refresh token
    const user = await User.findOne({ where: { id: decoded.userId } });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Buat access token baru
    const newAccessToken = generateAccessToken(user);

    // hapus dulu refreshToken lama
    await RefreshToken.destroy({ where: { refreshToken } });

    // Kembalikan new access token ke client
    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    errorHandler(error, res);
  }
};
