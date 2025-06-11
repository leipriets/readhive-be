import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import ArticleTag from "./articleTag.model.js";

class ArticleMedia extends Model {}

ArticleMedia.init(
  {
    id: {
      type: DataTypes.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    article_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "articles",
        key: "id",
      },
    },
    files: {
        type: DataTypes.JSON
    }
  },
  {
    sequelize,
    modelName: "ArticleMedia",
    tableName: "article_media",
  }
);

export default ArticleMedia;
