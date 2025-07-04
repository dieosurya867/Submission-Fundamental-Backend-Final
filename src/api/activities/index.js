const ActivitiesService = require("./service");

module.exports = {
  name: "activities",
  register: async (server) => {
    const service = new ActivitiesService();
    server.app.activitiesService = service;
  },
};
