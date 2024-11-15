import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

// Encrypt password before saving user to database
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

// Compare password during login
User.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default User;
