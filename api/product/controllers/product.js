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
    console.log("category_slug :>> ", category_slug);
    const resultBrands = knex("products as p")
      .select("b.name as brand_name", knex.raw("count(b.id) as brandCount"))
      .join("categories_products__products_categories as cp", {
        "cp.product_id": "p.id",
      })
      .join("categories as c", { category_id: "c.id" })
      .leftJoin("brands as b", { brand: "b.id" })
      .where("category_slug", category_slug)
      .groupBy("brand_name");

    const resultTypes = knex("products as p")
      .select("t.name as type_name", knex.raw("count(t.id) as typeCount"))
      .join("categories_products__products_categories as cp", {
        "cp.product_id": "p.id",
      })
      .join("categories as c", { category_id: "c.id" })
      .leftJoin("products_types__types_products as pt", {
        "pt.product_id": "p.id",
      })
      .leftJoin("types as t", { type_id: "t.id" })
      .where("category_slug", category_slug)
      .groupBy("type_name");

    const resultTags = knex("products as p")
      .select("tg.name as tag_name", knex.raw("count(tg.id) as tagCount"))
      .join("categories_products__products_categories as cp", {
        "cp.product_id": "p.id",
      })
      .join("categories as c", { category_id: "c.id" })
      .leftJoin("products_tags__tags_products as ptg", {
        "ptg.product_id": "p.id",
      })
      .leftJoin("tags as tg", { tag_id: "tg.id" })
      .where("category_slug", category_slug)
      .groupBy("tag_name");

    const result = await Promise.all([resultBrands, resultTypes, resultTags]);
    console.log("result :>> ", result);
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
    console.log("ctx.request.query :>> ", ctx.request.query);
    console.log("hit sortBys :>> ", sortBys);

    const queryBuilder = knex("products as p")
      .select(
        "p.id as productID",
        "p.name as product_name",
        "p.product_slug as product_slug",
        "p.quantity_in_store as quantity_in_store",
        "p.price as price",
        // "c.name as category_name",
        // "c.category_slug as category_slug",
        "b.name as brand_name",
        // knex.raw(
        //   "GROUP_CONCAT(DISTINCT up.url) as images, GROUP_CONCAT(DISTINCT tg.name) as tag_names, GROUP_CONCAT(DISTINCT t.name) as type_names"
        // )
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
      .where("category_slug", category_slug)
      .groupBy("productID")
      .orderBy(`${sortBys[0]}`, `${sortBys[1]}`)
      .limit(+limit)
      .offset(+offset);

    const activeValues = [brands, types, tags].filter(
      (value) => !!value != false
    );

    if (activeValues.length >= 2) {
      if (!Array.isArray(brands) && !!brands != false) brands = [brands];
      if (!Array.isArray(types) && !!types != false) types = [types];
      if (!Array.isArray(tags) && !!tags != false) tags = [tags];

      // STUPID WAY
      if (brands && types && tags)
        queryBuilder
          .whereIn("b.name", brands)
          .orWhereIn("t.name", types)
          .orWhereIn("tg.name", tags); // 這個還是有一點問題 他也會把不是category_slug的放進來： ?category_slug=stationery-stamp-ink&types=Sticky Notes&tags=Cutest&brands=YZ 創意文創

      if (brands && types) {
        queryBuilder.whereIn("b.name", brands).orWhereIn("t.name", types);
      }
      if (brands && tags) {
        queryBuilder.whereIn("b.name", brands).orWhereIn("tg.name", tags);
      }

      if (types && tags) {
        queryBuilder.whereIn("t.name", types).orWhereIn("tg.name", tags);
      }
      if (types && brands) {
        queryBuilder.whereIn("t.name", types).orWhereIn("b.name", brands);
      }

      return queryBuilder.then((result) => result);
    }

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

    // queryBuilder.then((result) => {
    //   console.log(JSON.parse(JSON.stringify(result)));
    //   console.log("hiiiiti");
    // });

    return queryBuilder.then((result) => result);
  },
};
