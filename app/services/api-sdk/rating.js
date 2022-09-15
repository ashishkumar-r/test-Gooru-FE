import Ember from 'ember';
import StoreMixin from '../../mixins/store';

export default Ember.Service.extend(StoreMixin, {
  /**
   * Creates or updates the rating score associated to a Resource.
   * @param resourceId is the resource Id which the rate is associated with.
   * @param score is the rate score that will be applied to the resource.
   * @returns {*|Ember.RSVP.Promise}
   */
  rateResource: function(resourceId, score) {
    var model = this.get('store').createRecord('rating/rating', {
      target: 'content',
      type: 'star',
      score: score,
      associatedId: resourceId
    });
    return model.save();
  },

  /**
   * Returns the rating score for the specified resource
   * @param resourceId is the resource Id with the rate
   * @returns {Promise.<T>}
   */
  findRatingForResource: function(resourceId) {
    var service = this;
    return service
      .get('store')
      .findRecord('rating/rating', resourceId)
      .then(function(ratingRecord) {
        // Removes the resource record from the store to force the reload from the API endpoint
        service.get('store').unloadRecord(ratingRecord);
        return ratingRecord;
      });
  }
});
