"use strict";

module.exports = {
  async logout(ctx) {
    ctx.cookies.set("token", null);
    console.log("user trigger logout ");
    ctx.send({
      authorized: true,
      message: "Successfully Log out",
    });
  },
};
