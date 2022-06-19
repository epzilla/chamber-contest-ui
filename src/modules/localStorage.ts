/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export default {
  prefix: 'pong-db',

  get: function (key) {
    if (typeof window !== 'undefined') {
      const self = this;
      const prefixedKey = self.prefix.concat('-', key);
      if (localStorage && localStorage.getItem) {
        try {
          return JSON.parse(localStorage.getItem(prefixedKey));
        } catch (e) {
          return;
        }
      }
    }
  },

  set: function (key, val) {
    if (typeof window !== 'undefined') {
      const self = this;
      const prefixedKey = self.prefix.concat('-', key);
      const value = JSON.stringify(val);
      if (localStorage && localStorage.setItem) {
        try {
          localStorage.setItem(prefixedKey, value);
          return value;
        } catch (e) {
          return value;
        }
      }
    }
  },

  delete: function (key) {
    if (typeof window !== 'undefined') {
      const self = this;
      const prefixedKey = self.prefix.concat('-', key);
      if (localStorage && localStorage.removeItem) {
        try {
          localStorage.removeItem(prefixedKey);
        } catch (e) {
          return;
        }
      }
    }
  },

  deleteAll: function () {
    if (typeof window !== 'undefined') {
      const self = this;
      if (localStorage && localStorage.removeItem) {
        try {
          const keys = Object.keys(localStorage).filter(
            k => k.indexOf(self.prefix) !== -1
          );
          keys.forEach(k => {
            localStorage.removeItem(k);
          });
        } catch (e) {
          return;
        }
      }
    }
  }
};
