import {
  Article,
  User,
  Favorite,
  Tag,
  ArticleTag,
  ArticleMedia,
  Comment,
  LikeComments,
} from "../models/index.js";
import { notifyUser } from "../socket/index.js";

import slug from "slug";
import _ from "lodash";
import { nanoid } from "nanoid";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { pushNotif } from "./notification.controller.js";

export const getFeed = async (req, res) => {
  try {
    const { offset, limit, author } = req.query;
    const { id } = req.user;

    let paramsArticle = {
      offset,
      limit,
      author,
      userId: id,
    };

    const isFeed = true;
    const result = await Article.fetchArticles(paramsArticle, isFeed);
    const articles = await Article.transformResponse(result, id);

    res.status(200).send({
      articles: articles,
      articlesCount: result.count,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const getArticles = async (req, res) => {
  try {
    const { offset, limit, author, tag, favorited, userId } = req.query;
    let articles, result;

    let paramsArticle = {
      offset,
      limit,
      author,
      favorited,
      tag,
    };

    if (favorited && favorited.length > 0) {
      const fetchFavoritedArticleIds = await Favorite.favoriteArticles(
        paramsArticle
      );

      paramsArticle.articleIds = fetchFavoritedArticleIds;
      result = await Article.fetchArticles(paramsArticle);
      articles = await Article.transformResponse(result, userId);
    } else {
      result = await Article.fetchArticles(paramsArticle);
      articles = await Article.transformResponse(result, userId);
    }

    res.status(200).send({
      articles: articles,
      articlesCount: result.count,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const createArticle = async (req, res) => {
  const { title, body, description, tagList } = req.body.article;
  const authorId = req.user.id;
  let articleId;
  let generateSlug = slug(title, { lower: true });

  console.log("create article files", req.files);

  try {
    const article = await Article.create({
      author: authorId,
      slug: generateSlug,
      title,
      body,
      description,
    });

    // article media uploads
    if (req.files && req.files.length > 0) {
      await ArticleMedia.create({
        article_id: article.id,
        files: req.files,
      });
    }

    tagList.forEach(async (tag) => {
      let tags = [];

      let tagId;
      const isTagExist = await Tag.findOne({
        where: {
          name: tag,
        },
      });

      if (isTagExist) {
        tagId = isTagExist.id;
      } else {
        const insertTags = await Tag.create({
          name: tag,
        });

        tagId = insertTags.id;
      }

      const saveNewArticleTag = await ArticleTag.create(
        {
          article_id: article.id,
          tag_id: tagId,
        },
        {
          include: [{ model: Tag, as: "tags" }],
        }
      );

      return saveNewArticleTag;
    });

    res.status(201).send({
      article: article.toJSON(),
      tagList,
    });
  } catch (err) {
    console.log(err);
    const code = err?.original?.code || undefined;

    if (code !== undefined && code == "ER_DUP_ENTRY") {
      const shortId = nanoid(6);
      const newSlug = generateSlug + shortId;

      const article = await Article.create({
        author: authorId,
        slug: newSlug,
        title,
        body,
        description,
      });

      articleId = article.id;

      const tags = await saveTag(tagList, articleId);
      res.status(201).send({
        article: article.toJSON(),
        tagList: tags,
      });
    }
  }
};

export const updateArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const oldSlug = req.params.slug;
    const { title, body, description, tagList } = req.body.article;
    const images = req.body.images;
    let existingTagList = [];
    let updatedImages = [];

    const generateSlug = slug(title, { lower: true });

    const fetchArticle = await Article.findArticleBySlug(oldSlug);

    if (userId !== fetchArticle.author) {
      res
        .status(422)
        .send({ error: "Unprocessable Entity", message: "Not owned by user." });
    } else {
      fetchArticle.update({ slug: generateSlug, title, body, description });

      let rawArticle = [];
      let responseTagList = [];

      if (tagList && tagList.length === 0) {
        await ArticleTag.findOne({
          where: {
            article_id: fetchArticle.id,
          },
        }).destroy();
      }

      if (tagList && tagList.length > 0) {
        const findTagIds = await Tag.findAll({
          where: {
            name: {
              [Op.in]: tagList,
            },
          },
        });

        let compiledTagList = [];

        findTagIds.forEach((tag) => {
          existingTagList.push(tag.name);
          compiledTagList.push(tag.id);
        });

        const getNewTagList = _.difference(tagList, existingTagList);

        // save new tag list
        await Promise.all(
          getNewTagList.map(async (tag) => {
            const insertTags = await Tag.create({
              name: tag,
            });

            compiledTagList.push(insertTags.dataValues.id);
          })
        );

        // delete previous list of article tags
        await ArticleTag.destroy({
          where: {
            article_id: fetchArticle.id,
          },
        });

        // save new compiled article tags
        await Promise.all(
          compiledTagList.map(async (tag) => {
            await ArticleTag.create({
              article_id: fetchArticle.id,
              tag_id: tag,
            });
          })
        );

        rawArticle = fetchArticle.get({ plain: true });
        responseTagList = {
          tagList,
        };
      }

      /** File Uploads */

      const fetchFiles = await ArticleMedia.findOne({
        where: {
          article_id: fetchArticle.id,
        },
      });

      if (Array.isArray(images)) {
        let existingFilesFE = [];
        images.forEach((image) => {
          let currentFile = JSON.parse(image);
          existingFilesFE.push(currentFile.name);
        });

        const getCurrentFiles = _.filter(fetchFiles.files, (file) =>
          _.includes(existingFilesFE, file.filename)
        );

        updatedImages = updatedImages.concat(getCurrentFiles);
      }

      if (req.files) {
        updatedImages = updatedImages.concat(req.files);
      }

      await fetchFiles.update({
        files: updatedImages,
      });

      /** End of File Uploads */
      // console.log(updatedImages);

      const article = {
        ...rawArticle,
        ...responseTagList,
      };

      res.status(200).send({ article });
    } // end of else block
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const getArticleBySlug = async (req, res) => {
  const userId = req?.user?.id;

  // console.log("userId", userId);

  try {
    const paramSlug = req.params.slug;

    const article = await Article.findOne({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username", "image"],
        },
        {
          model: ArticleMedia,
          as: "article_media",
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
      ],
      where: {
        slug: paramSlug,
      },
    });

    if (!article) {
      res.status(404).send({
        message: "article not found",
      });
    }

    const {
      id,
      slug,
      title,
      body,
      description,
      favorites_count,
      user,
      articletags,
      article_media,
      comments,
      createdAt,
      updatedAt,
    } = article;

    const tagList = _.compact(_.map(articletags, "tags.name"));

    const response = {
      id,
      title,
      slug,
      body,
      description,
      favoritesCount: favorites_count,
      author: user,
      tagList,
      article_media,
      comments,
      createdAt,
      updatedAt,
    };

    res.send({ article: response });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      message: "Bad request",
      error: err,
    });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const oldSlug = req.params.slug;

    const fetchArticle = await Article.findArticleBySlug(oldSlug);

    if (userId !== fetchArticle.author) {
      res
        .status(422)
        .send({ error: "Unprocessable Entity", message: "Not owned by user." });
    } else {
      fetchArticle.destroy();
      res.send({ message: "Article deleted successfully." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const addToFavorites = async (req, res) => {
  const articleSlug = req.params.slug;
  const stateUserId = req.user.id;
  const stateUsername = req.user.username;

  let favoritesCount;
  let updatedFavoritesCount;

  try {
    const fetchArticle = await Article.findOne({
      where: { slug: articleSlug },
    });

    if (fetchArticle) {
      const articleId = fetchArticle.id;
      favoritesCount =
        fetchArticle.favorites_count === null ||
        fetchArticle.favorites_count < 0
          ? 0
          : fetchArticle.favorites_count;
      updatedFavoritesCount = favoritesCount + 1;

      const article = await fetchArticle.update({
        favorites_count: updatedFavoritesCount,
      });

      await Favorite.create({
        user_id: stateUserId,
        article_id: articleId,
      });

      const notifData = {
        senderId: stateUserId,
        receiverId: fetchArticle.author,
        articleId: fetchArticle.id,
        senderUname: stateUsername,
        type: "favorited",
        channel: "push",
        title: `Article: ${fetchArticle.title}`,
        content: fetchArticle.body,
        data: fetchArticle,
      };

      // console.log(notifData);

      pushNotif(notifData);

      res.send({ article });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const removeToFavorites = async (req, res) => {
  try {
    const articleSlug = req.params.slug;
    const stateUerId = req.user.id;

    const fetchArticle = await Article.findOne({
      where: { slug: articleSlug },
    });

    if (fetchArticle) {
      const articleId = fetchArticle.id;
      await fetchArticle.decrement("favorites_count", { by: 1 });

      const findFavorite = await Favorite.findOne({
        user_id: stateUerId,
        article_id: articleId,
      });

      if (findFavorite) {
        findFavorite.destroy();
      }
      res.send({ message: "Sucessfully removed from favorites." });
    } else {
      res.status(400).send({ error: "Article not found." });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

const saveTag = async (tagList, articleId) => {
  let tags = [];
  if (tagList && tagList.length > 0) {
    for (let t = 0; t < tagList.length; t++) {
      const tag = tagList[t];
      tags.push(tag);

      const saveTag = await Tag.verifySaveTag(tag);
      const tagId = saveTag.id;

      await ArticleTag.create({
        article_id: articleId,
        tag_id: tagId,
      });
    }
  }

  return tags;
};
