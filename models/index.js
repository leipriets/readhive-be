import User from "./user.model.js";
import Article from "./article.model.js";
import Favorite from "./favorite.model.js";
import Tag from "./tag.model.js";
import ArticleTag from "./articleTag.model.js";
import Token from "./token.model.js";
import Follower from "./follower.model.js";
import Comment from "./comment.model.js";
import LikeComments from "./likeComments.model.js";
import Notification from "./notification.model.js";
import NotificationActors from "./notificationActors.model.js";

// Define associations
User.hasMany(Article);
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
User.hasMany(Favorite, { foreignKey: "user_id", as: "favorites" });
User.hasMany(Token, { foreignKey: "user_id", as: "token" });
User.hasMany(Follower, { foreignKey: "user_id", as: "followers" });
User.hasMany(LikeComments, { foreignKey: "user_id", as: "like_comments" });
// User.hasMany(Notification, { foreignKey: "user_id", as: "sentNotifications" });
User.hasMany(Notification, { foreignKey: "sender_id", as: "receivedNotifications" });



Article.hasMany(Favorite, { foreignKey: "article_id", as: "favorites" });
Article.hasMany(ArticleTag, { foreignKey: "article_id", as: "articletags" });
Article.hasMany(Comment, { foreignKey: 'article_id', as: 'comments' });
Article.hasMany(LikeComments, { foreignKey: 'article_id', as: 'like_comments' });
Article.belongsTo(User, { foreignKey: "author", as: "user" });

Tag.hasMany(ArticleTag, { foreignKey: "tag_id", as: "tags" });

ArticleTag.belongsTo(Article, { foreignKey: "article_id", as: 'articletags' });
ArticleTag.belongsTo(Tag, { foreignKey: "tag_id", as: "tags" });

Favorite.belongsTo(Article, { foreignKey: "article_id", as: "articles" });
Favorite.belongsTo(User, { foreignKey: "user_id", as: "users" });
Token.belongsTo(User, { foreignKey: "user_id", as: "user" });
Follower.belongsTo(User, { foreignKey: "user_id", as: "user" });
Follower.belongsTo(User, { foreignKey: "follow_id", as: "user_follower" });

Comment.hasMany(LikeComments, { foreignKey: "comment_id", as: "like_comments" });
Comment.belongsTo(Article, { foreignKey: "article_id", as: "article_comments" });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

LikeComments.belongsTo(Comment, { foreignKey: "comment_id", as: "like_comments" });


Notification.hasMany(NotificationActors, { foreignKey: "notification_id", as: "notification_actors" });
Notification.belongsTo(User, { foreignKey: "user_id", as: "sender" });


NotificationActors.belongsTo(Notification, { foreignKey: "notification_id", as: "notification_actors" });
NotificationActors.belongsTo(User, { foreignKey: "user_id", as: "actors" });




// Export all models together if needed
export { User, Article, Favorite, Tag, ArticleTag, Token, Follower, Comment, LikeComments, Notification, NotificationActors };
