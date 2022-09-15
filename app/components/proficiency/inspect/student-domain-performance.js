import Ember from 'ember';
import { getObjectsDeepCopy } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['inspect-competency', 'student-domain-performance'],

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    $(window).on('resize', this.handleResize.bind(this));
  },

  didInsertElement() {
    this.handleResize();
  },
  filteredWeekLocal: Ember.A([]),
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    onSearchWeeklyLocal(searchWeekLocal) {
      let testing = this.get('filteredWeekLocal');
      if (!testing.length) {
        this.set(
          'filteredWeekLocal',
          getObjectsDeepCopy(this.get('studentsDomainPerformance'))
        );
      }
      let filteredStudents = getObjectsDeepCopy(
        this.get('filteredWeekLocal')
      ).filter(student => {
        // eslint-disable-next-line no-console
        searchWeekLocal = searchWeekLocal.toLowerCase();
        return (
          (student.firstName &&
            student.firstName.toLowerCase().startsWith(searchWeekLocal)) ||
          (student.lastName &&
            student.lastName.toLowerCase().startsWith(searchWeekLocal)) ||
          (student.email &&
            student.email.toLowerCase().startsWith(searchWeekLocal)) ||
          (student.username &&
            student.username.toLowerCase().startsWith(searchWeekLocal))
        );
      });
      this.set('studentsDomainPerformance', filteredStudents);
    },
    // Action triggered when click left/right arrow
    onClickArrow(direction) {
      let component = this;
      let curDeviceVW = window.screen.width;
      let mobilePotraitVW = component.get('mobilePotraitVW');
      if (curDeviceVW <= mobilePotraitVW) {
        component.mobilePotraitScroller(direction);
      } else {
        let scrollableContainer = component.$('.scrollable-container');
        let curPos = scrollableContainer.scrollLeft();
        let nextPos = direction === 'left' ? curPos - 232 : curPos + 232;
        scrollableContainer.animate(
          {
            scrollLeft: nextPos
          },
          400
        );
      }
    },

    //Action triggered when select a domain
    onSelectDomain(domain) {
      let component = this;
      component.sendAction('onSelectDomain', domain);
    },

    //Action triggered when select a student
    onSelectStudent(student) {
      let component = this;
      component.sendAction('onSelectStudent', student);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {JSON} courseCoverageCount
   */
  courseCoverageCount: Ember.Object.create({
    mastered: 0,
    'in-progress': 0,
    'not-started': 0
  }),

  /**
   * @property {Array} domainCoverageCount
   */
  domainCoverageCount: null,

  /**
   * @property {Number} totalCompetencies
   */
  totalCompetencies: 0,

  /**
   * @property {Number} mobilePotraitVW
   */
  mobilePotraitVW: 639,

  /**
   * @property {Boolean} isMobilePotraitView
   */
  isMobilePotraitView: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function mobilePotraitScroller
   * Method to handle potrait mode scroller
   */
  mobilePotraitScroller(direction) {
    let component = this;
    const $domainsPerformanceContainer = component.$(
      '.domains-performance-container'
    );
    const $domainsCoverageContainer = component.$(
      '.domains-coverage-container'
    );
    let curDeviceVW = window.screen.width;
    let curPerfPos = $domainsPerformanceContainer.scrollLeft();
    let curCoveragePos = $domainsCoverageContainer.scrollLeft();
    let scrollablePos = curDeviceVW - 142;
    let nextPerfPos =
      direction === 'left'
        ? curPerfPos - scrollablePos
        : curPerfPos + scrollablePos;
    let nextCoveragePos =
      direction === 'left'
        ? curCoveragePos - curDeviceVW
        : curCoveragePos + curDeviceVW;
    $domainsPerformanceContainer.animate(
      {
        scrollLeft: nextPerfPos
      },
      400
    );
    $domainsCoverageContainer.animate(
      {
        scrollLeft: nextCoveragePos
      },
      400
    );
  },

  /**
   * @function handleResize
   * Method to handle screen resize events
   */
  handleResize() {
    let component = this;
    let curDeviceVW = window.screen.width;
    let curDeviceVH = window.screen.height;
    let mobilePotraitVW = component.get('mobilePotraitVW');
    let domainsCoverageContainer = component.$('.domains-coverage-container');
    let domainsPerformanceContainer = component.$(
      '.domains-performance-container'
    );
    if (!component.get('isDestroyed') || component.get('isDestroying')) {
      component.set('isMobilePotraitView', curDeviceVW <= mobilePotraitVW);
    }
    let scrollableContainer = component.$('.scrollable-container');
    scrollableContainer.animate(
      {
        scrollLeft: 0
      },
      400
    );
    if (curDeviceVH - 280 < domainsPerformanceContainer.height()) {
      domainsCoverageContainer.addClass('scrollable-margin');
    } else {
      domainsCoverageContainer.removeClass('scrollable-margin');
    }
  }
});
