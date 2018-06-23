const { Game, Bet } = require('./../models/index');

const handle = (req, res) => {
  let promises = [Bet.find({}).count(), Game.find({}).count()];

  Promise.all(promises).then(values => {
    const [betCount, gameCount] = values;
    res.render('home.hbs', {
      betCount,
      gameCount
    });
  });
};

module.exports = {
  handle
};
