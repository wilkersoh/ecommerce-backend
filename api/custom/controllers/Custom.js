"use strict";

module.exports = {
  async logout(ctx) {
    ctx.cookies.set("token", null, {
      httpOnly: true,
      secure: process.env.NODE_ENV != "development" ? true : false,
      sameSite: "lax",
      maxAge: 0,
      domain:
        process.env.NODE_ENV != "development" ? "selfpaths.com" : "localhost",
    });

    ctx.cookies.set("viewToken", null, {
      // secure: process.env.NODE_ENV != "development" ? true : false,
      sameSite: "lax",
      maxAge: 0,
      domain:
        process.env.NODE_ENV != "development" ? "selfpaths.com" : "localhost",
    });

    ctx.send({
      authorized: true,
      message: "Successfully Log out",
    });
  },
};
