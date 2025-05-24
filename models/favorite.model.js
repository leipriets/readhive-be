import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.model.js";
import Article from "./article.model.js";
import _ from "lodash";

class Favorite extends Model {
  static async favoriteArticles(params) {
    
    let articleIds = [];
    const username = params.favorited;

    if (username && username.length > 0) {
      const favoritedArticle = await Favorite.findAll({
        attributes: ["article_id"],
        include: [
          {
            model: User,
            as: "users",
            where: { username },
          },
        ],
      });

      articleIds = _.map(favoritedArticle, (article) => article.article_id);
    }

    return articleIds;
  }
}

Favorite.init(
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
  },
  {
    sequelize,
    modelName: "Favorite",
    tableName: "favorites",
  }
);

export default Favorite;
