import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Article from './article.model.js';
import User from './user.model.js';


const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.BIGINT(20),
        autoIncrement: true,
        primaryKey: true
    },
    body: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    author: {
        type: DataTypes.BIGINT(20),
        references: {
            model: User,
            key: 'id'
        }
    },
    article_id: {
        type: DataTypes.BIGINT(20),
        references: {
            model: Article,
            key: 'id'
        }
    }
  });
  
  export default Comment;