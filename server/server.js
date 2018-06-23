const express = require('express');
const path = require('path');
const moment = require('moment');
const hbs = require('hbs');

const {
  handleBets,
  handleBetsId,
  handleGames,
  handleGamesId,
  handleGamesIdBets,
  handleGamesIdMergeInto,
  handleGamesIdScore,
  handleRoot,
  handleViewGames,
  handleViewGamesId,
  handleViewStats
} = require('./routes/index');

const port = process.env.PORT || 3000;

const boot = () => {
  const app = express();
  hbs.registerPartials(__dirname + '/views/partials');
  hbs.registerHelper('date-format', function(context, block) {
    var format = block.hash.format || 'YYYY-MM-DD HH:mm ';
    return moment(context).format(format);
  });
  app.set('view engine', 'hbs');

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '/../assets')));

  app.get('/bets', handleBets);

  app.get('/bets/:id', handleBetsId);

  app.get('/games', handleGames);

  app.get('/games/:id', handleGamesId);

  app.get('/games/:id/bets', handleGamesIdBets);

  app.get('/games/:id/merge-into', handleGamesIdMergeInto);

  app.get('/games/:id/score', handleGamesIdScore);

  app.get('/view/games', handleViewGames);

  app.get('/view/games/:id', handleViewGamesId);

  app.get('/view/stats', handleViewStats);

  app.get('/', handleRoot);

  app.listen(port, () => {
    console.log(`Server listening on port ${port} ... `);
  });
};

module.exports = {
  boot
};
