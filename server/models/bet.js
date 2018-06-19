const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const {
  GameSchema
} = require('./index.js');

const BetSchema = new Schema({
  teamA: Number,
  even: Number,
  teamB: Number,
  minedAt: Date,
  minedFrom: {
    site: String
  },
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game'
  }
});

const Bet = mongoose.model('Bet', BetSchema);

module.exports = {
  Bet,
  BetSchema
};