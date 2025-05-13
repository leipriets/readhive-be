import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import Article from "./article.model.js";

class User extends Model {
  async generateAuthToken() {
    const user = this;
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_KEY, {
      expiresIn: "7D",
    });
    const myUUID = uuidv4();

    user.tokens = user.tokens.concat({ id: myUUID, token: token });
    await user.save();

    return token;
  }

  static async findByEmail(email) {

    const user = this;

    return await user.findOne({
      where: { email }
    });
  }

  static async findByUsername(username) {
    
    const user = this;

    return await user.findOne({
      where: { username }
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
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
    tokens: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    defaultScope: {
      attributes: { exclude: ["email"] },
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
