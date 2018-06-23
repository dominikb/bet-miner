const { Game } = require('./../models/index');

const handle = (req, res) => {
  let query = {};

  if (req.query.searchterm) {
    query = {
      $or: [
        {
          teamA: {
            $regex: req.query.searchterm,
            $options: 'i'
          }
        },
        {
          teamB: {
            $regex: req.query.searchterm,
            $options: 'i'
          }
        }
      ]
    };
  }

  Game.find(query)
    .sort({ scheduledAt: 1 })
    .then(games => {
      res.render('games.hbs', {
        games
      });
    });
};

module.exports = {
  handle
};
