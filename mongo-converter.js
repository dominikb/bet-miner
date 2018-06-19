// Be careful, this will clean your databaes
// And it takes a shit ton of time to run through
const {
  mongoose
} = require('./server/mongoose');
const {
  Game,
  Bet
} = require('./server/models/index');

const mined = require('./compressed_mines.json');

const saveToMongo = async obj => {
  return obj
    .save()
    .then(doc => process.stdout.write('.'))
    .catch(e => console.log(e));
};

mongoose.connect(
  'mongodb://localhost/BetMiner',
  () => {
    mongoose.connection.db.dropDatabase();
  }
);

let savePromises = [];

// Get games
const convert = () => {
  Object.entries(mined).forEach(entry => {
    let gameData = JSON.parse(entry[0]);

    let game = new Game({
      teamA: gameData.homeTeam,
      teamB: gameData.awayTeam,
      scheduledAt: gameData.startAt
    });

    savePromises.push(saveToMongo(game));

    entry[1].forEach(bets => {
      bets.forEach(betData => {
        let bet = new Bet({
          teamA: betData.forHomeTeam.replace(',', '.'),
          even: betData.evenGame.replace(',', '.'),
          teamB: betData.forAwayTeam.replace(',', '.'),
          minedAt: betData.minedAt,
          minedFrom: {
            site: betData.minedFrom
          },
          game: game._id
        });

        savePromises.push(saveToMongo(bet));
      });
    });
  });

  return savePromises;
};

module.exports = {
  convert
};