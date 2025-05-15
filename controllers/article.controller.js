import { Article, User, Favorite, Tag, ArticleTag } from "../models/index.js";
import slug from "slug";
import _ from "lodash";
import { nanoid } from "nanoid";

export const getFeed = async (req, res) => {
  try {
    const isFeed = true;
    const result = await Article.fetchArticles(req, isFeed);
    const articles = await Article.transformResponse(result);

    res.status(200).send({
      articles: articles,
      articleCount: articles.count,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const getArticles = async (req, res) => {
  try {
    const result = await Article.fetchArticles(req);

    const articles = await Article.transformResponse(result);

    res.status(200).send({
      articles: articles,
      articleCount: articles.count,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const createArticle = async (req, res) => {
  const { title, body, description, tagList } = req.body.article;
  const authorId = req.user.id;
  let article;
  let articleId;
  let generateSlug = slug(title, { lower: true });

  try {
    article = await Article.create({
      author: authorId,
      slug: generateSlug,
      title,
      body,
      description,
    });
  } catch (err) {
    const code = err?.original?.code || undefined;

    if (code !== undefined && code == "ER_DUP_ENTRY") {
      const shortId = nanoid(6);
      const newSlug = generateSlug + shortId;

      article = await Article.create({
        author: authorId,
        slug: newSlug,
        title,
        body,
        description,
      });
    }
  }

  articleId = article.id;

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

  res.status(201).send({
    article: article.toJSON(),
    tagList: tags,
  });
};

export const updateArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const oldSlug = req.params.slug;
    const { title, body, description, tagList } = req.body.article;

    const generateSlug = slug(title, { lower: true });

    const fetchArticle = await Article.findArticleBySlug(oldSlug);
    console.log(fetchArticle);

    if (userId !== fetchArticle.author) {
      res
        .status(422)
        .send({ error: "Unprocessable Entity", message: "Not owned by user." });
    } else {
      fetchArticle.update({ slug: generateSlug, title, body, description });

      const articleTag = await ArticleTag;

      if (tagList && tagList.length === 0) {
        await articleTag
          .findOne({
            where: {
              article_id: fetchArticle.id,
            },
          })
          .destroy();
      }

      if (tagList && tagList.length > 0) {
        tagList.forEach(async (tag) => {
          let tagId;
          const isTagExist = await Tag.findOne({
            where: {
              name: tag,
            },
          });

          if (isTagExist) {
            tagId = isTagExist.id;
            console.log("is tag exist ->", isTagExist);
          } else {
            const insertTags = await Tag.create({
              name: tag,
            });

            tagId = insertTags.id;
            console.log("is tag not exist", tagId);
          }

          const fetchTags = await articleTag.findOne({
            include: [
              {
                model: Tag,
                as: "tags",
              },
            ],
            where: {
              article_id: fetchArticle.id,
              tag_id: tagId,
            },
          });

          if (!fetchTags) {
            await ArticleTag.create({
              article_id: fetchArticle.id,
              tag_id: tagId,
            });
          }
        });
      }
    }

    res.status(200).send(fetchArticle);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const getArticleBySlug = async (req, res) => {
  try {
    const paramSlug = req.params.slug;

    const article = await Article.findOne({
      include: [
        {
          model: User,
          as: "user",
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
  const stateUerId = req.user.id;
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
        user_id: stateUerId,
        article_id: articleId,
      });

      res.send({ article });
    }
  } catch (error) {
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
