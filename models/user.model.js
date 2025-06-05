import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import Token from "./token.model.js";
import Follower from "./follower.model.js";

class User extends Model {
  async generateAuthToken() {
    const user = this;
    const myUUID = uuidv4();
    const token = jwt.sign(
      { _id: user.id.toString(), _uuid: myUUID },
      process.env.JWT_KEY,
      {
        expiresIn: "7D",
      }
    );

    // user.tokens = user.tokens.concat({ id: myUUID, token: token });

    await Token.create({
      uuid: myUUID,
      user_id: user.id,
      token,
    });

    return token;
  }

  static async findByEmail(email) {
    const user = this;

    return await user.findOne({
      where: { email },
    });
  }

  static async findByUsername(username) {
    const user = this;

    return await user.findOne({
      where: { username },
    });
  }
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Please enter a valid email address.',
        },
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    defaultScope: {
      // attributes: { exclude: ["email"] },
    },
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

export default User;
