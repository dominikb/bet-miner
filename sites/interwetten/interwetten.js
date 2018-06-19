const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');

const baseUrl = 'https://www.interwetten.com';
const gameOverview = baseUrl + '/de/sportwetten/top-leagues?topLinkId=7';
const homeTeamOddsSelector = 'div.bets td.bets [itemprop=homeTeam] strong';
const awayTeamOddsSelector = 'div.bets td.bets [itemprop=awayTeam] strong';
const homeTeamSelector = 'div.bets td.bets [itemprop=homeTeam] [itemprop=name]';
const awayTeamSelector = 'div.bets td.bets [itemprop=awayTeam] [itemprop=name]';

const getOdds = () => {
  return new Promise((resolve, reject) => {
    axios.get(gameOverview).then((response) => {
      const $ = cheerio.load(response.data);

      let homeTeams = [];
      let homeTeamOdds = [];
      let awayTeams = [];
      let awayTeamOdds = [];
      let evenOdds = [];
      let datesAndPlayTimes = [];
      let links = [];

      $(homeTeamSelector).map((index, item) => homeTeams.push($(item).text()));
      $(awayTeamSelector).map((index, item) => awayTeams.push($(item).text()));
      $(homeTeamOddsSelector).map((index, item) => homeTeamOdds.push($(item).text()));
      $(awayTeamOddsSelector).map((index, item) => awayTeamOdds.push($(item).text()));
      $(homeTeamOddsSelector).each((index, item) => {
        $(item).closest('tr').find('td').eq(1).find('strong')
          .map((index, item) => evenOdds.push($(item).text()))
      });
      $('#TBL_Content_10907 > tbody > tr > td.more > a').each((index, item) => {
        links.push(baseUrl + $(item).attr('href'));
      });

      $('#TBL_Content_10907 > tbody > tr:not(.group3) > td.playtime > p').each((index, item) => {
        let date = $(item).text().trim();

        // Manual implementation of nextUntil as it simply wouldn't work
        let ignore = false;
        $(item).closest('tr').nextAll().each((index, item) => {
          let classAttr = $(item).attr('class') || '';
          if (classAttr.indexOf('group3') === -1 && !ignore) {
            ignore = true;
          }

          if (!ignore) {
            let time = $(item).find('td.date').text().trim();
            datesAndPlayTimes.push(
              `${date} ${time}`
            );
          }
        });
      });

      let interwetten = [];
      for (let i = 0; i < homeTeams.length; i++) {
        interwetten.push({
          homeTeam: homeTeams[i],
          awayTeam: awayTeams[i],
          forHomeTeam: homeTeamOdds[i].replace(',', '.'),
          evenGame: evenOdds[i].replace(',', '.'),
          forAwayTeam: awayTeamOdds[i].replace(',', '.'),
          link: links[i],
          startAt: moment(datesAndPlayTimes[i], 'DD-MM-YYYY HH:mm:ss').utc().valueOf()
        });
      }

      let quotes = {
        interwetten: {
          odds: interwetten,
          minedAt: Date.now()
        }
      };

      resolve(quotes);
    }).catch(err => reject(err));
  });
};

module.exports = {
  getOdds
}