// models/blog.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js"; // Import model User

const Blog = sequelize.define("Blog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true, // Memastikan slug unik
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false, // Kolom title tidak boleh kosong
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false, // Kolom content tidak boleh kosong
  },
  userId: {
    type: DataTypes.INTEGER, // Tipe data untuk menyimpan ID pengguna
    allowNull: false, // Kolom userId tidak boleh kosong
    references: {
      model: "Users", // Menghubungkan ke tabel Users
      key: "id", // Kolom yang dirujuk dari tabel Users
    },
    onDelete: "CASCADE", // Jika user dihapus, blog terkait juga akan dihapus
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    onUpdate: sequelize.literal("CURRENT_TIMESTAMP"),
  },
});

// Definisi relasi antara Blog dan User
Blog.belongsTo(User, { foreignKey: "userId" });

export default Blog;
