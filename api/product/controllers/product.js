"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findByCategory(ctx) {
    console.log("ctx findByCategory", ctx);
    return { product: 1, name: "hi" };
  },
};
