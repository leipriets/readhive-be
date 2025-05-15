import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.model.js";
import ArticleTag from "./articleTag.model.js";
import Favorite from "./favorite.model.js";
import Tag from "./tag.model.js";
import Follower from "./follower.model.js";
import _ from "lodash";
import { Op } from "sequelize";

class Article extends Model {
  static async findArticleBySlug(slug) {
    const article = this;

    return await article.findOne({
      where: { slug: slug },
    });
  }

  static async findArticleById(id) {
    const article = this;

    return await article.findOne({
      where: { id: id },
    });
  }

  static async fetchArticles(req, isFeed = false) {
    const page = +req.query.offset; // or parseInt(req.query.page)
    const pageSize = +req.query.limit; // or parseInt(req.query.pageSize)
    const author = req.query.author;
    // const offset = (page - 1) * pageSize;
    const offset = page;
    const limit = pageSize;
    const userId = req?.user?.id || null;

    let filters = {};
    let followerFilter = {};
    let ids = [];

    if (author) {
      filters.username = author;
    }

    if (isFeed) {

      ids.push(userId);

      const followedIds = await Follower.findAll({
        where: {
          user_id: userId,
        },
      });
      

      let getFollowedIds = _.map(
        followedIds,
        (followId) => followId.dataValues?.follow_id
      );

      if (getFollowedIds && getFollowedIds.length > 0) {

        ids.push(getFollowedIds);
      }

      console.log(ids);


      followerFilter = {
        author: {
          [Op.in]: ids,
        },
      };
      
    }

    const result = await Article.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]], // optional, for ordering
      attributes: [
        "id",
        "slug",
        "title",
        "body",
        "description",
        ["favorites_count", "favoritesCount"],
        "createdAt",
        "updatedAt",
      ],
      where: followerFilter,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "image", "bio"],
          where: filters,
        },
        {
          model: ArticleTag,
          as: "articletags",
          include: [
            {
              model: Tag,
              as: "tags",
            },
          ],
        },
        {
          model: Favorite,
          as: "favorites",
        },
      ],
    });

    return result;
  }

  static async transformResponse(articleOjb) {
    const transformedRows = articleOjb.rows.map((article) => {
      const articleJson = article.toJSON();
      articleJson.author = articleJson.user;
      delete articleJson.user;

      const tagNames = _.compact(_.map(articleJson?.articletags, (tag) =>
         _.get(tag, "tags.name")
      ));
      articleJson.tagList = tagNames;
      delete articleJson.articletags;

      articleJson.favorited = _.isEmpty(articleJson.favorites) ? false : true;

      return articleJson;
    });

    return transformedRows;
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
        model: "Users",
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
