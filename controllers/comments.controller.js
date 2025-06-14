import sequelize from "../config/database.js";
import { Article, Comment, LikeComments, User } from "../models/index.js";
import { pushNotif } from "./notification.controller.js";

export const getComments = async (req, res) => {
  const { articleId } = req.query;
  let id = null;

  try {

    if (req.user) {
      id = req.user.id;
    }

    const fetchComments = await Comment.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
                SELECT COUNT(*)
                FROM like_comments
                WHERE user_id = "${id}" and
                article_id = "${articleId}" and
                isLiked = '1'
                and like_comments.comment_id = Comment.id
              )`),
            "isLiked",
          ],
          [
            sequelize.literal(`(
                SELECT COUNT(*)
                FROM like_comments
                WHERE user_id = "${id}" and
                article_id = "${articleId}" and
                isDisliked = '1'
                and like_comments.comment_id = Comment.id
              )`),
            "isDisliked",
          ],
        ],
      },
      include: [
        {
          attributes: ["id", "username", "image"],
          model: User,
          as: "user",
        },
      ],
      where: {
        article_id: articleId,
      },
      order: [["createdAt", "DESC"]],
    });

    res.send(fetchComments);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const postComment = async (req, res) => {
  try {
    const { body } = req.body.comment;
    const { id, username } = req.user;
    const { slug } = req.params;

    const stateUserId = id;
    const stateUsername = username;

    const fetchArticle = await Article.findArticleBySlug(slug);

    if (fetchArticle) {
      const articleId = fetchArticle.id;
      const userCommentId = id;

      const comment = await Comment.create({
        body,
        user_id: userCommentId,
        article_id: articleId,
      });

      const notifData = {
        senderId: stateUserId,
        receiverId: fetchArticle.author,
        articleId: fetchArticle.id,
        senderUname: stateUsername,
        type: "commented",
        channel: "push",
        title: `Article: ${fetchArticle.title}`,
        content: fetchArticle.body,
        data: fetchArticle,
      };

      pushNotif(notifData);

      res.send({
        ...comment.dataValues,
        slug,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const updateComment = async (req, res) => {
  try {
    const { commentId, body } = req.body.comment;
    const { id } = req.user;
    const { slug } = req.params;
    let updatedComment;

    const findCommentById = await Comment.findOne({
      where: {
        id: commentId,
      },
    });

    if (findCommentById) {
      updatedComment = await findCommentById.update({
        body,
      });
    }

    res.send({
      ...updatedComment.dataValues,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const deleteComment = async (req, res) => {
  const { id } = req.user;
  const { slug, commentId } = req.params;

  try {
    const fetchComment = await Comment.findOne({
      where: {
        id: commentId,
      },
    });

    if (fetchComment.user_id !== id) {
      res
        .status(422)
        .send({ error: "Unprocessable Entity", message: "Not owned by user." });
    }

    fetchComment.destroy();

    res.send(fetchComment);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const likeComment = async (req, res) => {
  try {
    const { commentId, liked, disliked } = req.body;
    const { slug } = req.params;
    const { id, username } = req.user;
    let likeData = [];
    let totalLikeCounts;
    let totalDislikeCounts;

    const stateUserId = id;
    const stateUsername = username;

    const fetchArticle = await Article.findArticleBySlug(slug);

    if (fetchArticle) {
      const articleId = fetchArticle.id;
      const userId = id;

      const isLikeCommentExist = await LikeComments.findOne({
        where: { comment_id: commentId, user_id: id, article_id: articleId },
      });

      const fetchComments = await Comment.findOne({
        where: {
          id: commentId,
          article_id: articleId,
        },
      });

      totalLikeCounts = fetchComments.like_counts
        ? fetchComments.like_counts
        : 0;
      totalDislikeCounts = fetchComments.dislike_counts
        ? fetchComments.dislike_counts
        : 0;

      if (!isLikeCommentExist) {
        likeData = await LikeComments.create({
          user_id: userId,
          article_id: articleId,
          comment_id: commentId,
          isLiked: liked,
        });

        totalLikeCounts++;
      } else {
        const stateLiked = isLikeCommentExist.isLiked;
        const stateDisliked = isLikeCommentExist.disliked;

        console.log("stated liked", stateLiked);
        console.log("stated disliked", stateDisliked);

        if (liked && stateDisliked) {
          if (totalLikeCounts >= 0) totalLikeCounts++;
          if (totalDislikeCounts && totalDislikeCounts > 0)
            totalDislikeCounts--;
        } else if (disliked && stateLiked) {
          if (totalDislikeCounts >= 0) totalDislikeCounts++;
          if (totalLikeCounts && totalLikeCounts > 0) totalLikeCounts--;
        }

        likeData = await isLikeCommentExist.update({
          isLiked: liked,
          isDisliked: disliked,
        });
      }

      fetchComments.update({
        like_counts: totalLikeCounts,
        dislike_counts: totalDislikeCounts,
      });

      if (stateUserId !== fetchComments.user_id) {
        const notifData = {
          senderId: stateUserId,
          receiverId: fetchComments.user_id,
          articleId: fetchArticle.id,
          senderUname: stateUsername,
          type: "reacted_comment",
          channel: "push",
          title: `Comment: ${fetchComments.body}`,
          content: `liked`,
          data: fetchArticle,
        };

        pushNotif(notifData);
      }
    }

    const response = {
      like_counts: totalLikeCounts,
      dislike_counts: totalDislikeCounts,
      like_comments: likeData,
      slug,
    };

    res.send({ data: response });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const disLikeComment = async (req, res) => {
  try {
    const { commentId, liked, disliked } = req.body;
    const { slug } = req.params;
    const { id, username } = req.user;
    let dislikeData = [];
    let totalLikeCounts;
    let totalDislikeCounts;

    const stateUserId = id;
    const stateUsername = username;

    const fetchArticle = await Article.findArticleBySlug(slug);

    if (fetchArticle) {
      const articleId = fetchArticle.id;
      const userId = id;

      const isLikeCommentExist = await LikeComments.findOne({
        where: { comment_id: commentId, user_id: id, article_id: articleId },
      });

      const fetchComments = await Comment.findOne({
        where: {
          id: commentId,
          article_id: articleId,
        },
      });

      totalDislikeCounts = fetchComments.dislike_counts
        ? fetchComments.dislike_counts
        : 0;
      totalLikeCounts = fetchComments.like_counts
        ? fetchComments.like_counts
        : 0;

      if (!isLikeCommentExist) {
        dislikeData = await LikeComments.create({
          user_id: userId,
          article_id: articleId,
          comment_id: commentId,
          isDisliked: disliked,
          dislike_counts: 1,
        });

        totalDislikeCounts++;
      } else {
        const stateLiked = isLikeCommentExist.isLiked;
        const stateDisliked = isLikeCommentExist.disliked;

        console.log("stated liked", stateLiked);
        console.log("stated disliked", stateDisliked);

        if (disliked && stateLiked) {
          if (totalDislikeCounts >= 0) totalDislikeCounts++;
          if (totalLikeCounts && totalLikeCounts > 0) totalLikeCounts--;
        } else if (liked && stateDisliked) {
          if (totalLikeCounts >= 0) totalLikeCounts++;
          if (totalDislikeCounts && totalDislikeCounts > 0)
            totalDislikeCounts--;
        }

        dislikeData = await isLikeCommentExist.update({
          isDisliked: disliked,
          isLiked: liked,
        });
      }

      fetchComments.update({
        dislike_counts: totalDislikeCounts,
        like_counts: totalLikeCounts,
      });

      if (stateUserId !== fetchComments.user_id) {
        const notifData = {
          senderId: stateUserId,
          receiverId: fetchArticle.author,
          articleId: fetchArticle.id,
          senderUname: stateUsername,
          type: "reacted_comment",
          channel: "push",
          title: `Comment: ${fetchComments.body}`,
          content: `disliked`,
          data: fetchArticle,
        };

        pushNotif(notifData);
      }
    }

    const response = {
      like_counts: totalLikeCounts,
      dislike_counts: totalDislikeCounts,
      like_comments: dislikeData,
      slug,
    };

    res.send({ data: response });
  } catch (error) {}
};
