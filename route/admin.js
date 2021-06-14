module.exports = function (app) {
  const adminHandler = require("./admin_controllers");
  // todoList Routes
  app.route("/profile").post(adminHandler.loginRequired, adminHandler.profile);
  app.route("/admin/register").post(adminHandler.register);
  app.route("/admin/sign_in").post(adminHandler.sign_in);
};
