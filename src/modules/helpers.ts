/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// import parseISO from 'date-fns/parseISO/index.js';
// import formatDistance from 'date-fns/formatDistance/index.js';
// import formatRelative from 'date-fns/formatRelative/index.js';
import { DEVICE_TYPES } from './constants';

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
  return totals.concat(emptyTotals);
}
