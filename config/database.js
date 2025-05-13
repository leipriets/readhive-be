import { Sequelize } from "sequelize";

const dbName = process.env.DB_NAME;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;

const sequelize = new Sequelize(
    dbName,
    dbUsername,
    dbPassword,
  {
    host: "localhost",
    dialect: "mysql",
  }
);

export default sequelize;
