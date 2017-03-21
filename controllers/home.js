let announcements = require('../announcements.json')

/**
 * GET /
 */
exports.index = function(req, res) {
  res.render('home', {
    title: 'Home',
    announcements: announcements
  });
};
