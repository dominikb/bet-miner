const moment = require('moment');

const responseMeta = req => {
  return {
    meta: {
      request: {
        time: moment().utc(),
        host: req.hostname,
        endpoint: req.url
      }
    }
  };
};

module.exports = {
  responseMeta
};
