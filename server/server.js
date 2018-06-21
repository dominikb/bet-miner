const express = require('express');
const path = require('path');
const moment = require('moment');
const hbs = require('hbs');

const { Game, Bet } = require('./models/index');

const port = process.env.PORT || 3000;

const responseMeta = req => {
  return {
    meta: {
      request: {
        time: moment().utc(),
        host: req.hostname,
        endpoint: req.url
      }
    }
  };
};

const boot = () => {
  const app = express();
  hbs.registerPartials(__dirname + '/views/partials');
  app.set('view engine', 'hbs');

  app.use(express.json());
  app.use(express.static(__dirname + '/../assets'));

  app.get('/bets', (req, res) => {
    let before = req.query.before || Date.now();
    let limit =
      req.query.limit < 1000 && req.query.limit > 0
        ? parseInt(req.query.limit)
        : 1000;

    if (before < new Date('2018-01-01').getTime()) {
      return res.status(400).send({
        error: {
          name: 'InvalidParameter',
          value: before,
          message:
            '$before must be a timestamp starting January 1st 2018, there was no WM before you dumbass!'
        },
        ...responseMeta(req)
      });
    }

    Bet.find({
      minedAt: {
        $lt: before
      }
    })
      .sort({
        minedAt: -1
      })
      .limit(limit)
      .then(documents => {
        res.send({
          data: documents,
          ...responseMeta(req)
        });
      })
      .catch(e =>
        res.status(400).send({
          error: e,
          ...responseMeta(req)
        })
      );
  });

  app.get('/bets/:id', (req, res) => {
    Bet.findById(req.params.id)
      .then(doc => {
        if (!doc) {
          return res.status(404).send({
            error: {
              message: 'No Bet exists with the given ID',
              type: 'NotFound'
            }
          });
        }

        res.send({
          data: doc,
          ...responseMeta(req)
        });
      })
      .catch(e =>
        res.status(400).send({
          error: e,
          ...responseMeta(req)
        })
      );
  });

  app.get('/games', (req, res) => {
    Game.find({})
      .then(games => {
        if (!games) {
          res.status(404).send({
            error: {
              message: 'No Games found'
            },
            ...responseMeta(req)
          });
        }

        res.send({
          data: games,
          ...responseMeta(req)
        });
      })
      .catch(e =>
        res.status(400).send({
          error: e,
          ...responseMeta(req)
        })
      );
  });

  app.get('/view/games', (req, res) => {
    let query = {};

    if (req.query.searchterm) {
      query = {
        $or: [
          {
            teamA: {
              $regex: req.query.searchterm,
              $options: 'i'
            }
          },
          {
            teamB: {
              $regex: req.query.searchterm,
              $options: 'i'
            }
          }
        ]
      };
    }

    Game.find(query)
      .sort({ scheduledAt: 1 })
      .then(games => {
        res.render('games.hbs', {
          games
        });
      });
  });

  app.get('/games/:id', (req, res) => {
    Game.findById(req.params.id)
      .then(doc => {
        if (!doc) {
          return res.status(404).send({
            error: {
              message: 'No Game exists with the given ID',
              type: 'NotFound'
            }
          });
        }

        res.send({
          data: doc,
          ...responseMeta(req)
        });
      })
      .catch(e =>
        res.status(400).send({
          error: e,
          ...responseMeta(req)
        })
      );
  });

  app.get('/view/games/:id', (req, res) => {
    Game.findById(req.params.id).then(game => {
      res.render('games.hbs', {
        game
      });
    });
  });

  app.get('/games/:id/bets', (req, res) => {
    Bet.find({
      game: req.params.id
    })
      .then(docs => {
        if (!docs) {
          res.status(404).send({
            error: {
              type: 'NotFound',
              message: 'No bets for the given Game ID found'
            },
            ...responseMeta(req)
          });
        }

        res.send({
          data: docs,
          ...responseMeta(req)
        });
      })
      .catch(e =>
        res.status(400).send({
          error: e,
          ...responseMeta(req)
        })
      );
  });

  app.get('/', (req, res) => {
    let promises = [Bet.find({}).count(), Game.find({}).count()];

    Promise.all(promises).then(values => {
      res.render('home.hbs', {
        betCount: values[0],
        gameCount: values[1]
      });
    });
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port} ... `);
  });
};

module.exports = {
  boot
};
