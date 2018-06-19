const express = require('express');
const path = require('path');
const moment = require('moment');

const {
  Game,
  Bet
} = require('./models/index');
const {
  mongoose,
  saveBet
} = require('./mongoose');

const responseMeta = (req) => {
  return {
    meta: {
      request: {
        time: moment().utc(),
        host: req.hostname,
        endpoint: req.url
      }
    }
  };
}

const boot = () => {
  const app = express();

  app.use(express.json());

  app.get('/bets', (req, res) => {
    let before = req.query.before || Date.now();
    let limit = req.query.limit < 1000 && req.query.limit > 0 ?
      parseInt(req.query.limit) : 1000;

    if (before < new Date('2018-01-01').getTime()) {
      return res.status(400).send({
        error: {
          name: 'InvalidParameter',
          value: before,
          message: '$before must be a timestamp starting January 1st 2018, there was no WM before you dumbass!'
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
      .then((documents) => {
        res.send({
          data: documents,
          ...responseMeta(req)
        });
      })
      .catch(e => res.status(400).send({
        error: e,
        ...responseMeta(req)
      }));
  });

  app.get('/bets/:id', (req, res) => {
    Bet.findById(req.params.id)
      .then((doc) => {
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
      .catch(e => res.status(400).send({
        error: e,
        ...responseMeta(req)
      }));
  });

  app.get('/games', (req, res) => {
    Game.find({})
      .then((games) => {
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
      .catch(e => res.status(400).send({
        error: e,
        ...responseMeta(req)
      }));
  });

  app.get('/games/:id', (req, res) => {
    Game.findById(req.params.id)
      .then((doc) => {
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
      .catch(e => res.status(400).send({
        error: e,
        ...responseMeta(req)
      }));
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
  });

  // Add meta data to response
  app.use((req, res, next) => {
    res.body = {
      ...res.body,
      meta: {
        request: {
          time: moment().utc(),
          host: req.hostname,
          endpoint: req.url
        }
      }
    };
    return next();
  });

  app.listen(3000, () => {
    console.log(`Server listening on port 3000 ... `);
  });
};

module.exports = {
  boot
}