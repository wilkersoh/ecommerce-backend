"use strict";

module.exports = {
  async find(ctx) {
    const { q: value, offset } = ctx.request.query;
    const knex = strapi.connections.default;

    const products = knex("products as p")
      .select(
        "p.id as productID",
        "p.name as productName",
        "p.price as price",
        "p.content as content",
        "p.product_slug as product_slug",
        knex.raw("GROUP_CONCAT(DISTINCT uf.url) as images")
      )
      .join("upload_file_morph as ufm", "p.id", "ufm.related_id")
      .leftJoin("upload_file as uf", "ufm.upload_file_id", "uf.id")
      .where("p.name", "like", `%${value}%`)
      .groupBy("productID")
      .limit(5)
      .offset(+offset);

    const resultCount = knex("products as p")
      .count("* as totalLength")
      .where("p.name", "like", `%${value}%`);

    const result = await Promise.all([products, resultCount]);

    return result;
  },
};
