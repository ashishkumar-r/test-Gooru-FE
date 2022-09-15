import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['topic-info-pull-up'],

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    component.openPullUp();
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    component.setupTooltip();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action when click on close button
     */
    closePullUp() {
      const component = this;
      component.$().animate(
        {
          top: '100%'
        },
        400,
        function() {
          component.sendAction('onCloseTopicInfoPullup');
          component.set('showPullUp', false);
          component.set('topic.isActive', false);
          component.set('topic', null);
        }
      );
    },
    /**
     * Action when click on competency title
     */
    onInspectCompetency(selectedCompetency) {
      const component = this;

      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PROFICIENCY_CHARTS_COMPETENCIES);

      selectedCompetency = Ember.Object.create(selectedCompetency);
      let selectedDomain = component.get('selectedDomain');
      let proficiencyChartData = component.get('proficiencyChartData');
      let domainCompetencyList = proficiencyChartData.filterBy(
        'domainCode',
        selectedDomain.domainCode
      );
      let competencies = component.get('competencies') || domainCompetencyList;
      component.sendAction(
        'onSelectCompetency',
        selectedCompetency,
        competencies
      );
    },

    onSelectDatamodel(dataModel) {
      this.set('isShowCompetencies', dataModel === 'proficiency');
    }
  },

  isShowCompetencies: true,

  /**
   * Maintains the value of popover position
   * @type {String}
   */
  tagPopoverDefaultPosition: 'bottom',

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    const component = this;
    component.$().animate(
      {
        top: '0%'
      },
      400
    );
  },

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
          $('.topic-info-pull-up > .content.list-open').click();
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
