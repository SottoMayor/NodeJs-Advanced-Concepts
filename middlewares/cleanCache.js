const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    // This trick guarantee this function will execute after
    // router handler execution!
    await next();

    clearHash(req.user.id);
}