/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const WS_BASE_URL = 'wss://pong-api.herokuapp.com';
export const BASE_URL = 'http://localhost:3003/';
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
  { title: 'Points Contest', href: '/contest' }
];

// Websocket message types
export const ADDED_DEVICES_TO_MATCH = 'added-devices-to-match';
export const GAME_FINISHED = 'game-finished';
export const GAME_STARTED = 'game-started';
export const MATCH_FINISHED = 'match-finished';
export const MATCH_STARTED = 'match-started';
export const SCORE_UPDATE = 'score-update';

export const SITE_TITLE = 'Chamber Events Tracker';
