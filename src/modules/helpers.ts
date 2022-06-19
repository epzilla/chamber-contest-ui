/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import parseISO from 'date-fns/parseISO/index.js';
import formatDistance from 'date-fns/formatDistance/index.js';
import formatRelative from 'date-fns/formatRelative/index.js';
import {
  ALERT_MATCH_CAN_BE_UPDATED_BY_OTHERS,
  ALERT_MATCH_STARTED,
  DEVICE_TYPES
} from './constants';

export const lightenOrDarken = (col, amt) => {
  let usePound = false;
  if (col[0] == '#') {
    col = col.slice(1);
    usePound = true;
  }

  const num = parseInt(col, 16);
  let red = (num >> 16) + amt;
  if (red > 255) {
    red = 255;
  } else if (red < 0) {
    red = 0;
  }

  let blue = ((num >> 8) & 0x00ff) + amt;
  if (blue > 255) {
    blue = 255;
  } else if (blue < 0) {
    blue = 0;
  }

  let green = (num & 0x0000ff) + amt;
  if (green > 255) {
    green = 255;
  } else if (green < 0) {
    green = 0;
  }

  return (
    (usePound ? '#' : '') +
    String('000000' + (green | (blue << 8) | (red << 16)).toString(16)).slice(
      -6
    )
  );
};

export const getFormattedMatchDate = game => {
  const date = parseISO(game.finishTime);
  const now = new Date();
  return formatRelative(date, now);
};

export const getMatchTimeAgo = match => {
  if (!match) return '';
  return formatDistance(parseISO(match.startTime), new Date(), {
    includeSeconds: true,
    addSuffix: true
  });
};

export const getTeamName = (match, teamNum) => {
  if (!match) return '';
  if (match.doubles && teamNum === 1) {
    return `${match.player1.lname} / ${match.partner1.lname}`;
  } else if (match.doubles && teamNum === 2) {
    return `${match.player2.lname} / ${match.partner2.lname}`;
  } else {
    return (
      match[`player${teamNum}`].fname + ' ' + match[`player${teamNum}`].lname
    );
  }
};

export const getScoreHeaderLine = (match, game) => {
  if (game.score1 > game.score2) {
    const teamName = match.doubles
      ? `${match.player1.lname}/${match.partner1.lname}`
      : match.player1.lname;
    return `${game.score1}-${game.score2} (F), ${teamName}`;
  } else {
    const teamName = match.doubles
      ? `${match.player2.lname}/${match.partner2.lname}`
      : match.player2.lname;
    return `${game.score2}-${game.score1} (F), ${teamName}`;
  }
};

export const getStatsForMatch = match => {
  const stats: MatchStats = {
    p1GamesWon: 0,
    p2GamesWon: 0,
    p1TotalPoints: 0,
    p2TotalPoints: 0,
    p1name: '',
    p2name: '',
    resultString: '',
    pointsWonString: '',
    winner: null
  };

  match.games.forEach(g => {
    stats.p1TotalPoints += g.score1;
    stats.p2TotalPoints += g.score2;
    stats.p1name = match.doubles
      ? `${match.player1.lname} / ${match.partner1.lname}`
      : match.player1.fname;
    stats.p2name = match.doubles
      ? `${match.player2.lname} / ${match.partner2.lname}`
      : match.player2.fname;
    if (g.score1 > g.score2) {
      stats.p1GamesWon++;
    } else {
      stats.p2GamesWon++;
    }
  });

  if (stats.p1GamesWon > stats.p2GamesWon) {
    stats.resultString = `${stats.p1name} won, ${stats.p1GamesWon}-${stats.p2GamesWon}`;
    stats.winner = match.player1Id;
  } else if (stats.p2GamesWon > stats.p1GamesWon) {
    stats.resultString = `${stats.p2name} won, ${stats.p2GamesWon}-${stats.p1GamesWon}`;
    stats.winner = match.player2Id;
  } else {
    stats.resultString = `Draw, ${stats.p2GamesWon}-${stats.p1GamesWon}`;
  }

  if (stats.p1TotalPoints > stats.p2TotalPoints) {
    stats.pointsWonString = `${stats.p1name} outscored ${stats.p2name} ${stats.p1TotalPoints}-${stats.p2TotalPoints}`;
  } else if (stats.p2TotalPoints > stats.p1TotalPoints) {
    stats.pointsWonString = `${stats.p2name} outscored ${stats.p1name} ${stats.p2TotalPoints}-${stats.p1TotalPoints}`;
  } else {
    stats.pointsWonString = `Total points were even, ${stats.p2TotalPoints}-${stats.p1TotalPoints}`;
  }

  return stats;
};

export const getFullPlayerName = p => {
  let name = '';

  if (p.fname) {
    name += p.fname;
  }

  if (p.middleInitial) {
    if (name.trim().length > 0) {
      name += ` ${p.middleInitial}`;
    } else {
      name += p.middleInitial;
    }
  }

  if (p.lname) {
    if (name.trim().length > 0) {
      name += ` ${p.lname}`;
    } else {
      name += p.lname;
    }
  }

  return name;
};

export const generateGuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const calculateExpectedPointsPerMatch = match => {
  let expectedPerGame;

  const finishedGames = match.games.filter(g => g.gameFinished);
  if (finishedGames.length > 0) {
    expectedPerGame =
      finishedGames.reduce(
        (sum, current) => sum + (current.score1 + current.score2),
        0
      ) / finishedGames.length;
  } else {
    expectedPerGame = match.playTo * 1.75;
  }

  if (match.playAllGames) {
    return expectedPerGame * match.bestOf;
  }

  return (
    expectedPerGame *
    Math.ceil((match.bestOf + Math.ceil(match.bestOf / 2)) / 2)
  );
};

export const shouldFlashScore = (scoreFlash, game, i, teamNum) => {
  if (scoreFlash?.game === i) {
    if (teamNum === 1 && game?.player1Id === scoreFlash?.scorer) {
      return true;
    } else if (teamNum === 2 && game?.player2Id === scoreFlash?.scorer) {
      return true;
    }
  }

  return false;
};

export const getBestGuessDevice = () => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const greaterDimension = height >= width ? height : width;
    const lesserDimension = greaterDimension === height ? width : height;
    const hiDpi =
      window.matchMedia('(min-resolution: 120dpi)').matches ||
      window.matchMedia('(-webkit-min-device-pixel-ratio: 1.3)').matches;

    if (greaterDimension < 800) {
      return DEVICE_TYPES.MOBILE_DEVICE;
    } else if (greaterDimension < 1200 && lesserDimension < 800) {
      return DEVICE_TYPES.TABLET_DEVICE;
    } else if (
      (greaterDimension < 1800 && lesserDimension >= 800) ||
      (greaterDimension < 2400 && hiDpi)
    ) {
      return DEVICE_TYPES.LAPTOP_DEVICE;
    }
  }

  return DEVICE_TYPES.OTHER_DEVICE;
};

export const isEmpty = (obj: any) =>
  !obj || (typeof obj === 'object' && Object.keys(obj).length === 0);

export const debounce = function (func, wait, immediate) {
  let timeout;
  return function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this,
      // eslint-disable-next-line prefer-rest-params
      args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
};

export const generateMatchStartAlert = (match, clickOrTap) => {
  return ALERT_MATCH_STARTED(
    {
      team1: getTeamName(match, 1),
      team2: getTeamName(match, 2)
    },
    clickOrTap
  );
};

export const generateSharedDevicesAlert = devices => {
  let deviceList = devices[0].name;
  if (devices.length > 1) {
    //@ts-expect-error
    const formatter = new Intl.ListFormat(navigator.language, {
      style: 'long',
      type: 'conjunction'
    });
    deviceList = formatter.format(devices.map(d => d.name));
  }
  return ALERT_MATCH_CAN_BE_UPDATED_BY_OTHERS(deviceList);
};
