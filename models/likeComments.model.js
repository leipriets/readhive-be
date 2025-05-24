import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class LikeComments extends Model {}

LikeComments.init(
  {
    id: {
      type: DataTypes.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "users",
        key: "id",
      },
    },
    article_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "articles",
        key: "id",
      },
    },
    comment_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "comments",
        key: "id",
      },
    },
    isLiked: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isDisliked: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "like_comments",
    tableName: "like_comments",
  }
);

export default LikeComments;
