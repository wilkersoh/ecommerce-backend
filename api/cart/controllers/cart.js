"use strict";
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const { user } = ctx.state; // this is the magic user
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.cart.search({
        ...ctx.query,
        user: user.id,
      });
    } else {
      entities = await strapi.services.cart.find({
        ...ctx.query,
        user: user.id,
      });
    }

    return entities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models.cart })
    );
  },
  async findOne(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    const entity = await strapi.services.cart.findOne({ id, user: user.id });
    return sanitizeEntity(entity, { model: strapi.models.cart });
  },
  async create(ctx) {
    const { user } = ctx.state;
    let entity;

    try {
      entity = await Promise.all(
        ctx.request.body.map((cart) => {
          return strapi.services.cart.create({
            user: user.id,
            product: cart.productID,
            quantity: cart.quantity,
          });
        })
      );
    } catch (error) {
      throw new Error("Failed to save in database");
    }

    return sanitizeEntity(entity, { model: strapi.models.cart });
  },
  async update(ctx) {
    const { id } = ctx.params;
    const payload = ctx.request.body;

    let entity;
    try {
      if (ctx.is("multipart")) {
        // const { data, files } = parseMultipartData(ctx);
        // entity = await strapi.services.cart.update({ id }, data, {
        //   files,
        // });
        console.log("hit is multpart");
      } else {
        entity = await strapi.services.cart.update({ id }, ...payload);
      }
    } catch (error) {
      throw new Error(error);
    }

    return sanitizeEntity(entity, { model: strapi.models.cart });
  },
};
