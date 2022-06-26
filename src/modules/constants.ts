/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const WS_BASE_URL = 'ws://192.168.1.8:3003';
export const BASE_URL = 'http://192.168.1.8:3003/';
export const DEVICE_TYPES = {
  MOBILE_DEVICE: 'Mobile',
  TABLET_DEVICE: 'Tablet',
  LAPTOP_DEVICE: 'Laptop',
  DESKTOP_DEVICE: 'Desktop',
  GAME_SYSTEM: 'Game System',
  TV_DEVICE: 'TV',
  OTHER_DEVICE: 'Other'
};
export const ROUTES = [
  { title: 'Home', href: '/' },
  { title: 'Upcoming Events', href: '/events/upcoming' },
  { title: 'Past Events', href: '/events/past' },
  { title: 'Points Contest', href: '/contest' },
  { title: 'Log Out', href: '/logout' },
  { title: 'Admin', href: '/admin', isAdmin: true }
];

// Websocket message types
export const ADDED_DEVICES_TO_MATCH = 'added-devices-to-match';
export const GAME_FINISHED = 'game-finished';
export const GAME_STARTED = 'game-started';
export const MATCH_FINISHED = 'match-finished';
export const MATCH_STARTED = 'match-started';
export const SCORE_UPDATE = 'score-update';
export const USER_UPDATED = 'user-updated';

export const SITE_TITLE = 'Home Run Challenge';
