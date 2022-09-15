import Ember from 'ember';

/**
 * MapContext model
 *
 * @typedef {Object} MapContext
 */
const MapContentModel = Ember.Object.extend({
  /**
   * @property {string} contentId
   */
  id: null,

  /**
   * @property {string} title
   */
  title: null,

  /**
   * @property {string} description
   */
  description: null,

  /**
   * @property {string} url
   */
  url: null,

  /**
   * @property {string} thumbnail
   */
  thumbnail: null
});

export default MapContentModel;
