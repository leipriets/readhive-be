import { Sequelize } from "sequelize";

const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;

const sequelize = new Sequelize(
    dbName,
    dbUsername,
    dbPassword,
  {
    host: dbHost,
    dialect: "mysql",
    logging: false,
  }
);

export default sequelize;
