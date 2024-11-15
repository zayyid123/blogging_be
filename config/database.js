import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME, // Nama database
  process.env.DB_USER, // Username database
  process.env.DB_PASSWORD, // Password database
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false, // Set ke false untuk menonaktifkan log query
  }
);

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to MySQL has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

testDbConnection();

export default sequelize;
