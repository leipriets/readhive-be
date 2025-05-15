import jwt from "jsonwebtoken";
import { Token, User } from "../models/index.js";
import _ from "lodash";

export const auth = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findOne({
      where: { id: decodedToken._id },
      include: [
        {
          model: Token,
          as: "token",
          where: { token },
        },
      ],
    });

    const tokenValue = user?.token?.[0]?.token;

    if (_.isEmpty(user)) {
      res.status(401).send({
        error: err,
        message: "Authentication failed.",
      });
    } else {
      const userData = {
        id: user.id,
        username: user.username,
        image: user.image,
        bio: user.bio,
        token: tokenValue,
        token_uuid: decodedToken._uuid
      };

      req.user = userData;

      next();
    }
  } catch (err) {
    res.status(401).send({
      error: err,
      message: "Authentication failed.",
    });
  }
};
