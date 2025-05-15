import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import { Article } from "../models/index.js";
import { faker } from "@faker-js/faker";
import _ from "lodash";
import slug from "slug";

export const seedUsers = async () => {
  const password = await bcrypt.hash("password@123", 10);

  const users = await User.bulkCreate([
    {
      name: "John",
      username: "johndoe",
      email: "johndoe@yopmail.com",
      password,
    },
    {
      name: "Jane",
      username: "janedoe",
      email: "janedoe@yopmail.com",
      password,
    },
    {
      name: faker.person.fullName(),
      username: faker.person.firstName(),
      email: faker.internet.email(),
      password,
    },
  ]);

  return users;
};
