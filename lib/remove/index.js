/*jshint node:true*/
var stew = require('broccoli-stew');

module.exports = {
  name: 'remove',

  isDevelopingAddon: function() {
    return true;
  },

  postprocessTree: function(type, tree) {
    if (type === 'js' || type === 'template') {
      return stew.rm(tree, '*/locales/[^en]**/**');
    } else {
      return tree;
    }
  }
};
