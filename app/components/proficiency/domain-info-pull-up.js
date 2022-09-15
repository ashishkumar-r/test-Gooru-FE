import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['domain-info-pull-up'],

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    component.openPullUp();
    this.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    this.setupTooltip();
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
          component.sendAction('onClosePullup', component.get('domain'));
          component.set('showPullUp', false);
        }
      );
    },
    /**
     * Action when click on competency title
     */
    onInspectCompetency(selectedCompetency) {
      const component = this;
      selectedCompetency = Ember.Object.create(selectedCompetency);
      let competencies = component.get('competencies');
      selectedCompetency.set('domainName', component.get('domain.domainName'));
      selectedCompetency.set('domainCode', component.get('domain.domainCode'));
      component.sendAction(
        'onSelectCompetency',
        selectedCompetency,
        competencies
      );
    },

    onSelectTopic(topic) {
      this.sendAction('onSelectTopic', topic);
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
          $('.domain-info-pull-up > .content.list-open').click();
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
