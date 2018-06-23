document.addEventListener('DOMContentLoaded', event => {
  var oddsChart = echarts.init(document.getElementById('odds-chart'));

  let groupedOdds = Object.entries(getBetData('odds-chart')).reduce(
    (prev, cur) => {
      const [key, odds] = cur;

      let groupedOdds = odds.reduce(
        (prev, cur) => {
          prev.teamA.push([cur.minedAt, cur.teamA]);
          prev.teamB.push([cur.minedAt, cur.teamB]);
          prev.evenGame.push([cur.minedAt, cur.even]);
          return prev;
        },
        { teamA: [], teamB: [], evenGame: [] }
      );

      Object.entries(groupedOdds).forEach(item => {
        let [key, values] = item;
        groupedOdds[key] = stripUnchangedValues(
          values.sort((a, b) => a[0] - b[0])
        );
        // groupedOdds[key] = accumulateSeries(
        //   values.sort((a, b) => a[0] - b[0]),
        //   2.5
        // );
      });

      prev[key] = groupedOdds;
      return prev;
    },
    {}
  );

  const teamAName = document
    .querySelector('#teams #teamA')
    .innerHTML.trim();

  const teamBName = document.querySelector('#teams #teamB').innerHTML.trim();

  let series = [];
  Object.entries(groupedOdds).forEach(item => {
    const [site, odds] = item;

    Object.entries(odds).forEach(item => {
      let [key, values] = item;

      let lineStyle = lineStyleLookup[key];

      key = key.replace('teamA', teamAName).replace('teamB', teamBName);

      series.push({
        name: `${site} - ${key}`,
        type: 'line',
        data: values,
        smooth: true,
        lineStyle
      });
    });
  });

  let option = {
    title: {
      show: false
    },
    tooltip: {
      show: true,
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    legend: {},
    xAxis: {
      type: 'time'
    },
    yAxis: {},
    dataZoom: [
      {
        id: 'dataZoomX',
        type: 'inside',
        xAxisIndex: [0]
      }
    ],
    series
  };

  oddsChart.setOption(option);
});

const getBetData = nodeId => {
  const dataBets = document
    .getElementById(nodeId)
    .attributes.getNamedItem('data-bets').value;

  document.getElementById(nodeId).removeAttribute('data-bets');

  const bets = JSON.parse(dataBets).map(item => {
    return { ...item, minedAt: new Date(item.minedAt).getTime() };
  });

  return bets.reduce((prev, cur) => {
    let prettyOdds = {
      teamA: cur.teamA,
      teamB: cur.teamB,
      even: cur.even,
      minedAt: cur.minedAt
    };

    if (!prev[cur.minedFrom.site]) {
      prev[cur.minedFrom.site] = [prettyOdds];
    } else {
      prev[cur.minedFrom.site].push(prettyOdds);
    }
    return prev;
  }, {});
};

const accumulateSeries = (series, hours = 24, precision = 2) => {
  const timeDelta = hours * 60 * 60 * 1000;

  const newGroup = () => {
    return {
      startAt: null,
      timestamps: [],
      values: []
    };
  };

  const accumulateGroup = group => {
    return {
      time: parseInt(
        group.timestamps.reduce((prev, cur) => prev + cur) /
          group.timestamps.length
      ),
      value: (
        group.values.reduce((prev, cur) => prev + cur) / group.values.length
      ).toFixed(precision)
    };
  };

  let group = newGroup();

  let newSeries = [];
  series.forEach(item => {
    let [time, value] = item;

    if (!group.startAt) {
      group.startAt = time;
    }

    if (group.startAt + timeDelta < time) {
      newSeries.push(Object.values(accumulateGroup(group)));
      group = newGroup();
    } else {
      group.values.push(value);
      group.timestamps.push(time);
    }
  });
  return newSeries;
};

const stripUnchangedValues = series => {
  let strippedSeries = [];

  let lastValue = null;

  series.forEach((item, index) => {
    const [ts, value] = item;
    if (
      !(
        lastValue === value &&
        series[index + 1] &&
        series[index + 1][1] === value
      )
    ) {
      lastValue = value;
      strippedSeries.push(item);
    }
  });

  return strippedSeries;
};

const lineStyleLookup = {
  teamA: {
    color: '#33F0FF'
  },
  teamB: {
    color: '#FF338A'
  },
  evenGame: {
    color: '#4233FF'
  }
};
