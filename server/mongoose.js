const mongoose = require('mongoose');
const process = require('process');
const {
  Bet,
  Game
} = require('./models/index');

let connectionUrl = 'mongodb://localhost/BetMiner';
if (process.env.DB_CONNECTION) {
  connectionUrl = process.env.DB_CONNECTION;
}

mongoose.connect(connectionUrl);
mongoose.Promise = Promise;

const findOrCreateGame = (game) => {
  return Game.findOne({
    teamA: game.teamA,
    teamB: game.teamB
  }).then(doc => {
    if (doc) {
      return doc;
    }

    return game.save();
  });
}

const saveBet = (bet) => {
  let game = new Game({
    teamA: bet.homeTeam,
    teamB: bet.awayTeam,
    scheduledAt: bet.startAt,
    link: bet.link,
  });

  return findOrCreateGame(game)
    .then((game) => {
      return new Bet({
        teamA: bet.forHomeTeam,
        teamB: bet.forAwayTeam,
        even: bet.evenGame,
        minedAt: bet.minedAt,
        minedFrom: {
          site: bet.site
        },
        game: game._id
      }).save();
    });
};

module.exports = {
  mongoose,
  Schema: mongoose.Schema,
  saveBet
};