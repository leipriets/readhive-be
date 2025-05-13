import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.model.js';
import Article from './article.model.js';

const Favorite = sequelize.define('Favorite', {
    id: {
        type: DataTypes.BIGINT(20),
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.BIGINT(20),
        references: {
            model: "user",
            key: 'id'
        }
    },
    article_id: {
        type: DataTypes.BIGINT(20),
        references: {
            model: "article",
            key: 'id'
        }
    }
});

export default Favorite;
