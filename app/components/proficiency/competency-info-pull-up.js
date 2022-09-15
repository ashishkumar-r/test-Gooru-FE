import Ember from 'ember';
import { COMPETENCY_STATUS } from 'gooru-web/config/config';

export default Ember.Component.extend({
  classNames: ['competency-info-pull-up'],

  classNameBindings: [
    'isInspectCompetency:open',
    'isExpand:expand',
    'isTeacherReport:teacher-view'
  ],

  /**
   * @property {Boolean} isExpand
   */
  isExpand: false,

  /**
   * @property {String} studentId
   */
  studentId: Ember.computed('studentProfile', function() {
    return this.get('studentProfile.id') || null;
  }),

  /**
   * @property {String} competencyStatus
   */
  competencyStatus: Ember.computed('competency', function() {
    let component = this;
    let competency = component.get('competency');
    if (competency && competency.source) {
      if (
        competency.source.indexOf('ActivityStream') === 0 &&
        (competency.status === 4 || competency.status === 3)
      ) {
        return competency && COMPETENCY_STATUS[7];
      } else {
        return competency && COMPETENCY_STATUS[competency.status];
      }
    } else {
      return competency && COMPETENCY_STATUS[competency.status];
    }
  }),

  /**
   * @property {String} competencyCode
   */
  competencyCode: null,

  /**
   * Maintains the value of popover position
   * @type {String}
   */
  tagPopoverDefaultPosition: 'bottom',

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    this.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    this.setupTooltip();
  },

  actions: {
    /**
     * @function expandPullUp
     * Method to toggle expand view for mobile
     */
    expandPullUp() {
      let component = this;
      component.toggleProperty('isExpand');
    },

    closePullUp() {
      let component = this;
      component.toggleProperty('isInspectCompetency');
      component.set('isExpand', false);
      component.sendAction('onClosePullUp');
    },

    playContent(queryParams, contentId, content) {
      const component = this;
      component.sendAction('playContent', queryParams, contentId, content);
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  setupTooltip: function() {
    let component = this;
    let $anchor = this.$('.lo-content');
    let isMobile = window.matchMedia('only screen and (max-width: 768px)');
    let tagPopoverDefaultPosition = this.get('tagPopoverDefaultPosition');
    $anchor.attr('data-html', 'true');
    $anchor.popover({
      placement: tagPopoverDefaultPosition,
      content: function() {
        return component.$('.tag-tooltip').html();
      },
      trigger: 'manual',
      container: 'body'
    });

    if (isMobile.matches) {
      $anchor.on('click', function() {
        let $this = $(this);
        if (!$this.hasClass('list-open')) {
          // Close all tag tooltips by simulating a click on them
          $('.competency-info-pull-up > .content.list-open').click();
          $this.addClass('list-open').popover('show');
        } else {
          $this.removeClass('list-open').popover('hide');
        }
      });
    } else {
      $anchor.on('mouseenter', function() {
        $(this).popover('show');
      });

      $anchor.on('mouseleave', function() {
        $(this).popover('hide');
      });
    }
  }
});
