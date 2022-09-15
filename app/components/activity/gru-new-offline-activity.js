import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['activity', 'gru-new-offline-activity'],

  lookupService: Ember.inject.service('api-sdk/lookup'),

  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @requires service:api-sdk/class-activity
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    component.openPullUp();
    component.fetchAudiences();
    component.set('forMonth', moment().format('MM'));
    component.set('forYear', moment().format('YYYY'));
    component.$('.activity-title').focus();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when close pullup
    closePullUp() {
      const component = this;
      component.closePullUp();
    },

    //Action triggered when select a date from datepicker
    onSelectDate(selectedDate) {
      const component = this;
      component.set('activityDate', selectedDate);
      component.set('unscheduledMonth', null);
      component.set('activityScheduled', selectedDate);
    },

    //Action triggered when select audience card
    onSelectAudience(audience) {
      const component = this;
      let selectedAudiences = component.get('selectedAudiences');
      let selectedAudienceIndex = selectedAudiences.indexOf(audience);
      if (selectedAudienceIndex < 0) {
        audience.set('active', true);
        selectedAudiences.push(audience);
      } else {
        audience.set('active', false);
        selectedAudiences[selectedAudienceIndex] = audience;
        selectedAudiences.splice(selectedAudienceIndex, 1);
      }
      component.set('selectedAudiences', selectedAudiences);
    },

    //Action triggered when create activity
    onCreateActivity() {
      const component = this;
      let requestBody = component.getDataParams();
      component
        .get('collectionService')
        .createExternalCollection(requestBody)
        .then(function(externalCollection) {
          let contentId = externalCollection.id;
          let classId = component.get('classId');
          let activityDate = component.get('activityDate');
          let scheduledMonth = activityDate
            ? null
            : component.get('unscheduledMonth.monthNumber');
          let scheduledYear = activityDate
            ? null
            : component.get('unscheduledMonth.monthYear');
          component
            .addActivity(
              classId,
              contentId,
              activityDate,
              scheduledMonth,
              scheduledYear
            )
            .then(function(activityId) {
              let contentType = 'collection-external';
              externalCollection.set('collectionType', contentType);
              externalCollection.set('format', contentType);
              let activityData = Ember.Object.create({
                collection: Ember.Object.create(externalCollection),
                id: activityId,
                added_date: activityDate,
                activityDate: activityDate,
                usersCount: -1,
                isActive: false,
                forMonth: parseInt(scheduledMonth),
                forYear: parseInt(scheduledYear)
              });
              component.sendAction(
                'onAddExternalCollectionToDCA',
                activityData,
                activityDate,
                scheduledMonth,
                scheduledYear
              );
              component.closePullUp();
            });
        });
    },

    //Action triggered when toggle taxonomy picker
    onToggleTaxonomyPicker() {
      const component = this;
      const taxonomyPickerContainer = component.$('.taxonomy-picker-container');
      component.$(taxonomyPickerContainer).slideDown(1000, function() {
        if (!component.get('selectedCompetencies.length')) {
          component.set('course', null);
          component.set('domain', null);
        }
        component.set('isShowTaxonomyPicker', true);
      });
    },

    //Action triggered when submit selected competencies
    onSubmitCompetencies(selectedCompetencies, course, domain) {
      const component = this;
      component.set('selectedCompetencies', selectedCompetencies);
      component.set('course', course);
      component.set('domain', domain);
      component.set('isShowTaxonomyPicker', false);
    },

    //Action triggered when close taxonomy picker modal
    onCloseTaxonomyPicker() {
      const component = this;
      component.set('isShowTaxonomyPicker', false);
    },

    //Action triggered when select unscheduled month
    onSelectMonth(month) {
      const component = this;
      component.set('unscheduledMonth', month);
      component.set('activityScheduled', month.monthName);
      component.set('activityDate', null);
    },

    //Action triggered when close create activity screen
    onCloseCreateActivity() {
      const component = this;
      component.closePullUp();
    },

    //Action triggered when remove tag
    onRemoveSelectedTag(tag) {
      const component = this;
      component.get('selectedCompetencies').removeObject(tag.get('data'));
      component.get('visibleTaxonomyTags').removeObject(tag);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} isShowPullUp
   */
  isShowPullUp: false,
  /**
   * @property {Boolean} isClose
   */
  isClose: false,

  /**
   * @property {Boolean} isShowTaxonomyPicker
   */
  isShowTaxonomyPicker: false,

  /**
   * @property {String} activityTitle
   */
  activityTitle: null,

  /**
   * @property {String} activityDescription
   */
  activityDescription: null,

  /**
   * @property {Array} selectedAudiences
   */
  selectedAudiences: Ember.A([]),

  /**
   * @property {Date} activityDate
   */
  activityDate: moment().format('YYYY-MM-DD'),

  /**
   * @property {Boolean} isShowActivityDatepicker
   */
  isShowActivityDatepicker: true,

  /**
   * @property {Array} selectedCompetencies
   */
  selectedCompetencies: Ember.A([]),

  /**
   * @property {String} unscheduledMonth
   */
  unscheduledMonth: null,

  /**
   * @property {String} activityScheduled
   */
  activityScheduled: Ember.computed('activityDate', function() {
    const component = this;
    return component.get('activityDate');
  }),

  /**
   * It Maintains the state of month need to display or not.
   * @type {Boolean}
   */
  showMonths: true,

  /**
   * It maintains number of months to show or not
   * @type {Number}
   */
  numberOfMonthsToShow: 3,

  /**
   * Maintains the value which of month activities displaying
   * @type {Integer}
   */
  forMonth: Ember.computed(function() {
    return moment().format('MM');
  }),

  /**
   * Maintains the value which of year activities displaying
   * @type {Integer}
   */
  forYear: Ember.computed(function() {
    return moment().format('YYYY');
  }),

  /**
   * Maintains  the value of first date of month
   * @return {String}
   */
  forFirstDateOfMonth: Ember.computed('forMonth', 'forYear', function() {
    let forMonth = this.get('forMonth');
    let forYear = this.get('forYear');
    let date = `${forYear}-${forMonth}-01`;
    return moment(date).format('YYYY-MM-DD');
  }),

  /**
   * It maintains list of months to be display for unschedule contents
   * @return {Array}
   */
  months: Ember.computed('forFirstDateOfMonth', function() {
    let component = this;
    let showMonths = component.get('showMonths');
    let monthsList = Ember.A([]);
    let forFirstDateOfMonth = component.get('forFirstDateOfMonth');
    let monthAndYearOfCurrentDate = moment().format('YYYY-MM');
    let firtDateOfCurrentMonth = moment(`${monthAndYearOfCurrentDate}-01`);
    if (showMonths && forFirstDateOfMonth) {
      let numberOfMonthsToShow = component.get('numberOfMonthsToShow');
      for (let index = 0; index < numberOfMonthsToShow; index++) {
        let slectedMonth = moment(forFirstDateOfMonth).add(index, 'months');
        let monthName = moment(forFirstDateOfMonth)
          .add(index, 'months')
          .format('MMMM');
        let monthYear = moment(forFirstDateOfMonth)
          .add(index, 'months')
          .format('YYYY');
        let monthNumber = moment(forFirstDateOfMonth)
          .add(index, 'months')
          .format('MM');
        let month = Ember.Object.create({
          monthNumber,
          monthName,
          monthYear
        });
        month.set(
          'isPast',
          !slectedMonth.isSameOrAfter(firtDateOfCurrentMonth)
        );
        monthsList.pushObject(month);
      }
    }
    return monthsList;
  }),

  /**
   * @property {Boolean} isEnableCreateActivity
   */
  isEnableCreateActivity: Ember.computed('activityTitle', function() {
    const component = this;
    let activityTitle = component.get('activityTitle');
    return activityTitle !== null && activityTitle.trim() !== '';
  }),

  /**
   * @property {String} course
   * Property to hold selected course title
   */
  course: null,

  /**
   * @property {String} domain
   * Property to hold selected domain title
   */
  domain: null,

  /**
   * @property {Array} visibleTaxonomyTags
   * Properto to hold visible taxonomy tags
   */
  visibleTaxonomyTags: Ember.computed('selectedCompetencies', function() {
    const component = this;
    let selectedCompetencies = component.get('selectedCompetencies');
    let visibleTaxonomyTags = selectedCompetencies.map(taxonomyTag => {
      return Ember.Object.create({
        data: taxonomyTag,
        isActive: true,
        isReadonly: true,
        isRemovable: true
      });
    });
    return Ember.A(visibleTaxonomyTags);
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getDataParams
   * Method to create request body
   */
  getDataParams() {
    const component = this;
    let title = component.get('activityTitle');
    let description = component.get('activityDescription');
    let taxonomy = component.get('selectedCompetencies');
    let selectedAudiences = component.get('selectedAudiences');
    let audienceIds = selectedAudiences.map(audience => {
      return audience.id;
    });
    return {
      title: title.trim(),
      description:
        description && description.length ? description.trim() : null,
      audience: audienceIds,
      taxonomy
    };
  },

  /**
   * @function openPullUp
   * Method to open pullup
   */
  openPullUp() {
    let component = this;
    component.$().animate(
      {
        top: '15%'
      },
      400
    );
  },

  /**
   * @function closePullUp
   * Method to close pullup
   */
  closePullUp() {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.resetProperties();
        component.set('isShowPullUp', false);
      }
    );
  },

  /**
   * @function fetchAudiences
   * Method to fetch audiences
   */
  fetchAudiences() {
    const component = this;
    const lookupService = component.get('lookupService');
    return Ember.RSVP.hash({
      audiences: Ember.RSVP.resolve(lookupService.readAudiences())
    }).then(({ audiences }) => {
      component.set('audiences', audiences);
    });
  },

  /**
   * @function createExternalCollection
   * Method to create external collection
   */
  createExternalCollection(collectionData) {
    const component = this;
    const collectionService = component.get('collectionService');
    return Ember.RSVP.resolve(
      collectionService.createExternalCollection(collectionData)
    );
  },

  /**
   * @function addActivity
   * Method to add activity into a scheduled date/month/year
   */
  addActivity(classId, contentId, date, scheduledMonth, scheduledYear) {
    const component = this;
    const classActivityService = component.get('classActivityService');
    return Ember.RSVP.resolve(
      classActivityService.addActivityToClass(
        classId,
        contentId,
        'collection-external',
        date,
        scheduledMonth,
        scheduledYear
      )
    );
  },

  /**
   * @function resetProperties
   * Method to reset Properties
   */
  resetProperties() {
    const component = this;
    component.set('selectedCompetencies', Ember.A([]));
    component.set('selectedAudiences', Ember.A([]));
    component.set('activityTitle', null);
    component.set('activityDescription', null);
  }
});
