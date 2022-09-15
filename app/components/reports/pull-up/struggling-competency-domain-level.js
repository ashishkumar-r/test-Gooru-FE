import Ember from 'ember';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(tenantSettingsMixin, {
  classNames: ['pull-up', 'struggling-competency-domain-level'],

  //-------------------------------------------------------------
  // Property

  /**
   * @property {Array} gradeDomainsList
   * property hold grade domain list
   */
  gradeDomainsList: [],

  /**
   * @property {Number} gradeDomainIndex
   * property hold grade domain index
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
    // Action triggered when click domain
    toggleDomain(domainIndex) {
      this.$(`.domain-accordion-${domainIndex}`).slideToggle(500);
    },

    //Action triggered when click close
    onClosePullUp() {
      let component = this;
      component.$().slideUp({
        complete: function() {
          component.sendAction('closePullUp');
        }
      });
    },

    // Action trigger when select competency
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
          $('.struggling-competency-domain-level > .content.list-open').click();
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
