import Ember from 'ember';
import { isCompatibleVW } from 'gooru-web/utils/utils';
import { SCREEN_SIZES } from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['student-comptency-progress'],

  /**
   * @property {Object} competency
   */
  competency: null,

  /**
   * @property {Boolean}
   * Property to store given screen value is compatible
   */
  isMobileView: isCompatibleVW(SCREEN_SIZES.LARGE),

  didInsertElement() {
    this.parseCompetency();
  },

  didRender() {
    this._super(...arguments);
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  /**
   * @function parseCompetency
   * Method to calculate comptency status count and set height for div
   */
  parseCompetency() {
    let component = this;
    let competency = component.get('competency');
    let total =
      competency.inprogress + competency.notstarted + competency.completed;
    let completed =
      competency.completed === 0
        ? 0
        : Math.round((competency.completed / total) * 100);
    let inProgress =
      competency.inprogress === 0
        ? 0
        : Math.round((competency.inprogress / total) * 100);
    let notStarted =
      competency.notstarted === 0
        ? 0
        : Math.round((competency.notstarted / total) * 100);
    let size = component.get('isMobileView') ? 'width' : 'height';
    component.$('.completed').css(`${size}`, `${completed}%`);
    component.$('.in-progress').css(`${size}`, `${inProgress}%`);
    component.$('.not-started').css(`${size}`, `${notStarted}%`);
  }
});
