"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const { user } = ctx.state;

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
      const userID = user ? user.id : null;
      entity = await Promise.all(
        ctx.request.body.map((cart) => {
          return strapi.services.cart.create({
            user: userID,
            product: cart.productID,
            quantity: cart.quantity,
            category_slug: cart.category_slug,
          });
        })
      );
    } catch (error) {
      throw new Error("Create Cart Failed to save in database");
    }

    return sanitizeEntity(entity, { model: strapi.models.cart });
  },
  async update(ctx) {
    let entity;
    try {
      entity = await Promise.all(
        ctx.request.body.map((cart) => {
          const { id, ...payload } = cart;
          return strapi.services.cart.update({ id }, payload);
        })
      );
    } catch (error) {
      console.log("cart Update ERRROR -----");
      throw new Error(error);
    }

    return sanitizeEntity(entity, { model: strapi.models.cart });
  },
  async delete(ctx) {
    const { id } = ctx.params;
    try {
      const entity = await strapi.services.cart.delete({ id });
      return sanitizeEntity(entity, { model: strapi.models.cart });
    } catch (error) {
      throw new Error(error);
    }
  },
  async deletes(ctx) {
    const { user } = ctx.state;
    try {
      let entities = await strapi.services.cart.find({
        ...ctx.query,
        user: user.id,
      });
      const removeCart = await Promise.all(
        entities.map((cart) => strapi.services.cart.delete({ id: cart.id }))
      );

      return sanitizeEntity(removeCart, { model: strapi.models.cart });
    } catch (error) {
      throw new Error(error);
    }
  },
};
