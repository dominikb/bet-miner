const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');

const baseUrl = 'https://www.bet-at-home.com';
const gameOverview = baseUrl + '/de/sport/fussball/wm-2018-spiele/97760';

const formatDate = (rawDateString) => {
  let newDateString = rawDateString;

  if (rawDateString.indexOf('Heute') !== -1) {
    newDateString = rawDateString.replace('Heute', moment().format('DD.MM.YYYY'));
  }
  if (rawDateString.indexOf('Morgen') !== -1) {
    newDateString.replace('Morgen', moment().add(1, 'd').format('DD.MM.YYYY'));
  }
  return moment(newDateString, 'DD.MM.YYYY HH:mm').utc().valueOf();
};

const getOdds = () => {
  return new Promise((resolve, reject) => {
    axios.get(gameOverview).then((response) => {
      const $ = cheerio.load(response.data);

      const odds = [];
      // Select each row where data is
      $('table.sport-bet-widgets > tbody > tr').each((index, item) => {
        odds.push({
          homeTeam: $(item).children().first().text().split(' - ')[0],
          awayTeam: $(item).children().first().text().split(' - ')[1].split(/\s/)[0],
          forHomeTeam: $(item).children('.ods-odd').eq(0).text().replace(',', '.'),
          evenGame: $(item).children('.ods-odd').eq(1).text().replace(',', '.'),
          forAwayTeam: $(item).children('.ods-odd').eq(2).text().replace(',', '.'),
          link: baseUrl + $(item).children('.ods-odd-additional').children('a').first().attr('href'),
          startAt: formatDate($(item).children('.date').text())
        });
      });

      let quotes = {
        betathome: {
          odds: odds,
          minedAt: Date.now()
        }
      };
      resolve(quotes);
    }).catch(err => reject(err));
  });
};

getOdds().catch(err => console.log(err));

module.exports = {
  getOdds
}