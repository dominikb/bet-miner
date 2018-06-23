const { Game } = require('./../models/index');
const { responseMeta } = require('./response.meta');

const handle = (req, res) => {
  Game.find({})
    .then(games => {
      if (!games) {
        res.status(404).send({
          error: {
            message: 'No Games found'
          },
          ...responseMeta(req)
        });
      }

      res.send({
        data: games,
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
