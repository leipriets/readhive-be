import { Article, User, Favorite, Tag, ArticleTag } from "../models/index.js";
import slug from "slug";
import _ from 'lodash';
import {nanoid} from 'nanoid';

export const getArticles = async (req, res) => {
  try {
    const page = +req.query.offset; // or parseInt(req.query.page)
    const pageSize = +req.query.limit; // or parseInt(req.query.pageSize)
    // const offset = (page - 1) * pageSize;
    const offset = page;
    const limit = pageSize;

    const result = await Article.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]], // optional, for ordering
      include: [
        { 
          model: User, as: "user",
        },
        {
          model: ArticleTag, as: "articletags",
          include: [{
            model: Tag, as: "tags"
          }]
        }
      ], 
    });

    const transformedRows = result.rows.map(article => {
      const articleJson = article.toJSON();
      articleJson.author = articleJson.user;
      delete articleJson.user;

      const tagNames = _.map(articleJson.articletags, tag => _.get(tag, 'tags.name'));
      articleJson.tagList = tagNames;
      delete articleJson.articletags;

      return articleJson;
    });

    // Prepare paginated response
    const totalPages = Math.ceil(result.count / pageSize);

    res.status(200).send({
      articles: transformedRows,
      articleCount: result.count,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const createArticle = async (req, res) => {
 
  const { title, body, description, tagList } = req.body.article;
  let article;
  let articleId;
  let generateSlug = slug(title, { lower: true });

  try {

    article = await Article.create({
      author: req.user.id,
      slug: generateSlug,
      title,
      body,
      description,
    });


  } catch (err) {
    console.log(err);

    const code = err?.original?.code || undefined;
    let error = err?.errors || undefined;

    if (code !== undefined && code == 'ER_DUP_ENTRY')  {
      
      const shortId = nanoid(6);

      const newSlug =  generateSlug + shortId;

      article = await Article.create({
        author: req.user.id,
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
        tag_id: tagId
      });
    }
  }

  res.status(201).send({
    article: article.toJSON(),
    tagList: tags
  });

};

export const updateArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const oldSlug = req.params.slug;
    const { title, body, description } = req.body;

    const generateSlug = slug(title, { lower: true });

    const fetchArticle = await Article.findArticleBySlug(oldSlug);

    if (userId !== fetchArticle.author) {
      res
        .status(422)
        .send({ error: "Unprocessable Entity", message: "Not owned by user." });
    }

    fetchArticle.update({ slug: generateSlug, title, body, description });

    res.status(201).send(fetchArticle);
  } catch (error) {
    console.log(error);

    res.status(400).send(error);
  }
};

export const getArticleBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const userId = req.user.id;

    const article = await Article.findOne({
      where: {
        slug: slug,
        author: userId,
      },
    });

    if (!article) {
      res.status(404).send({
        message: "article not found",
      });
    }

    res.send({ data: article });
  } catch (err) {
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

  try {
    const fetchArticle = await Article.findOne({
      where: { slug: articleSlug },
    });

    if (fetchArticle) {
      const articleId = fetchArticle.id;

      const article = await fetchArticle.increment("favorites_count", {
        by: 1,
      });

      await Favorite.create({
        user_id: stateUerId,
        article_id: articleId,
      });

      res.send(article);
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
        console.log(findFavorite);
      }
      res.send({ message: "Sucessfully removed from favorites." });
    } else {
      res.status(400).send({ error: "Article not found." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
