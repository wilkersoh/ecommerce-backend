"use strict";

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  /**
   * Sends an email to the recipient in the body of the request
   */
  send: async (ctx) => {
    const body = ctx.request.body;
    const sendTo = body.email;
    strapi.log.debug(`Trying to send an email to ${sendTo}`);
    console.log("hit here");
    try {
      // This not be use. We use strapi provide. And sendInBlue.
      const emailOptions = {
        to: sendTo,
        subject: "Confimation from Creative • 文创!",
        html:
          "<h1>Creative • 文创!</h1><div><p>This is a test HTML email.</p></div>",
      };
      await strapi.plugins["email"].services.email.send(emailOptions);
      strapi.log.debug(`Email sent to ${sendTo}`);
      ctx.send({ message: "Email sent" });
    } catch (err) {
      strapi.log.error(`Error sending email to ${sendTo}`, err);
      ctx.send({ error: "Error sending email" });
    }
  },
};
