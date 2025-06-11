import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import ArticleTag from "./articleTag.model.js";

class NotificationActors extends Model {
  static async saveNotif(notification_id, user_id) {
    const notifActor = this;

    const isExistNotif = await notifActor.findOne({
      where: {
        notification_id,
        user_id,
      },
    });

    if (!isExistNotif) {
      await notifActor.create({
        notification_id,
        user_id,
      });
    }
  }
}

NotificationActors.init(
  {
    id: {
      type: DataTypes.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    notification_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "notifications",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "NotificationActors",
    tableName: "notification_actors",
  }
);

export default NotificationActors;
