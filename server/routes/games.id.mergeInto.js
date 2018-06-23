const { Bet } = require('./../models/index');

const handle = (req, res) => {
  if (req.params.id === req.query.mergeInto) {
    res.status(400).send({
      error: 'InvalidArgument',
      message: 'Can not merge game with itself'
    });
  }
  const query = { game: req.params.id };
  Bet.updateMany(query, { game: req.query.mergeInto })
    .then(() => Game.deleteOne({ _id: req.params.id }))
    .then(() => res.redirect('/view/games'));
};

module.exports = {
  handle
};
