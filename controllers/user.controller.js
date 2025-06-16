import { Token, User, Follower } from "../models/index.js";
import bcrypt from "bcrypt";

export const getCurrentUser = async (req, res) => {
  try {
    const { id, username, email, image, bio, token } = req.user;

    const response = {
      id,
      username,
      email,
      image,
      bio,
      token: token.token,
    };

    res.send({ user: response });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, username, password } = req.body.user;

    const user = await User.create({
      username,
      email,
      password,
    });

    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body.user;

    const user = await User.findByEmail(email);

    if (!user) {
      throw new Error("Invalid User credentials!");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid User credentials!");
    }

    const { id, name, image, bio, username, createdAt } = user.get({
      plain: true,
    });
    const token = await user.generateAuthToken();

    const response = {
      id,
      name,
      image,
      bio,
      token,
      username,
      createdAt,
    };

    res.send({ user: response });
  } catch (error) {
    res.status(400).send({ error: error?.message });
  }
};

export const userLogout = async (req, res) => {
  try {
    const stateUserId = req.user.id;
    const stateTokenId = req.user.token_uuid;

    const userToken = await Token.findOne({
      where: {
        user_id: stateUserId,
        uuid: stateTokenId,
      },
    });

    await userToken.destroy();

    res.send({
      message: "Successfully logout.",
    });
  } catch (error) {
    res.status(400).send({ error: error?.message });
  }
};

export const updateUserProfile = async (req, res) => {
  console.log("File received:", req.file); // Check if file is attached

  const url = req.protocol + '://' + req.get('host');

  const { id } = req.user;
  const { username, bio, email } = req.body;

  // if (!req.file) res.status(422).send({ message: "No file uploaded!" });

  try {

    let imagePath;
    
    if (req.file) {
      imagePath = url + "/src/images/" + req.file.filename;  
    }

    const user = await User.findOne({ where: { id } });

    if (user) {

      user.username = username;
      user.bio = bio;
      user.email = email;

      if (imagePath) user.image = imagePath;
      
      // check changes value
      if (user.changed('username') || user.changed('bio') || user.changed('email') || user.changed('image')) {
        user.save();
      }
      
      res.send({ message: 'Profile updated successfully.', user });

    } else {

      return res.status(400).json({ errors: "User not found." });

    }

  } catch (error) {
    console.log(error);
    if (error.name === "SequelizeValidationError") {
      // Format validation errors
      const messages = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({ errors: messages });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const actionUpload = async (req, res) => {
  res.send({ data: [] });
};
