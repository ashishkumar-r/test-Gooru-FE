import Ember from 'ember';

export default Ember.Component.extend({
  //---------------------------------------------------------------
  // Attributes

  classNames: ['pull-up', 'struggling-competency-other-grade-level'],

  //-------------------------------------------------------------
  // Property

  /**
   * @property {Object} otherGradeCompetency
   * property hold other grade domain list
   */
  otherGradeCompetency: null,

  /**
   * @property {Object} gradeDomainIndex
   * property hold other grade index
   */
  gradeDomainIndex: null,

  /**
   * Maintains the value of popover position
   * @type {String}
   */
  tagPopoverDefaultPosition: 'bottom',

  //-------------------------------------------------------------
  // Actions

  actions: {
    // Action trigger when click grade accordion
    onToggleGrade(gradeIndex) {
      this.$(`.sc-other-grade-panel-accordian-${gradeIndex}`).slideToggle(500);
    },

    // Action trigger when click domain inside grade
    toggleDomain(gradeIndex, domainIndex) {
      this.$(
        `.sc-other-grade-domain-accordion-${gradeIndex}-${domainIndex}`
      ).slideToggle(500);
    },

    // Action trigger when click close
    onClosePullUp() {
      let component = this;
      component.$().slideUp({
        complete: function() {
          component.sendAction('closePullUp');
        }
      });
    },

    // Action trigger when click competency inside domain
    onSelectCompetency(competency, domain) {
      let component = this;
      competency.set('domainName', domain.get('domainName'));
      component.sendAction('selectCompetency', competency);
    }
  },

  //------------------------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.openPullUp();
    this.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    this.setupTooltip();
  },

  //---------------------------------------------------------------------
  // Method

  openPullUp() {
    let component = this;
    component.$().slideDown();
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
          $(
            '.struggling-competency-other-grade-level > .content.list-open'
          ).click();
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
