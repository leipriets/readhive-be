import { User, Follower } from "../models/index.js";
import _ from "lodash";
import { pushNotif } from "./notification.controller.js";
import { Op } from "sequelize";

export const getProfile = async (req, res) => {
  try {
    const userParam = req.params.username;
    const stateUserId = req.user.id;

    const profile = await User.findOne({
      where: { username: userParam },
    });

    if (!profile) {

        res.status(404).send({
            profile: [],
            message: 'Profile not found.'
        });
    }

    const { username, image, bio, id } = profile;

    const follower = await Follower.findOne({
      where: {
        user_id: stateUserId,
        follow_id: id,
      },
    });

    const followersCount = await Follower.count({
      where: {
        follow_id: id,
      },
    });

    const followingCount = await Follower.count({
      where: {
        user_id: id,
      },
    });

    const isFollowed = follower ? true : false;

    res.send({
      profile: {
        username,
        image,
        bio,
        following: isFollowed,
        followersCount,
        followingCount,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const stateUser = req.user;
    const stateUsername = stateUser.username;
    const username = req.params.username;

    const following = await User.findByUsername(username);

    if (following.username !== stateUsername) {
      await Follower.create({
        user_id: userId,
        follow_id: following.id,
      });

      const { username, bio, image } = stateUser;

      const notifData = {
        senderId: userId,
        receiverId: following.id,
        articleId: null,
        senderUname: stateUsername,
        type: "followed_profile",
        channel: "push",
        title: `${stateUsername} started following you`,
        content: null,
        data: following,
      };

      pushNotif(notifData);

      res.send({
        profile: {
          username,
          bio,
          image,
          following: true,
        },
      });
    } else {
      res.status(422).send({ error: "Invalid request!" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Something went wrong!");
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const profileId = req.user.id;
    const stateUsername = req.user.username;
    const username = req.params.username;
    const follower = await User.findByUsername(username);

    if (username !== stateUsername) {
      await Follower.destroy({
        where: {
          user_id: profileId,
          follow_id: follower.id,
        },
      });

      res.send({
        message: `Profile ${username} unfollowed successfully.`,
      });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

export const searchProfile = async (req, res) => {
  const { search } = req.query;

  try {
    let response = {};

    if (search) {
      const searchProfile = await User.findAll({
        attributes: ["id", "username", "image"],
        where: {
          username: {
            [Op.like]: "%" + search + "%",
          },
        },
      });

      response = searchProfile;
    }

    res.send({
      profile: response,
    });
  } catch (error) {
    res.status(400).send(error);
  }
};
