import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import ArticleTag from "./articleTag.model.js";
import NotificationActors from "./notificationActors.model.js";
import _ from "lodash";

class Notification extends Model {
  static async saveNotifData(notifData, message_parts) {
    let notifId;
    const notif = this;
    const {
      articleId,
      senderId,
      receiverId,
      senderUname,
      type,
      channel,
      data,
    } = notifData;

    const notification = await notif.findOne({
      where: {
        article_id: articleId,
        user_id: receiverId,
        type,
      },
    });

    if (notification) {
      const updateNotif = await notification.update({
        is_seen: false,
        message_parts,
        updatedAt: new Date(),
      });

      notifId = updateNotif.id;
    } else {
      const saveData = {
        user_id: receiverId,
        article_id: articleId,
        sender_id: senderId,
        type,
        message_parts,
        json_data: data,
        channel,
      };

      const saveNotif = await notif.create(saveData);
      notifId = saveNotif.id;
    }

    await NotificationActors.saveNotif(notifId, senderId);
  }

  static async transformNotifResponse(notificationObj) {
    const transformedRows = notificationObj.rows.map((notif) => {
      const notifJson = notif.toJSON();

      const actors = _.map(notifJson?.notification_actors, (actors) => {
        return {
          username: _.get(actors.actors, "username"),
          image: _.get(actors.actors, "image"),
        }
      });

      

      delete notifJson.notification_actors;
      notifJson.actors = actors;

      return notifJson;
    });

    return transformedRows;
  }
}

Notification.init(
  {
    id: {
      type: DataTypes.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "Users",
        key: "id",
      },
    },
    article_id: {
      type: DataTypes.BIGINT(20),
      references: {
        model: "articles",
        key: "id",
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message_parts: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    json_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    channel: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    is_seen: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
  }
);

export default Notification;
