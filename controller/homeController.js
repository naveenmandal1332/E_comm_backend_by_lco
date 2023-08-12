const BigPromise = require('../middleware/bigPromise');

exports.home = BigPromise(async (req, res) => {
  res.status(200).json({
    success: true,
    greeting: 'Welcome to the T-shirt Shop',
  });
});
