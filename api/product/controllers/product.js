"use strict";
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

/**
    After update here, we need to do
    1. Filter.js > update useEffect
    2. FilterList.js > update <Listing />
 */

module.exports = {
  async getFilterList(ctx) {
    const knex = strapi.connections.default;
    const { category_slug } = ctx.request.query;

    let resultBrands = knex("products as p")
      .select("b.name as brand_name", knex.raw("count(b.id) as brandCount"))
      .leftJoin("brands as b", { brand: "b.id" })
      .groupBy("brand_name");

    let resultTypes = knex("products as p")
      .select("t.name as type_name", knex.raw("count(t.id) as typeCount"))
      .leftJoin("products_types__types_products as pt", {
        "pt.product_id": "p.id",
      })
      .leftJoin("types as t", { type_id: "t.id" })
      .groupBy("type_name");

    let resultTags = knex("products as p")
      .select("tg.name as tag_name", knex.raw("count(tg.id) as tagCount"))
      .leftJoin("products_tags__tags_products as ptg", {
        "ptg.product_id": "p.id",
      })
      .leftJoin("tags as tg", { tag_id: "tg.id" })
      .groupBy("tag_name");

    // inital lengths
    let totalLength = knex("products as p")
      .count("* as totalLength")
      .join("categories_products__products_categories as cp", {
        "cp.product_id": "p.id",
      })
      .join("categories as c", { category_id: "c.id" });

    if (category_slug && category_slug != "undefined") {
      // null string pass from api = undefined string
      [resultBrands, resultTypes, resultTags].forEach((result) => {
        return result
          .join("categories_products__products_categories as cp", {
            "cp.product_id": "p.id",
          })
          .join("categories as c", { category_id: "c.id" })
          .where("category_slug", category_slug);
      });

      totalLength.where("category_slug", category_slug);
    }

    const result = await Promise.all([
      resultBrands,
      resultTypes,
      resultTags,
      totalLength,
    ]);

    return result;
  },
  async showFiltered(ctx) {
    const knex = strapi.connections.default;
    /**
      ctx.request.query >
        {
          category_slug: 'stationery-stamp-ink',
          types: [ 'sasuka', 'hey' ],
          brands: [ '2021', 'cutest' ]
          limit: "12"
        }
    */

    let {
      category_slug,
      types,
      brands,
      tags,
      limit,
      offset,
      sortBys,
    } = ctx.request.query;

    const queryBuilder = knex("products as p")
      .select(
        "p.id as productID",
        "p.name as product_name",
        "p.product_slug as product_slug",
        "p.quantity_in_store as quantity_in_store",
        "p.price as price",
        "b.name as brand_name",
        knex.raw(
          "GROUP_CONCAT(DISTINCT up.url) as images, GROUP_CONCAT(DISTINCT tg.name) as tag_names, GROUP_CONCAT(DISTINCT t.name) as type_names, GROUP_CONCAT(DISTINCT c.name) as category_names"
        )
      )
      .join("categories_products__products_categories as cp", {
        "cp.product_id": "p.id",
      })
      .join("categories as c", { category_id: "c.id" })
      .leftJoin("brands as b", { brand: "b.id" })
      .leftJoin("products_types__types_products as pt", {
        "pt.product_id": "p.id",
      })
      .leftJoin("types as t", { type_id: "t.id" })
      .leftJoin("products_tags__tags_products as ptg", {
        "ptg.product_id": "p.id",
      })
      .leftJoin("tags as tg", { tag_id: "tg.id" })
      .leftJoin("upload_file_morph as ufm", { "p.id": "ufm.related_id" })
      .leftJoin("upload_file as up", { upload_file_id: "up.id" })
      .groupBy("productID")
      .orderBy(`${sortBys[0]}`, `${sortBys[1]}`)
      .limit(+limit)
      .offset(+offset);

    // Except /products/all
    if (category_slug && category_slug != "undefined")
      queryBuilder.where("category_slug", category_slug);

    const activeValues = [brands, types, tags].filter(
      (value) => !!value != false
    );

    // STUPID WAY
    if (activeValues.length >= 2) {
      if (!Array.isArray(brands) && !!brands != false) brands = [brands];
      if (!Array.isArray(types) && !!types != false) types = [types];
      if (!Array.isArray(tags) && !!tags != false) tags = [tags];

      const totalLengthBuilder = knex("products as p")
        .countDistinct("p.name as totalLength")
        .join("categories_products__products_categories as cp", {
          "cp.product_id": "p.id",
        })
        .join("categories as c", { category_id: "c.id" })
        .leftJoin("brands as b", { brand: "b.id" })
        .leftJoin("products_types__types_products as pt", {
          "pt.product_id": "p.id",
        })
        .leftJoin("types as t", { type_id: "t.id" })
        .leftJoin("products_tags__tags_products as ptg", {
          "ptg.product_id": "p.id",
        })
        .leftJoin("tags as tg", { tag_id: "tg.id" })
        .where("category_slug", category_slug)
        .andWhere((builder) => {
          if (brands) builder.orWhereIn("b.name", brands);
          if (types) builder.orWhereIn("t.name", types);
          if (tags) builder.orWhereIn("tg.name", tags);
        });

      if (brands && types && tags) {
        queryBuilder.andWhere(function (builder) {
          builder
            .orWhereIn("b.name", brands)
            .orWhereIn("t.name", types)
            .orWhereIn("tg.name", tags);
        });

        const result = await Promise.all([queryBuilder, totalLengthBuilder]);

        return result;
      }

      if (brands && types) {
        queryBuilder.andWhere(function (builder) {
          builder.orWhereIn("b.name", brands).orWhereIn("t.name", types);
        });
      }

      if (brands && tags) {
        queryBuilder.andWhere(function (builder) {
          builder.orWhereIn("b.name", brands).orWhereIn("tg.name", tags);
        });
      }

      if (types && tags) {
        queryBuilder.andWhere(function (builder) {
          builder.orWhereIn("t.name", types).orWhereIn("tg.name", tags);
        });
      }
      const result = await Promise.all([queryBuilder, totalLengthBuilder]);

      return result;
    }

    const totalLengthBuilder = knex("products as p")
      .countDistinct("p.name as totalLength")
      .join("categories_products__products_categories as cp", {
        "cp.product_id": "p.id",
      })
      .join("categories as c", { category_id: "c.id" })
      .leftJoin("brands as b", { brand: "b.id" })
      .leftJoin("products_types__types_products as pt", {
        "pt.product_id": "p.id",
      })
      .leftJoin("types as t", { type_id: "t.id" })
      .leftJoin("products_tags__tags_products as ptg", {
        "ptg.product_id": "p.id",
      })
      .leftJoin("tags as tg", { tag_id: "tg.id" })
      .andWhere((builder) => {
        if (brands) builder.orWhere("b.name", brands);
        if (types) builder.orWhere("t.name", types);
        if (tags) builder.orWhere("tg.name", tags);
      });

    if (category_slug && category_slug != "undefined")
      totalLengthBuilder.where("category_slug", category_slug);

    if (types) {
      if (!Array.isArray(types)) types = [types];
      queryBuilder.whereIn("t.name", types);
    }

    if (brands) {
      if (!Array.isArray(brands)) brands = [brands];
      queryBuilder.whereIn("b.name", brands);
    }

    if (tags) {
      if (!Array.isArray(tags)) tags = [tags];
      queryBuilder.whereIn("tg.name", tags);
    }

    const result = await Promise.all([queryBuilder, totalLengthBuilder]);
    return result;
  },
};
