const fs = require('fs');

let dir = __dirname + "/mines/";
const compress = () => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      return console.log(`Error reading mines directory at ${dir}`);
    }

    let results = files.map(file => {
      return new Promise((resolve, reject) => {
        fs.readFile(dir + file, "utf8", (err, content) => {
          if (err) {
            return reject(err);
          }
          console.log(`File read ... ${dir + file}`);
          content = JSON.parse(content);

          let bettingSite = "interwetten";
          if (content.betathome) {
            bettingSite = "betathome";
          } else if (content.bwin) {
            bettingSite = "bwin";
          }
          content = content[bettingSite].odds.map(odd => {
            return {
              key: {
                homeTeam: odd.homeTeam,
                awayTeam: odd.awayTeam,
                startAt: odd.startAt
              },
              value: {
                forHomeTeam: odd.forHomeTeam,
                forAwayTeam: odd.forAwayTeam,
                evenGame: odd.evenGame,
                minedAt: content[bettingSite].minedAt,
                minedFrom: bettingSite
              }
            };
          });

          resolve(content);
        });
      });
    });
    Promise.all(results).then(contents => {
      // let map = contents[0].reduce(
      //   (prev, cur) => prev.set(cur.key, [cur.value]),
      //   new Map()
      // );

      let map = contents.reduce((map, content) => {
        let curMap = content.reduce(
          (prev, cur) => prev.set(cur.key, [cur.value]),
          new Map()
        );

        curMap.forEach((value, key) => {
          let stringKey = JSON.stringify(key);
          if (map[stringKey]) {
            map[stringKey].push(value);
          } else {
            map[stringKey] = [value];
          }
        });

        return map;
      }, {});

      fs.writeFile(
        'compressed_mines.json',
        JSON.stringify(map, null, 2),
        (err) => {
          if (err) {
            return console.log(`Error when writing compressed file ${err}`);
          }

          console.log(`Compressed successfully!`);
        }
      )
    });
  });
}

module.exports = {
  compress
};