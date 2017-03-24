var nodemailer = require('./../config/nodemailer');
var transporter = nodemailer.createTransport();

/**
 * GET /contact
 */
exports.contactGet = function(req, res) {
  res.render('contact', {
    title: 'Contact'
  });
};

/**
 * POST /contact
 */
exports.contactPost = function(req, res) {
  // Disable Contact Form
  req.flash('error', { msg: 'Contact form is currently disabled.' });
  return res.redirect('/contact');

  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('message', 'Message cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  var errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    return res.redirect('/contact');
  }

  var mailOptions = {
    from: req.body.name + ' ' + '<'+ req.body.email + '>',
    to: 'KayvanMazaheri@GMail.com',
    subject: '✔ Contact Form | Pillo',
    text: req.body.message
  };

  transporter.sendMail(mailOptions, function(err) {
    req.flash('success', { msg: 'Thank you! Your feedback has been submitted.' });
    res.redirect('/contact');
  });
};
