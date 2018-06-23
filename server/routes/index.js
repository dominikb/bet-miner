module.exports = {
  handleBets: require('./bets').handle,
  handleBetsId: require('./bets.id').handle,
  handleGames: require('./games').handle,
  handleGamesId: require('./games.id').handle,
  handleGamesIdBets: require('./games.id.bets').handle,
  handleGamesIdMergeInto: require('./games.id.mergeInto').handle,
  handleGamesIdScore: require('./games.id.score').handle,
  handleRoot: require('./root').handle,
  handleViewGames: require('./view.games').handle,
  handleViewGamesId: require('./view.games.id').handle,
  handleViewStats: require('./view.stats').handle
};
