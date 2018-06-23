const { Bet } = require('./../models/index');
const { responseMeta } = require('./response.meta');

const handle = (req, res) => {
  Bet.find({
    game: req.params.id
  })
    .then(docs => {
      if (!docs) {
        res.status(404).send({
          error: {
            type: 'NotFound',
            message: 'No bets for the given Game ID found'
          },
          ...responseMeta(req)
        });
      }

      res.send({
        data: docs,
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
