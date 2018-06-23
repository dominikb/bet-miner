const { Bet } = require('./../models/index');
const { responseMeta } = require('./response.meta');

const handle = (req, res) => {
  let before = req.query.before || Date.now();
  let limit =
    req.query.limit < 1000 && req.query.limit > 0
      ? parseInt(req.query.limit)
      : 1000;

  if (before < new Date('2018-01-01').getTime()) {
    return res.status(400).send({
      error: {
        name: 'InvalidParameter',
        value: before,
        message:
          '$before must be a timestamp starting January 1st 2018, there was no WM before you dumbass!'
      },
      ...responseMeta(req)
    });
  }

  Bet.find({
    minedAt: {
      $lt: before
    }
  })
    .sort({
      minedAt: -1
    })
    .limit(limit)
    .then(documents => {
      res.send({
        data: documents,
        ...responseMeta(req)
      });
    })
    .catch(e =>
      res.status(400).send({
        error: e,
        ...responseMeta(req)
      })
    );
};

module.exports = {
  handle
};
