import Ember from 'ember';

/**
 * Peers model
 * typedef {Object} Peers
 */
const Peers = Ember.Object.extend({
  /**
   * @property {String} id - The unit|lesson|collection ID
   */
  id: null,

  /**
   * @property {Number} peerCount - The number of peers (members) in the unit|lesson|collection
   */
  peerCount: 0,

  /**
   * @property {String[]} peerIds - A list of peer IDs (member IDs) in the unit|lesson|collection
   */
  peerIds: []
});

export default Peers;
