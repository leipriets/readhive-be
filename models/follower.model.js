import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.model.js';


const Follower = sequelize.define('Follower', {
    id: {
        type: DataTypes.BIGINT(20),
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.BIGINT(20),
        references: {
            model: User,
            key: 'id'
        }
    },
    follower_id: {
        type: DataTypes.BIGINT(20),
        references: {
            model: User,
            key: 'id'
        }
    }
  });
  
  export default Follower;