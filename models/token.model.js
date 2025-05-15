import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Token extends Model {}

Token.init(
  {
    id: {
      type: DataTypes.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "users",
        key: "id",
      },
    },
    token: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "token",
    tableName: "token",
  }
);

export default Token;
