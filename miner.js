const moment = require('moment');

const interwetten = require('./sites/interwetten/interwetten');
const betathome = require('./sites/betathome/betathome');
const bwin = require('./sites/bwin/bwin');
const {
  Game,
  Bet
} = require('./server/models/index');
const {
  saveBet
} = require('./server/mongoose');

const handleAfterMining = (response) => {
  let odds = Object.entries(response)[0][1].odds;
  let saved = 1;

  odds.forEach((odd) => {
    odd.minedAt = Object.entries(response)[0][1].minedAt;
    odd.site = Object.entries(response)[0][0];

    saveBet(odd)
      .then((doc) => {
        console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] (${saved++}/${odds.length}) Saved bet from ${odd.site}`);
      }).
    catch(e => {
      console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] (${saved++}/${odds.length}) ERROR  @${odd.site}`);
    });
  });
}

const handleError = (e) => {
  console.log(e);
}

const mine = () => {
  interwetten
    .getOdds()
    .then(handleAfterMining)
    .catch(handleError);

  betathome
    .getOdds()
    .then(handleAfterMining)
    .catch(handleError);

  bwin
    .getOdds()
    .then(handleAfterMining)
    .catch(handleError);
};

const boot = () => {
  console.log('Mining started....');
  setInterval(mine, 1000 * 60 * 10);
}

module.exports = {
  boot
}