const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  teamA: String,
  teamB: String,
  scheduledAt: Date,
  link: String
});

const Game = mongoose.model('Game', GameSchema);

module.exports = {
  Game,
  GameSchema
};