// models/refreshToken.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RefreshToken = sequelize.define("RefreshToken", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // Menyambungkan dengan model Users
      key: "id",
    },
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expirationTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

export default RefreshToken;
