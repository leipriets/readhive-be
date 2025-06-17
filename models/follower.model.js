import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.model.js";

class Follower extends Model {}

Follower.init(
  {
    id: {
      type: DataTypes.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "Users",
        key: "id",
      },
    },
    follow_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Follower",
    tableName: "followers",
  }
);


export default Follower;
