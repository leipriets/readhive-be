import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import sequelize from "../config/database.js";

export const auth = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    res.status(401).send({
      error: err,
      message: "Authentication failed.",
    });
  }

  const user = await sequelize.query(
    `SELECT *
  FROM users
  WHERE id = :id
    AND JSON_SEARCH(
      JSON_EXTRACT(tokens, '$[*].token'),
      'one',
      :token
    ) IS NOT NULL
  LIMIT 1`,
    {
      replacements: { id: decodedToken._id, token },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  if (!user) {
    throw new Error();
  }

  const matchedToken = user[0].tokens.find(t => t.token === token);

  const userData = {
    username: user[0].username,
    image: user[0].image,
    bio: user[0].bio,
    token: matchedToken
  }

  req.user = userData;
  next();
};
