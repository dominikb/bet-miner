const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');

const baseUrl = 'https://sports.bwin.com';
const matchOverviewUrl =
  '/de/sports/4/63154,63156,63158,63160,63162,63164,63166,63168#leagueIds=63154,63156,63158,63160,63162,63164,63166,63168&orderMode=Date&page=0&sportId=4';

const groupSelector =
  '#markets > div > div.ui-widget-content-body > div > div > div > div';
const playDaySelector = 'div.marketboard-event-group__item--sub-group';
const matchSelector = 'div.marketboard-event-group__item--event';
const dateSelector = 'h2 > span';
const timeSelector = 'div.marketboard-event-without-header__market-time';
const teamSelector =
  'tr > td button > div.mb-option-button__option-name.mb-option-button__option-name--odds-4';
const oddSelector = 'button > div.mb-option-button__option-odds';
const linkSelector =
  'span.mb-event-details-buttons__button.mb-event-details-buttons__button--more-markets > a.mb-event-details-buttons__button-link';

const toTimestamp = (dateString, timeString) => {
  let dateTimeString = `${dateString.split(' ').pop()} ${timeString.replace(
    'PM',
    'p'
  )}`;

  let time = moment(dateTimeString, 'MM/DD/YYYY H:mm A')
    .utc()
    .valueOf();

  return time;
};

const getOdds = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(baseUrl + matchOverviewUrl)
      .then(response => {
        const $ = cheerio.load(response.data);

        const odds = [];
        // For each group, on each match day, each match
        $(groupSelector).each((i, group) => {
          $(group)
            .find(playDaySelector)
            .each((i, playDay) => {
              let dateString = $(playDay)
                .find(dateSelector)
                .text()
                .trim();

              $(playDay)
                .find(matchSelector)
                .each((i, match) => {
                  let timeString = $(match)
                    .find(timeSelector)
                    .text()
                    .trim();
                  let teams = $(match)
                    .find(teamSelector)
                    .map((i, item) => $(item).text())
                    .get();
                  let matchOdds = $(match)
                    .find(oddSelector)
                    .map((i, item) => $(item).text())
                    .get();

                  odds.push({
                    homeTeam: teams[0],
                    awayTeam: teams[2],
                    forHomeTeam: matchOdds[0].replace(',', '.'),
                    evenGame: matchOdds[1].replace(',', '.'),
                    forAwayTeam: matchOdds[2].replace(',', '.'),
                    link:
                      baseUrl +
                      $(match)
                        .find(linkSelector)
                        .attr('href'),
                    startAt: toTimestamp(dateString, timeString)
                  });
                });
            });
        });

        resolve({
          bwin: {
            odds: odds,
            minedAt: Date.now()
          }
        });
      })
      .catch(e => reject(e));
  });
};

module.exports = {
  getOdds
};
