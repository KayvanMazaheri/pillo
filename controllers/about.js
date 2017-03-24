/**
 * GET /contact
 */
exports.aboutGet = function (req, res) {
  res.render('about', {
    title: 'About'
  });
}