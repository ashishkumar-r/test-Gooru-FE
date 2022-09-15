import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['routesuggestion-coursemap'],
  actions: {
    routeAction: function(actiontype) {
      this.attrs.routeSuggestAction(actiontype);
    },
    selectUnit: function() {
      //ToDo: Add impl on player
    },
    /**
     * Trigger the 'onLocationUpdate' event handler
     *
     * @function actions:updateLocation
     * @param {string} newLocation - String of the form 'unitId[+lessonId[+resourceId]]'
     */
    updateLocation: function(newLocation) {
      if (this.get('onLocationUpdate')) {
        this.get('onLocationUpdate')(newLocation);
      }
    }
  },

  /**
   * @property {isEnablePlayer}
   * Property to show/hide player icon in suggestion coursemap
   */
  isEnablePlayer: true,

  taxonomyList: [],

  /**
   * Find user location in route0
   * if present then pass that route0location to course+unit+lesson+c for selection
   */
  isLocationInRoute0: Ember.computed('userLocation', {
    get() {
      const component = this;
      if (component.userLocation && component.userLocation !== '') {
        let parslocationarr = component.userLocation.split('+');
        component.route0.milestones.map(milestone => {
          return milestone.units.find(
            unit => unit.unitId === parslocationarr[0]
          );
        });
      } else {
        // can no location be treated as route0 init ?
      }
    }
  })
});
