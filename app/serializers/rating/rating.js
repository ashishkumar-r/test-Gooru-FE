import DS from 'ember-data';
import SessionMixin from '../../mixins/session';

export default DS.JSONAPISerializer.extend(SessionMixin, {
  /**
   * Serialize the Rating record into a JSON object to be sent to the api endpoint
   * @param snapshot is the record snapshot
   * @returns {Object} the serialized object
   */
  serialize: function(snapshot) {
    var ratingJsonObj = snapshot.record.toJSON();
    var data = {
      target: { value: ratingJsonObj.target },
      type: { value: ratingJsonObj.type },
      score: ratingJsonObj.score
    };

    if (ratingJsonObj.target === 'user') {
      data.assocUserUid = ratingJsonObj.associatedId;
    } else {
      data.assocGooruOid = ratingJsonObj.associatedId;
    }

    return data;
  },

  /**
   * Normalize the response for the create record request (POST)
   * @param store Ember Data Store
   * @param primaryModelClass
   * @param payload the payload returned by the endpoint
   * @returns {Rating} return the Rating Model using the JSONAPI standard
   */
  normalizeCreateRecordResponse: function(store, primaryModelClass, payload) {
    var ratingModel = {
      data: {
        id: payload.gooruOid,
        type: 'rating/rating',
        attributes: {
          target: payload.target.value,
          type: payload.type.value,
          score: payload.ratings.average,
          associatedId:
            payload.target.value === 'user'
              ? payload.assocUserUid
              : payload.assocGooruOid
        }
      }
    };
    store.push(ratingModel);
    return ratingModel;
  },

  /**
   * Normalize the response for the find record request (GET)
   * @param store Ember Data Store
   * @param primaryModelClass
   * @param payload the payload returned by the endpoint
   * @param id the record id
   * @returns {Rating} return the Rating Model using the JSONAPI standard
   */
  normalizeFindRecordResponse: function(store, primaryModelClass, payload, id) {
    var ratingScore = 0;
    var sessionUserId = this.get('session.userId');
    // TODO: This is a very expensive solution. We should have an endpoint that returns only one record for the
    // resource and the user that has rated it
    var ratingPayload = payload.searchResults.filterBy(
      'creator.gooruUId',
      sessionUserId
    );
    if (ratingPayload.length > 0) {
      ratingScore = ratingPayload[0].score;
    }

    return {
      data: {
        id: id,
        type: 'rating/rating',
        attributes: {
          score: ratingScore
        }
      }
    };
  }
});
