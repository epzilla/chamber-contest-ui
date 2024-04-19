/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */

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

export const generateGuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

export const getFirstName = (name?: string) => (name || '').split(' ')[0];

export function calculateTotalsForTimePeriod(json: TimePeriodTotalRsp) {
  const { allEventsAttendance, pointTotals } = json;
  const emptyTotals: PointsTotalWithEvents[] = pointTotals
    .filter(t => t.total === 0)
    .map(t => ({
      ...t,
      events: [],
      guests: 0
    }));
  const totals: PointsTotalWithEvents[] = [];
  allEventsAttendance.forEach(att => {
    const mem = pointTotals.find(pt => pt.memberId === att.memberId);
    if (mem) {
      const i = totals.findIndex(t => t.memberId === att.memberId);
      if (i !== -1) {
        totals[i].events.push(att);
        totals[i].guests += att.guests;
      } else {
        const memberTotal: PointsTotalWithEvents = {
          memberId: mem.memberId,
          name: mem.name,
          total: mem.total,
          rank: mem.rank,
          events: [att],
          guests: att.guests
        };
        totals.push(memberTotal);
      }
    }
  });
  return totals.concat(emptyTotals).sort((a, b) => {
    const rankDiff = a.rank - b.rank;
    if (rankDiff !== 0) {
      return rankDiff;
    }
    const eventsDiff = a.events.length - b.events.length;
    if (eventsDiff !== 0) {
      return eventsDiff;
    }
    const guestsDiff = a.guests - b.guests;
    if (guestsDiff !== 0) {
      return guestsDiff;
    }
    const nameDiff = a.name.localeCompare(b.name);
    return nameDiff;
  });
}

export function getMonth(month: number) {
  switch (month) {
    case 1:
      return 'January';
    case 2:
      return 'February';
    case 3:
      return 'March';
    case 4:
      return 'April';
    case 5:
      return 'May';
    case 6:
      return 'June';
    case 7:
      return 'July';
    case 8:
      return 'August';
    case 9:
      return 'September';
    case 10:
      return 'October';
    case 11:
      return 'November';
    case 12:
      return 'December';
  }
}

export function sortEventsByTime(a: ChamberEvent, b: ChamberEvent) {
  const aTime = new Date(a.startTime);
  const bTime = new Date(b.startTime);
  return bTime.getTime() - aTime.getTime();
}

const ten = function (i) {
  return (i < 10 ? '0' : '') + i;
};

export function toDatetimeLocal(dateString: string) {
  const date = new Date(dateString);
  const YYYY = date.getFullYear();
  const MM = ten(date.getMonth() + 1);
  const DD = ten(date.getDate());
  const HH = ten(date.getHours());
  const II = ten(date.getMinutes());
  const SS = ten(date.getSeconds());
  return YYYY + '-' + MM + '-' + DD + 'T' + HH + ':' + II + ':' + SS;
}

export function validateEvent(ev: Partial<ChamberEvent>) {
  const { startTime, title, eventType } = ev;
  if (!startTime) {
    return Promise.reject('Event must have a start time');
  }
  if (!title) {
    return Promise.reject('Event must have a title');
  }
  if (!eventType?.length) {
    return Promise.reject('Event must have a type');
  }
  return Promise.resolve();
}

const exclamations = [
  'Alright!',
  'Awesome!',
  'Bam!',
  'Boom!',
  'Booyah!',
  'Bravo!',
  'Cool!',
  'Excellent!',
  'Good job!',
  'Great!',
  'Nice!',
  'Right on!',
  'Sweet!',
  'Super!',
  'Way to go!',
  'Well done!',
  'Woohoo!',
  'Yay!',
  'Yesss!'
];

export function getRandomExclam() {
  return exclamations[Math.floor(Math.random() * exclamations.length)];
}
