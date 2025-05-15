import { Token, User } from "../models/index.js";
import bcrypt from "bcrypt";

export const getCurrentUser = async (req, res) => {

  try {
    
    const { id, username, image, bio, token } = req.user;
  
    const response = {
      id,
      username,
      image,
      bio,
      token: token.token
    };

    res.send({ user: response});


  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }

};

export const createUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

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

    const { id, name, image, bio, username, createdAt } = user.get({ plain: true });
    const token = await user.generateAuthToken();

    const response = {
      id,
      name,
      image,
      bio,
      token,
      username,
      createdAt
    };

    res.send({ user: response });
  } catch (error) {
    res.status(400).send({ error: error?.message });
  }
};


export const userLogout = async(req, res) => {

  try {

    const stateUserId = req.user.id;
    const stateTokenId = req.user.token_uuid;

    const userToken = await Token.findOne({
      where: {
        user_id: stateUserId,
        uuid: stateTokenId
      }
    })

    await userToken.destroy();

    res.send({
      message: 'Successfully logout.'
    })
    
  } catch (error) {
    res.status(400).send({ error: error?.message });
  }

}
