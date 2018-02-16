const noteRoutes = require("./note_routes");

module.exports = function(app, db, io) {
  noteRoutes(app, db, io);
};
