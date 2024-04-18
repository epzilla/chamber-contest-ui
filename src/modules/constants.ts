/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const WS_BASE_URL = 'wss://chamber-api.herokuapp.com';
export const BASE_URL = 'https://chamber-api.herokuapp.com/';
// local dev
// export const BASE_URL = 'http://localhost:3003/';

export const ROUTES = [
  { title: 'Home', href: '/' },
  { title: 'Upcoming Events', href: '/events/upcoming' },
  { title: 'Past Events', href: '/events/past' },
  { title: 'Points Contest', href: '/contest' },
  { title: 'Log Out', href: '/logout' },
  { title: 'Admin', href: '/admin', isAdmin: true }
];

// Websocket message types
export enum Msg {
  USER_UPDATED = 'USER_UPDATED',
  EVENT_ATTENDANCE_UPDATED = 'EVENT_ATTENDANCE_UPDATED'
}

export enum ActivityTypes {
  CALL_EMAIL = 'CALL_EMAIL',
  DELIVERY = 'DELIVERY',
  EVENT = 'EVENT',
  OTHER = 'OTHER',
  REFER_AMBASSADOR = 'REFER_AMBASSADOR',
  REFER_MEMBER = 'REFER_MEMBER',
  SPONSORSHIP_OUTSIDE_REFERRAL = 'SPONSORSHIP_OUTSIDE_REFERRAL',
  SPONSORSHIP_YOUR_COMPANY = 'SPONSORSHIP_YOUR_COMPANY',
  RIBBON_CUTTING = 'RIBBON_CUTTING',
  BRING_GUEST = 'BRING_GUEST',
  REJOIN = 'REJOIN',
  GIFT_DELIVERY = 'GIFT_DELIVERY',
  SUPPLIER_REFERRAL = 'SUPPLIER_REFERRAL',
  EVENT_HELP = 'EVENT_HELP'
}

export enum SubActivityTypes {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  CALL_AND_EMAIL = 'CALL_AND_EMAIL'
}

// strings
export const SITE_TITLE = 'Home Run Challenge';
