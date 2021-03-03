"use strict";
const crypto = require("crypto");

const { sanitizeEntity, getAbsoluteServerUrl } = require("strapi-utils");

module.exports = {
  async sendConfirmationEmail(user) {
    const userPermissionService =
      strapi.plugins["users-permissions"].services.userspermissions;
    const pluginStore = await strapi.store({
      environment: "",
      type: "plugin",
      name: "users-permissions",
    });

    const settings = await pluginStore
      .get({ key: "email" })
      .then((storeEmail) => storeEmail["email_confirmation"].options);

    const userInfo = sanitizeEntity(user, {
      model: strapi.query("user", "users-permissions").model,
    });

    const confirmationToken = crypto.randomBytes(20).toString("hex");

    await this.edit({ id: user.id }, { confirmationToken });

    settings.message = await userPermissionService.template(settings.message, {
      URL: `${getAbsoluteServerUrl(strapi.config)}/auth/email-confirmation`,
      USER: userInfo,
      CODE: confirmationToken,
    });

    settings.object = await userPermissionService.template(settings.object, {
      USER: userInfo,
    });

    // Send an email to the user.
    await strapi.plugins["email"].services.email.send({
      to: user.email,
      from:
        settings.from.email && settings.from.name
          ? `${settings.from.name} <${settings.from.email}>`
          : undefined,
      replyTo: settings.response_email,
      subject: settings.object,
      text: settings.message,
      html: settings.message,
    });
  },
};
