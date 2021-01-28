"use strict";
const { sanitizeEntity } = require("strapi-utils");
const stripe = require("stripe")(process.env.STRIPE_SK);
const { v4: uuidv4 } = require("uuid");

/**
 * Given a dollar amount, return the amount in cents
 * @param {number} number
 */
const fromDecimalToInt = (number) => parseInt(number * 100);

const getCartQuantity = (items, name) => {
  const cartItem = items.find((item) => item.product.name == name);
  return cartItem.quantity;
};

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
    const { user } = ctx.state;
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.order.search({
        ...ctx.query, // {}
        user: user.id,
      });
    } else {
      entities = await strapi.services.order.find({
        ...ctx.query, // {}
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
    const products = await strapi.query("product").find({
      id_in: ctx.request.body.map((cart) => {
        return cart.product.id;
      }),
    });

    if (!products.length) return ctx.throw(404, "No product with such id");

    const { user } = ctx.state;
    const BASE_URL = ctx.request.header.origin || "http://localhost:3000";
    const cartItems = products.map((product) => {
      const quantity = getCartQuantity(ctx.request.body, product.name);
      return {
        price_data: {
          currency: "MYR",
          product_data: {
            name: product.name,
          },
          unit_amount: fromDecimalToInt(product.price),
        },
        quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["MY"],
      },
      payment_method_types: ["card"],
      customer_email: user.email,
      mode: "payment",
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: BASE_URL,
      line_items: [...cartItems],
    });
    const trackID = uuidv4();

    try {
      await Promise.all(
        ctx.request.body.map((cart) => {
          return strapi.services.order.create({
            user: user.id,
            status: "unpaid",
            total: (cart.product.price * parseInt(cart.quantity)).toFixed(2),
            checkout_session: session.id,
            product: cart.product.id,
            quantity: cart.quantity,
            trackID,
          });
        })
      );

      return { id: session.id };
    } catch (error) {
      throw new Error("Failed to save in database in orders");
    }
  },
  /**
   *  Given a checkout_session, verifies payment and update the order
   * @param {any} ctx
   */
  async confirm(ctx) {
    const { checkout_session } = ctx.request.body;
    const session = await stripe.checkout.sessions.retrieve(checkout_session);

    if (session.payment_status === "paid") {
      const orders = await strapi.services.order.find({
        checkout_session: checkout_session,
      });
      const updateOrder = await Promise.all(
        orders.map((order) => {
          return strapi.services.order.update(
            { id: order.id },
            {
              shipping: JSON.stringify(session.shipping),
              status: "paid",
            }
          );
        })
      );
      return sanitizeEntity(updateOrder, { model: strapi.models.order });
    } else {
      ctx.throw(400, "The payment wasn't sucesful, please call support");
    }
  },
};
