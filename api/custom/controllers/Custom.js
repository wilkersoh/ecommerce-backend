"use strict";

module.exports = {
  async logout(ctx) {
    ctx.cookies.set("token", null);
    console.log("yz: logout 1");
    ctx.send({
      authorized: true,
      message: "Successfully destroyed session",
    });
    console.log("yz: logout 2");
  },
};
