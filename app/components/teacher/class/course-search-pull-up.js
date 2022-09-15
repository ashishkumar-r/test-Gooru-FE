import Ember from 'ember';
import { KEY_CODES } from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['course-search-pull-up'],

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Boolean} showPullUp
   */
  showPullUp: false,

  /**
   * @property {Boolean} isMenuEnabled
   */
  isMenuEnabled: false,

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    let component = this;
    if (component.get('showPullUp')) {
      component.openPullUp();
      component.handleSearchBar();
    }
    component.handleShowMoreData();
  },
  handleShowMoreData() {
    let component = this;
    let loading = false;
    let container = Ember.$('.pull-up-body-container');
    component.$(container).scroll(function() {
      if (!loading) {
        let scrollTop = Ember.$(container).scrollTop();
        let listContainerHeight = Ember.$(container).height() + 500;
        let isScrollReachedBottom =
          scrollTop >=
          component.$(container).prop('scrollHeight') - listContainerHeight;
        if (isScrollReachedBottom) {
          loading = true;
          component.sendAction('paginateNext');
          loading = false;
        }
      }
    });
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    onPullUpClose() {
      let component = this;
      component.closePullUp();
    },

    onRemixCourse(courseId) {
      let component = this;
      component.sendAction('onRemixCourse', courseId);
    },

    onAddCourse(courseId) {
      let component = this;
      component.sendAction('onAddCourse', courseId);
    },

    onSelectCatalog(catalog) {
      let component = this;
      component.set('isLoading', true);
      component.sendAction('onSelectCatalog', catalog);
      this.toggleProperty('isMenuEnabled');
    },

    /**
     * Toggle menu list based on the recent selection of the menu.
     */
    toggleMenuList() {
      this.toggleProperty('isMenuEnabled');
    }
  },

  coursesObserver: Ember.observer('courses', function() {
    let component = this;
    let courses = component.get('courses');
    component.set('isCourseNotAvailable', courses.length <= 0);
    component.set('isLoading', false);
  }),

  //--------------------------------------------------------------------------
  // Methods

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  closePullUp() {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
      }
    );
  },

  handleSearchBar() {
    let component = this;
    component.$('#search-courses').on('keyup', function(e) {
      if (e.which === KEY_CODES.ENTER) {
        component.loadData();
      }
    });

    component.$('.search-icon .search').click(function() {
      let term = component.getSearchTerm();
      if (term.length > 0) {
        component.loadData();
      }
    });
  },

  loadData() {
    let component = this;
    let searchText = component.get('searchText');
    component.sendAction('onSearchCourse', searchText);
  }
});
