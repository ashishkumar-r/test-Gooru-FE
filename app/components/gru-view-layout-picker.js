import Ember from 'ember';
import { VIEW_LAYOUT_PICKER_OPTIONS } from '../config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

/**
 * View Layout Picker
 *
 * Component responsible for letting the user change the profile visualization
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-view-layout-picker'],

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Set a new visualization as selected and update the component appearance
     * @function actions:setLayout
     * @param {string} newLayout
     */
    setLayout: function(newLayout) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_LJ_IS_MILESTONE_GO_LIVE_VIEW
      );
      if (!newLayout.get('isActive')) {
        this.cleanup();
        this.selectLayout(newLayout);
      }
      this.sendAction('onViewLayoutChange', this.get('selectedView'));
    }
  },
  // -------------------------------------------------------------------------
  // Properties
  /**
   * List of layouts to be displayed by the component
   *
   * @constant {Array}
   */
  viewLayouts: function() {
    return this.setLayoutFilter();
  },
  /**
   * Selected view layout
   *
   * @property {string}
   */
  selectedView: null,

  // -------------------------------------------------------------------------
  // Events

  /**
   * DidInsertElement ember event
   */
  didInsertElement: function() {
    this.set('viewLayouts', this.setLayoutFilter());
    this.send(
      'setLayout',
      Ember.Object.create({
        view: VIEW_LAYOUT_PICKER_OPTIONS.THUMBNAILS,
        isActive: true,
        icon: 'view_module'
      })
    );
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * layouts to be displayed by the component
   */
  cleanup: function() {
    const component = this;
    component.get('viewLayouts').forEach(function(option) {
      option.set('isActive', false);
      component.set('selectedView', null);
    });
  },

  /**
   * set layouts to be displayed by the component
   * @return {Array}
   */
  setLayoutFilter: function() {
    return Ember.A([
      Ember.Object.create({
        view: VIEW_LAYOUT_PICKER_OPTIONS.THUMBNAILS,
        isActive: true,
        icon: 'view_module'
      }),
      Ember.Object.create({
        view: VIEW_LAYOUT_PICKER_OPTIONS.LIST,
        isActive: false,
        icon: 'view_list'
      })
    ]);
  },
  /**
   * Set a new visualization
   */
  selectLayout: function(layout) {
    layout.set('isActive', true);
    this.set('selectedView', layout.view);
  }
});
