import { notifyUser, notifyUserComment } from "../socket/index.js";
import { Notification, User } from "../models/index.js";
import { Op } from "sequelize";
import NotificationActors from "../models/notificationActors.model.js";

export const pushNotif = async (notifData) => {
  const {
    senderId,
    articleId,
    receiverId,
    senderUname,
    type,
    channel,
    data,
    title,
    content,
  } = notifData;

  const notifContent = notifArticle(senderId, senderUname, type, title, content);
  await Notification.saveNotifData(notifData, notifContent);
  notifyUser(receiverId, notifContent);
};

export const getUserNotifications = async (req, res) => {
  try {
    const { id } = req?.user;

    const fetchNotifications = await Notification.findAndCountAll({
      include: [
        {
          model: NotificationActors,
          as: "notification_actors",
          include: [
            {
              model: User,
              as: "actors",
              attributes: ["username", "image"],
            },
          ],
        },
      ],
      where: {
        user_id: id,
      },
      order: [["updatedAt", "DESC"]],
    });

    const result = await Notification.transformNotifResponse(
      fetchNotifications
    );

    const response = {
      count: fetchNotifications.count,
      data: result,
    };

    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const getUserNotificationsCount = async (req, res) => {
  try {
    const { id } = req?.user;

    const fetchNotifications = await Notification.count({
      include: [
        {
          model: NotificationActors,
          as: 'notification_actors'
        }
      ],
      where: {
        user_id: id,
        [Op.or]: [
          {
            is_seen: {
              [Op.eq]: null
            }
          },
          {
            is_seen: {
              [Op.eq]: 0
            }
          }
        ],
      },
    });

    res.send({ count: fetchNotifications });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const clearSeenNotification = async(req, res) => {

  try {

    const { id } = req?.user;
    
    await Notification.update(
      { is_seen: true },
      {
      where: {
        user_id: id,
        [Op.or]: [
          {
            is_seen: {
              [Op.eq]: null
            }
          },
          {
            is_seen: {
              [Op.eq]: 0
            }
          }
        ],
      },
    });


    res.send({ data: [], message: 'Successfully seen notification' });


    
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }

}

const notifArticle = (senderId, senderUname, activity, title, content) => {
  let message;

  switch (activity) {
    case "favorited":
      message = { type: "message", value: " liked your post" };
      break;

    case "commented":
      message = { type: "message", value: " commented on your post" };
      break;

    case "reacted_comment":
      message = { type: "message", value: " reacted to your comment" };
      break;

      case "followed_profile":
        message = { type: "message", value: " started following you" };
        break;
  }

  const msgParts = [
    { type: "activity", value: activity },
    { type: "title", value: title },
    { type: "content", value: content },
    { type: "user", id: senderId, name: senderUname },
    message,
  ];

  return msgParts;
};
