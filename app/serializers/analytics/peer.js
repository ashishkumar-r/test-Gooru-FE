import Ember from 'ember';
import PeerModel from 'gooru-web/models/analytics/peer';

/**
 * Peer's Serializer
 *
 * @typedef {Object} PeerSerializer
 */
export default Ember.Object.extend({
  /**
   * Normalize the response from Peers endpoint
   * @param payload is the endpoint response in JSON format
   * @returns {PeerModel} a peer model object
   */
  normalizePeers: function(payload) {
    const serializer = this;
    let peers = Ember.A([]);
    if (Ember.isArray(payload.content)) {
      payload.content.forEach(function(peerPayload) {
        if (peerPayload.userUId) {
          peers.push(serializer.normalizePeerIds(peerPayload, peers));
        } else {
          peers.push(serializer.normalizePeerCount(peerPayload));
        }
      });
    }
    return peers;
  },

  normalizePeerCount: function(payload) {
    return PeerModel.create({
      id: payload.unitId ? payload.unitId : payload.lessonId,
      peerCount: payload.peerCount ? payload.peerCount : 0
    });
  },

  normalizePeerIds: function(payload, peers) {
    const id = payload.collectionId
      ? payload.collectionId
      : payload.assessmentId;
    let peer = peers.findBy('id', id);
    if (peer) {
      peer.set('peerCount', peer.get('peerCount') + 1);
      peer.get('peerIds').push(payload.userUId);
    } else {
      peer = PeerModel.create({
        id: id,
        peerCount: 1,
        peerIds: Ember.A([payload.userUId])
      });
    }
    return peer;
  }
});
