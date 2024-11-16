import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Memuat variabel lingkungan dari .env

// Middleware untuk verifikasi token JWT
const authenticateToken = (req, res, next) => {
  // Ambil token dari header Authorization (dengan format Bearer <token>)
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  // Verifikasi token menggunakan secret key dari environment variable
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Menyimpan informasi pengguna (payload) ke dalam req.user
    req.user = user;

    // Lanjutkan ke route handler berikutnya
    next();
  });
};

export default authenticateToken;
