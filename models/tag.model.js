import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import ArticleTag from "./articleTag.model.js";

class Tag extends Model {

  static async saveTag(tagList, articleId) {
    

  }

  static async verifySaveTag(tag) {

    const findTag = await this.findOne({
      where: { name: tag }
    });

    if (findTag) {
      return findTag; 

    } else {
      const saveNewTag = await this.create({
        name: tag
      });

      return saveNewTag;
    }
  }

}

Tag.init(
  {
    id: {
      type: DataTypes.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Tag",
    tableName: "tags",
  }
);

export default Tag;
