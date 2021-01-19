"use strict";

module.exports = {
  async logout(ctx) {
    ctx.cookies.set("token", null);
    console.log("yz: user logout.");
    ctx.send({
      authorized: true,
      message: "Successfully destroyed session",
    });
  },
};
