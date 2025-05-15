import { Article } from "../models/index.js";
import { faker } from "@faker-js/faker";
import _ from "lodash";
import slug from "slug";

export const seedArticles = async (users) => {

  return await users.forEach( async (user) => {
    console.log("article->seed.js -> user_id", user.id);

    let authorId = user.id;
    let title = faker.lorem.sentence();
    let body = faker.lorem.sentence(10);
    let description = faker.lorem.sentence(2);
    let generateSlug = slug(title, { lower: true });

    const articles = await Article.create(
      {
        author: authorId,
        slug: generateSlug,
        title,
        body,
        description,
      },
      {
        logging: console.log,
      }
    );

    console.log(articles);
    console.log("✅ Article Seeding completed successfully!");
    return articles;
  });
  //   });
};
