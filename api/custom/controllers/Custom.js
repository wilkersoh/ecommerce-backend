"use strict";

module.exports = {
  async logout(ctx) {
    ctx.cookies.set("token", null, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
      domain: "selfpaths.com",
      // domain: "localhost",
    });
    console.log("user trigger logout ");
    ctx.send({
      authorized: true,
      message: "Successfully Log out",
    });
  },
};
