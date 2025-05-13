import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import Article from "./article.model.js";
import Tag from "./tag.model.js";

class ArticleTag extends Model {

}

ArticleTag.init(
  {
    id: {
      type: DataTypes.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    article_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "article",
        key: "id",
      },
    },
    tag_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "tag",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "ArticleTag",
    tableName: "articletags",
  }
);

export default ArticleTag;
