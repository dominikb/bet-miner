const { Game, Bet } = require('./../models/index');

const handle = (req, res) => {
  Promise.all([
    Game.findById(req.params.id),
    Bet.find({ game: req.params.id })
  ]).then(args => {
    const [game, bets] = args;
    res.render('game.hbs', {
      game,
      bets: JSON.stringify(bets),
      hasResult:
        typeof game.result.score.teamA !== 'undefined' &&
        typeof game.result.score.teamB !== 'undefined'
    });
  });
};

module.exports = {
  handle
};
