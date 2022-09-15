import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['backdrop-pull-ups', 'teacher-ca-student-list-pull-up'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/class-activity
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * class activity details
   * @type {Object}
   */
  classActivity: null,

  /**
   * Propery to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * Maintains the state of data loading
   * @type {Boolean}
   */
  isLoading: false,

  /**
   * Maintains the list of class members
   * @type {Array}
   */
  members: Ember.A([]),

  /**
   * Class Id of the class
   * @type {String}
   */
  classId: null,

  /**
   * contentId of the class activity
   * @type {String}
   */
  contentId: Ember.computed.alias('classActivity.id'),

  /**
   * Number of users for this class content activity
   * @type {Number}
   */
  usersCount: Ember.computed.alias('classActivity.usersCount'),

  /**
   * Search student text
   * @type {String}
   */
  studentSearchText: null,

  /**
   * List of students present in class.
   * @type {Array}
   */
  students: Ember.A([]),

  isShowButton: true,

  /**
   * students search results
   * @type {Array}
   */
  studentSearchResults: Ember.computed(
    'students.[]',
    'studentSearchText',
    function() {
      let component = this;
      let studentSearchText = component.get('studentSearchText');
      if (!studentSearchText) {
        const orderStudents = component
          .get('students')
          .sortBy('lastName')
          .reverse();
        return orderStudents.sortBy('isSelected').reverse();
      }
      let regexp = new RegExp(studentSearchText, 'gi');
      return component.get('students').filter(function(student) {
        return student.get('name').match(regexp);
      });
    }
  ),

  // -------------------------------------------------------------------------
  // actions

  actions: {
    /**
     * Action triggered when the user close the pull up.
     **/
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    /**
     * De-select user from class content activity
     * @param  {Object} student
     */
    onDeSelectUser(student) {
      student.set('isSelected', false);
      this.updateUserCount();
    },

    /**
     * Select user for class content activity
     * @param  {Object} student
     */
    onSelectUser(student) {
      student.set('isSelected', true);
      this.updateUserCount();
    },

    /**
     * save selected users to class activity content
     */
    saveUsersToClassActivityContent() {
      this.saveUsersToCA();
    },

    /**
     * Action triggered when de select all the students
     */
    onDeSelect() {
      let students = this.get('students');
      students.forEach(student => {
        student.set('isSelected', false);
      });
      this.updateUserCount();
    },

    /**
     * Action triggered when select all the students
     */
    onSelectAll() {
      let students = this.get('students');
      students.forEach(student => {
        student.set('isSelected', true);
      });
      this.updateUserCount();
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    this.handleAppContainerScroll();
  },

  didDestroyElement() {
    this.handleAppContainerScroll();
  },

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    this.openPullUp();
    if (this.get('contentId')) {
      this.loadData();
    }
    this.handleSearchBar();
  },

  //--------------------------------------------------------------------------
  // Methods

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().animate(
      {
        bottom: '0'
      },
      400
    );
  },

  /**
   * Function to animate the  pullup from top to bottom
   */
  closePullUp(closeAll) {
    let component = this;
    component.$().animate(
      {
        bottom: '-100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (closeAll) {
          component.sendAction('onClosePullUp', true);
        }
      }
    );
  },

  handleAppContainerScroll() {
    let activePullUpCount = Ember.$(document.body).find('.backdrop-pull-ups')
      .length;
    if (activePullUpCount > 0) {
      Ember.$(document.body).addClass('no-vertical-scroll');
    } else if (activePullUpCount === 0) {
      Ember.$(document.body).removeClass('no-vertical-scroll');
    }
  },

  loadData() {
    let component = this;
    let classId = component.get('classId');
    let contentId = component.get('contentId');
    component
      .get('classActivityService')
      .fetchUsersForClassActivity(classId, contentId)
      .then(function(usersClassActivity) {
        if (!component.isDestroyed) {
          component.parseClassMembers(usersClassActivity);
        }
      });
  },

  parseClassMembers(usersClassActivity) {
    let component = this;
    let students = Ember.A([]);
    let members = component.get('members').filterBy('isActive', true);
    members.forEach(member => {
      let memberId = member.get('id');
      let lastName = member.get('lastName');
      let firstName = member.get('firstName');
      let username = member.get('username');
      let student = Ember.Object.create({
        id: memberId,
        firstName: firstName,
        lastName: lastName,
        name: `${lastName}, ${firstName}`,
        avatarUrl: member.get('avatarUrl'),
        isShowLearnerData: member.get('isShowLearnerData'),
        username: username
      });
      let userClassActivity = usersClassActivity.findBy('id', memberId);
      if (userClassActivity) {
        student.set('isSelected', true);
      }
      students.pushObject(student);
    });
    component.set('students', students);
  },

  saveUsersToCA() {
    let component = this;
    let classId = component.get('classId');
    let contentId = component.get('contentId');
    let students = component.get('students');
    let users = students.filterBy('isSelected', true).map(student => {
      return student.get('id');
    });
    component
      .get('classActivityService')
      .addUsersToActivity(classId, contentId, users)
      .then(() => {
        component.closePullUp();
      });
  },

  updateUserCount() {
    let component = this;
    let students = component.get('students');
    let users = students.filterBy('isSelected', true).map(student => {
      return student.get('id');
    });
    if (users.length === students.length) {
      component.set('usersCount', -1);
    } else if (users.length === 0) {
      component.set('usersCount', 0);
    } else {
      component.set('usersCount', users.length);
    }
  },

  handleSearchBar() {
    let component = this;
    component.$('#student-search').on('keyup', function() {
      let studentSearchText = component.$(this).val();
      component.set('studentSearchText', studentSearchText);
    });
  }
});
