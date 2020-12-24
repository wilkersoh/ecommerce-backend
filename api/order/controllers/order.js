"use strict";
const { sanitizeEntity } = require("strapi-utils");
const stripe = require("stripe")(process.env.STRIPE_SK);

/**
 * Given a dollar amount, return the amount in cents
 * @param {number} number
 */
const fromDecimalToInt = (number) => parseInt(number * 100);

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Only returns orders that belongs to the logged in user
   * @param {any} ctx
   */
  async find(ctx) {
    const { user } = ctx.state; // this is the magic user
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.order.search({
        ...ctx.query,
        user: user.id,
      });
    } else {
      entities = await strapi.services.order.find({
        ...ctx.query,
        user: user.id,
      });
    }

    return entities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models.order })
    );
  },
  /**
   * Only returns one order, as long as it belongs to the user
   * @param {any} ctx
   */
  async findOne(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    const entity = await strapi.services.order.findOne({ id, user: user.id });
    return sanitizeEntity(entity, { model: strapi.models.order });
  },

  /**
   * Creteas an order and sets up the Stripe Checkout session for the front end
   * @param {any} ctx
   */
  async create(ctx) {
    const { product, quantity } = ctx.request.body;
    const orderQuantity = parseInt(quantity.value);

    if (!product) {
      return ctx.throw(400, "Please specify a product");
    }
    const realProduct = await strapi.services.product.findOne({
      id: product.id,
    });
    if (!realProduct) {
      return ctx.throw(404, "No product with such id");
    }

    const { user } = ctx.state;
    const BASE_URL = ctx.request.header.origin || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email,
      mode: "payment",
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: BASE_URL,
      line_items: [
        {
          price_data: {
            currency: "MYR",
            product_data: {
              name: realProduct.name,
            },
            unit_amount: fromDecimalToInt(realProduct.price),
          },
          quantity: orderQuantity,
        },
      ],
    });

    // Create the order in order strapi
    await strapi.services.order.create({
      user: user.id,
      status: "unpaid",
      total: realProduct.price * orderQuantity,
      checkout_session: session.id,
      product: realProduct.id,
      quantity: orderQuantity,
    });

    return { id: session.id };
  },
  /**
   *  Given a checkout_session, verifies payment and update the order
   * @param {any} ctx
   */
  async confirm(ctx) {
    const { checkout_session } = ctx.request.body;
    const session = await stripe.checkout.sessions.retrieve(checkout_session);

    if (session.payment_status === "paid") {
      const updateOrder = await strapi.services.order.update(
        {
          checkout_session,
        },
        {
          status: "paid",
        }
      );
      return sanitizeEntity(updateOrder, { model: strapi.models.order });
    } else {
      ctx.throw(400, "The payment wasn't sucesful, please call support");
    }
  },
};
