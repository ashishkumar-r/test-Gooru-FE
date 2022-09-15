import Ember from 'ember';
import { SEARCH_FILTER_BY_CONTENT_TYPES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import InstructionalCoacheMixin from 'gooru-web/mixins/instructional-coache-mixin';

export default Ember.Component.extend(
  ConfigurationMixin,
  InstructionalCoacheMixin,
  {
    classNames: ['gru-content-search-filter'],

    // -------------------------------------------------------------------------
    // Dependencies

    /**
     * @property {Service} tenant service
     */
    tenantService: Ember.inject.service('api-sdk/tenant'),

    session: Ember.inject.service('session'),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    videConferenceService: Ember.inject.service('api-sdk/video-conference'),

    // -------------------------------------------------------------------------
    // Properties

    /**
     * @property {Array} contentTypes
     */
    contentTypes: Ember.computed(function() {
      const contentTypes = Ember.A();
      SEARCH_FILTER_BY_CONTENT_TYPES.forEach(content => {
        contentTypes.pushObject(Ember.Object.create(content));
      });
      return contentTypes.sortBy('seqId');
    }),
    isInstructionalCoache: Ember.computed(function() {
      return this.instructionalCoache();
    }),

    primaryClass: null,

    /**
     * @property {Object} activeContentType with initialized content type
     */
    activeContentType: Ember.computed(function() {
      return this.get('contentTypes').get(0);
    }),

    isShowVideoConference: Ember.computed.alias(
      'configuration.GRU_FEATURE_FLAG.isShowCAVideoConference'
    ),

    /**
     * @property {Array} selectedFilters
     */
    selectedFilters: Ember.A([]),

    searchTerms: '',

    /**
     * @property {boolean} isFilterApplied
     */
    isFilterApplied: false,
    isConferenceAllow: true,
    isMeetingPanel: false,
    activeVideoConference: false,

    // -------------------------------------------------------------------------
    // Actions
    actions: {
      // Action trigger when click content types from the default view
      onChangeContent(content) {
        if (content.format === 'assessment') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_CA_ASSESSMENT
          );
        } else if (content.format === 'collection') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_CA_COLLECTION
          );
        } else if (content.format === 'offline-activity') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_CA_OFFLINE_ACTIVITY
          );
        }

        this.set('activeContentType', content);
        this.get('onChangeContentType')(content);
        this.set('activeVideoConference', false);
        if (this.get('isMeetingPanel')) {
          this.$('.create-video-conference').slideToggle();
          this.set('isMeetingPanel', false);
          this.set('activeVideoConference', false);
        }
      },
      // Action trigger when toggle the filter icon
      onToggleFilter(container) {
        if (container === 'create-video-conference') {
          this.set('activeVideoConference', true);
        } else {
          const isVideoConference = this.get('isMeetingPanel')
            ? this.get('isMeetingPanel')
            : false;
          this.set('activeVideoConference', isVideoConference);
        }
        let controller = this;
        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CA_VIDEO_CONFERENCE);
        controller
          .get('videConferenceService')
          .fetchZoomToken()
          .then(zoomToken => {
            if (!zoomToken) {
              let token = window.localStorage.getItem(
                `user_vid_config_${this.get('session.userId')}`
              );
              if (token) {
                this.set('isConferenceAllow', false);
              } else {
                this.set('isConferenceAllow', true);
              }
            } else {
              this.set('isConferenceAllow', false);
              this.set('hasVideoConference', true);
            }
            if (container === 'create-video-conference') {
              this.set('isMeetingPanel', true);
              this.$(`.${container}`).slideToggle(function() {
                if ($(`.${container}`).is(':hidden')) {
                  controller.set('activeVideoConference', false);
                  controller.set('isMeetingPanel', false);
                }
              });
            } else {
              this.$(`.${container}`).slideToggle();
            }
          });
      },

      // Action trigger when filter applied
      onCloseFilter() {
        this.$('.content-resource-filter').slideUp();
      },

      // Action trigger when apply filter
      applyFilter(
        contentResource,
        isFilterApplied,
        additionalFilter,
        isCustomeFilter = false,
        enableCaBaseline
      ) {
        this.send('onCloseFilter');
        this.set('isFilterApplied', isFilterApplied);
        this.sendAction(
          'applyFilter',
          contentResource,
          additionalFilter,
          this.get('activeContentType'),
          isCustomeFilter,
          enableCaBaseline
        );
      },
      // Action trigger when click on search button
      onSearchContent(searchTerms) {
        this.set('searchTerms', searchTerms.trim());
        this.get('onSearch')(searchTerms.trim());
        const context = {
          classId: this.get('primaryClass').id,
          courseId: this.get('primaryClass').courseId,
          searchText: searchTerms,
          additionalText: {
            title: this.get('primaryClass').title,
            grade: this.get('primaryClass').grade,
            startDate: this.get('primaryClass').startDate
          }
        };
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.SEARCH_CA,
          context
        );
      },
      onRefreshData(meetingInfo) {
        let controller = this;
        const activity = {
          class_id: meetingInfo.class_id,
          dca_added_date: meetingInfo.dca_added_date,
          end_date: meetingInfo.end_date,
          title: meetingInfo.title,
          for_month: meetingInfo.for_month,
          for_year: meetingInfo.for_year
        };
        controller
          .get('videConferenceService')
          .createConferenceCaCard(activity)
          .then(() => {
            this.$('.create-video-conference').slideToggle();
            this.set('isMeetingPanel', false);
            controller.set('activeVideoConference', false);
            controller.sendAction('onRefreshData', meetingInfo);
          });
      },
      onDeny() {
        this.set('isConferenceAllow', false);
        this.set('hasVideoConference', false);
        this.set('activeVideoConference', false);
        this.$('.create-video-conference').slideToggle();
      },
      onAllow() {
        this.set('isConferenceAllow', false);
        this.set('hasVideoConference', true);
      }
    },

    didRender() {
      const component = this;
      component.$('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover'
      });
    },

    didInsertElement() {
      let component = this;
      const contentTypes = component.get('contentTypes');
      this.defaultSelections(contentTypes);
    },

    defaultSelections(contentTypes) {
      let component = this;
      component
        .get('tenantService')
        .getActiveTenantSetting()
        .then(tenantSettings => {
          const defaultSelection = contentTypes.find(
            item =>
              item.format ===
              tenantSettings.default_ca_collection_type_selection
          );
          if (defaultSelection) {
            component.send('onChangeContent', defaultSelection);
          }
        });
    }
  }
);
