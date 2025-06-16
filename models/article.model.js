import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.model.js";
import ArticleTag from "./articleTag.model.js";
import Favorite from "./favorite.model.js";
import Tag from "./tag.model.js";
import Follower from "./follower.model.js";
import _ from "lodash";
import { Op } from "sequelize";
import ArticleMedia from "./articleMedia.model.js";
import Comment from "./comment.model.js";

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

  static async fetchArticles(params, isFeed = false) {

    const page = +params.offset; // or parseInt(params.query.page)
    const pageSize = +params.limit; // or parseInt(params.query.pageSize)
    const author = params.author;
    // const offset = (page - 1) * pageSize;
    const offset = page;
    const limit = pageSize;
    const userId = params.userId || null;

    let authorFilter = {};
    let filter = {};
    let filterTag = {};
    let filterFavorites = {};
    let ids = [];

    if (author) {
      authorFilter.username = author;
    }

    if (isFeed) {
      // ids.push(userId);

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

      filter = {
        author: {
          [Op.in]: ids,
        },
      };
    }

    if (params.favorited) {
      filterFavorites.user_id = userId;
    }

    if (params.articleIds && params.articleIds.length > 0) {
      filter = {
        id: {
          [Op.in]: params.articleIds,
        },
      };
    }

    if (params.tag && params.tag.length > 0) {
      filterTag.name = params.tag;
    }

    console.log('filter favorites',filter);

    const result = await Article.findAndCountAll({

      distinct: true,
      attributes: [
        "id",
        "slug",
        "title",
        "body",
        "description",
        ["favorites_count", "favoritesCount"],
        [sequelize.literal(`(SELECT COUNT(*) FROM comments WHERE comments.article_id = Article.id)`), 'commentsCount'],
        "createdAt",
        "updatedAt",
      ],
      where: filter,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "image", "bio"],
          where: Object.keys(authorFilter).length ? authorFilter : undefined,
          required: Object.keys(authorFilter).length > 0
        },
        {
          model: ArticleTag,
          as: "articletags",
          include: [
            {
              model: Tag,
              as: "tags",
              where: Object.keys(filterTag).length ? filterTag : undefined,
              required: Object.keys(filterTag).length > 0
            },
          ],
        },
        {
          model: Favorite,
          as: "favorites",
        },
        {
          model: ArticleMedia,
          as: "article_media",
        },
        {
          model: Comment,
          as: "comments"
        }
      ],
    });

    return result;
  }

  static async transformResponse(articleObj, currentSessionId = null) {

    const transformedRows = articleObj.rows.map((article) => {
      console.log(currentSessionId);
      const articleJson = article.toJSON();
      articleJson.author = articleJson.user;
      delete articleJson.user;

      const tagNames = _.compact(
        _.map(articleJson?.articletags, (tag) => _.get(tag, "tags.name"))
      );
      articleJson.tagList = tagNames;
      delete articleJson.articletags;

      // articleJson.favorited = _.isEmpty(articleJson.favorites) ? false : true;
      const isFavoritedByUser = _.some(articleJson.favorites, { user_id: parseInt(currentSessionId) }); 

      articleJson.favorited = isFavoritedByUser;
      articleJson.articleCount = article.articleCount;
      articleJson.article_media = article.article_media;

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
