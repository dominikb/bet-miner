const { Bet } = require('./../models/index');
const { responseMeta } = require('./response.meta');

const handle = (req, res) => {
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
};

module.exports = {
  handle
};
