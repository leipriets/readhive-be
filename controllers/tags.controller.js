import { Tag } from "../models/index.js";

export const getTags = async (req, res) => {
  const tags = await Tag.findAll({
    attributes: ['name'],
  });

  const tagNames = tags.map(item => item.name);
  res.send({ data: tagNames });
  
};
