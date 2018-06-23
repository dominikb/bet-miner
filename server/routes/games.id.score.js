const { Game } = require('./../models/index');

const handle = (req, res) => {
  Game.findByIdAndUpdate(req.params.id, {
    result: {
      score: {
        teamA: req.query.scoreTeamA,
        teamB: req.query.scoreTeamB
      }
    }
  }).then(() => {
    res.redirect(`/view/games/${req.params.id}`);
  });
};

module.exports = {
  handle
};
