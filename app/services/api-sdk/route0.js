import Ember from 'ember';
import Route0Serializer from 'gooru-web/serializers/route0';
import Route0Adapter from 'gooru-web/adapters/route0';
import CourseMapSerializer from 'gooru-web/serializers/map/course-map';

export default Ember.Service.extend({
  session: Ember.inject.service(),

  store: Ember.inject.service(),

  route0Serializer: null,

  route0Adapter: null,

  route0: null,

  courseMapSerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'route0Serializer',
      Route0Serializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'route0Adapter',
      Route0Adapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'courseMapSerializer',
      CourseMapSerializer.create(Ember.getOwner(this).ownerInjection())
    );

    this.set('route0', []);
  },

  /**
   * Returns the local storage
   * @returns {Storage}
   */
  getLocalStorage: function() {
    return window.localStorage;
  },

  addRoute0: function(route0model, filter) {
    const service = this;
    let localstore = service.getLocalStorage();
    if (this.route0) {
      localstore.setItem(
        service.generateKey(filter),
        JSON.stringify(route0model)
      );
    }
  },

  getRoute0: function(filter) {
    const service = this;
    const storedResponse = service
      .getLocalStorage()
      .getItem(this.generateKey(filter));
    return JSON.parse(storedResponse);
  },

  generateKey: function(filter) {
    const userId = this.get('session.userId');
    return `U_${userId}_CL_${filter.classId}_CO_${filter.courseId}`;
  },

  fetchInClass: function(filter) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('route0Adapter')
        .fetchInClass({
          body: filter
        })
        .then(
          function(responseData) {
            responseData = service
              .get('route0Serializer')
              .normalizeFetch(responseData);
            resolve(responseData);
            service.addRoute0(responseData, filter);
          },
          function(error) {
            const status = error.status;
            if (status === 404) {
              resolve({
                status: '404'
              });
            } else {
              reject(error);
            }
          }
        );
    });
  },

  /**
   * @function fetchInClassByTeacher
   * Method to fetch route0 contents for a student
   */
  fetchInClassByTeacher(filters) {
    const service = this;
    const route0Adapter = service.get('route0Adapter');
    const route0Serializer = service.get('route0Serializer');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let route0Promise = route0Adapter.fetchInClassByTeacher(filters);
      route0Promise.then(
        function(route0Data) {
          resolve(route0Serializer.normalizeFetch(route0Data));
        },
        function(error) {
          const status = error.status;
          if (status === 404) {
            resolve({
              status: '404'
            });
          } else {
            reject(error);
          }
        }
      );
    });
  },

  updateRouteAction: function(action) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedFilterData = service
        .get('route0Serializer')
        .updateRouteAction(action);
      service
        .get('route0Adapter')
        .updateRouteAction({
          body: serializedFilterData
        })
        .then(
          function(responseData) {
            resolve(responseData);
          },
          function(error) {
            const status = error.status;
            if (status === 404) {
              resolve({
                status: '200'
              });
            } else {
              reject(error);
            }
          }
        );
    });
  },

  fetchAlternatePaths: function(params, userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve) {
      service
        .get('route0Adapter')
        .fetchAlternatePaths(params, userId)
        .then(response => {
          const suggestedPaths = service
            .get('courseMapSerializer')
            .normalizeAlternatePathContent(response.alternate_paths);
          resolve(suggestedPaths);
        });
    });
  }
});
