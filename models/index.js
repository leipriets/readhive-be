import User from "./user.model.js";
import Article from "./article.model.js";
import Favorite from "./favorite.model.js";
import Tag from "./tag.model.js";
import ArticleTag from "./articleTag.model.js";
import Token from "./token.model.js";
import Follower from "./follower.model.js";

// Define associations
User.hasMany(Article, { foreignKey: "author", as: "articles" });
User.hasMany(Favorite, { foreignKey: "user_id", as: "favorites" });
User.hasMany(Token, { foreignKey: "user_id", as: "token" });
User.hasMany(Follower, { foreignKey: "user_id", as: "followers" });

Article.hasMany(Favorite, { foreignKey: "article_id", as: "favorites" });
Article.hasMany(ArticleTag, { foreignKey: "article_id", as: "articletags" });
Article.belongsTo(User, { foreignKey: "author", as: "user" });

Tag.hasMany(ArticleTag, { foreignKey: "tag_id", as: "tags" });


ArticleTag.belongsTo(Article, { foreignKey: "article_id" });
ArticleTag.belongsTo(Tag, { foreignKey: "tag_id", as: "tags" });

Favorite.belongsTo(Article, { foreignKey: "article_id", as: "articles" });
Favorite.belongsTo(User, { foreignKey: "user_id", as: "user" });
Token.belongsTo(User, { foreignKey: "user_id", as: "user" });
Follower.belongsTo(User, { foreignKey: "user_id", as: "user" });
Follower.belongsTo(User, { foreignKey: "follow_id", as: "user_follower" });


// Export all models together if needed
export { User, Article, Favorite, Tag, ArticleTag, Token, Follower };
