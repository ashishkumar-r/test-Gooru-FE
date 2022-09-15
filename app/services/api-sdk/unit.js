import Ember from 'ember';
import StoreMixin from '../../mixins/store';
import UnitSerializer from 'gooru-web/serializers/content/unit';
import UnitAdapter from 'gooru-web/adapters/content/unit';

/**
 * Unit Service
 *
 * Service responsible for performing CRUD operations on a unit model
 *
 * @typedef {Object} UnitService
 * @augments Ember/Service
 */
export default Ember.Service.extend(StoreMixin, {
  // -------------------------------------------------------------------------
  // Events

  init: function() {
    this._super(...arguments);
    this.set(
      'serializer',
      UnitSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'adapter',
      UnitAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UnitSerializer} serializer
   */
  serializer: null,

  /**
   * @property {UnitAdapter} adapter
   */
  adapter: null,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Create a unit for a course
   * @param {String} courseId - ID of the course the unit belongs to
   * @param {Content/Unit} unit - Unit model
   * @returns {Promise|String} returns the unit model with the newly assigned ID
   */
  createUnit: function(courseId, unit) {
    var unitData = this.get('serializer').serializeCreateUnit(unit);

    return this.get('adapter')
      .createUnit({
        courseId: courseId,
        unit: unitData
      })
      .then(function(unitId) {
        unit.set('id', unitId);
        return unit;
      })
      .catch(function(error) {
        return error;
      });
  },

  /**
   * Update existing unit
   * @param {String} courseId - ID of the course the unit belongs to
   * @param {Content/Unit} unit - Unit model
   * @returns {Promise|String} returns the unit model
   */
  updateUnit: function(courseId, unit) {
    var unitData = this.get('serializer').serializeUpdateUnit(unit);

    return this.get('adapter')
      .updateUnit({
        unitId: unit.get('id'),
        courseId: courseId,
        unit: unitData
      })
      .then(function() {
        return unit;
      })
      .catch(function(error) {
        return error;
      });
  },

  /**
   * Returns a unit by id
   * @param {string} courseId - course the unit belongs to
   * @param {string} unitId - unit ID to search for
   * @returns {Promise|Content/Unit}
   */
  fetchById: function(courseId, unitId) {
    return this.get('adapter')
      .getUnitById({
        courseId: courseId,
        unitId: unitId
      })
      .then(
        function(unitData) {
          return this.get('serializer').normalizeUnit(unitData);
        }.bind(this)
      )
      .catch(function(error) {
        return error;
      });
  },

  /**
   * Delete unit
   *
   * @param {string} courseId - course the unit belongs to
   * @param unitId The Unit id to delete
   * @returns {Promise}
   */
  deleteUnit: function(courseId, unitId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .deleteUnit({ courseId, unitId })
        .then(resolve, reject);
    });
  },

  /**
   * Copies a unit by id
   * @param {string} unitId
   * @returns {Ember.RSVP.Promise}
   */
  copyUnit: function(courseId, unitId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .copyUnit({
          courseId,
          unitId
        })
        .then(function(responseData, textStatus, request) {
          resolve(request.getResponseHeader('location'));
        }, reject);
    });
  },

  /**
   * Reorder unit lessons
   *
   * @param courseId the id of the Course
   * @param unitId the id of the Unit to be updated
   * @param {string[]} lessonIds
   * @returns {Promise}
   */
  reorderUnit: function(courseId, unitId, lessonIds) {
    const service = this;
    let serializedData = service
      .get('serializer')
      .serializeReorderUnit(lessonIds);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .reorderUnit(courseId, unitId, serializedData)
        .then(resolve, reject);
    });
  }
});
