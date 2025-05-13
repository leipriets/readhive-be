import User from "./user.model.js";
import Article from "./article.model.js";
import Favorite from "./favorite.model.js";
import Tag from "./tag.model.js";
import ArticleTag from "./articleTag.model.js";

// Define associations
User.hasMany(Article, { foreignKey: "id", as: "articles" });
User.hasMany(Favorite, { foreignKey: "user_id", as: "favorites" });

Article.hasMany(Favorite, { foreignKey: "article_id", as: "articles" });
Article.hasMany(ArticleTag, { foreignKey: "article_id", as: "articletags" });
Article.belongsTo(User, { foreignKey: "author", as: "user" });

Tag.hasMany(ArticleTag, { foreignKey: "tag_id", as: "tags" });


ArticleTag.belongsTo(Article, { foreignKey: "id", as: "articles" });
ArticleTag.belongsTo(Tag, { foreignKey: "tag_id", as: "tags" });

Favorite.belongsTo(Article, { foreignKey: "article_id", as: "articles" });
Favorite.belongsTo(User, { foreignKey: "id", as: "user" });


// Export all models together if needed
export { User, Article, Favorite, Tag, ArticleTag };
