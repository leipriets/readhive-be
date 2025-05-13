import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.model.js";

class Article extends Model {

    static async findArticleBySlug(slug) {
        const article = this;

        return await article.findOne({
            where: { slug: slug}
        });
    }

    static async findArticleById(id) {
        const article = this;

        return await article.findOne({
            where: { id: id}
        });
    }

}

Article.init(
  {
    id: {
      type: DataTypes.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    favorites_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    author: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "user",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Article",
    tableName: "articles",
  }
);

export default Article;
