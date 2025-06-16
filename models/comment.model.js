import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Article from './article.model.js';
import User from './user.model.js';

class Comment extends Model {}

Comment.init({
    id: {
        type: DataTypes.BIGINT(20),
        autoIncrement: true,
        primaryKey: true
    },
    body: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    user_id: {
        type: DataTypes.BIGINT(20),
        references: {
            model: User,
            key: 'id'
        }
    },
    article_id: {
        type: DataTypes.BIGINT(20),
        references: {
            model: "articles",
            key: 'id'
        }
    },
    like_counts: {
        type: DataTypes.BIGINT(20),
        allowNull: true
    },
    dislike_counts: {
        type: DataTypes.BIGINT(20),
        allowNull: true  
    }
  },  {
    sequelize,
    modelName: "Comment",
    tableName: "comments",
  });

  
  export default Comment;