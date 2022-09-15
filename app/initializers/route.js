import Ember from 'ember';
import Env from '../config/environment';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

/**
 * Initialize Routes funtion
 */
export function initialize(app) {
  var historyCache = Ember.Object.extend({
    /**
     * @property {*} the last route
     */
    lastRoute: Ember.Object.create({
      url: null,
      name: null
    })
  });

  Ember.Route.reopen({
    /**
     * @property {HelpService}
     */
    helpService: Ember.inject.service('api-sdk/help'),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    /**
     * @property {Service} I18N service
     */
    i18n: Ember.inject.service(),

    /**
     * This event handlers sets an specific class to the body everytime a route is activated
     */
    startTime: null,
    endTime: null,

    /**
     * device_language_key
     */
    device_language_key: 'deviceLanguage',

    addRouteSpecificClass: function() {
      this.closeNoteToolOnRoute();
      const route = this;
      const currentRouteName = route.routeName;
      const currentPageIdentifier = currentRouteName.replace(/\./g, '_');
      let helpInfoDetail = this.get('helpService').getHelpInfo();
      if (currentRouteName !== 'logout') {
        if (helpInfoDetail === null) {
          this.get('helpService').setHelpInfo();
        } else {
          let helpInfo = JSON.parse(helpInfoDetail);
          helpInfo.map(item => {
            if (currentPageIdentifier === item.pageIdentifier.trim()) {
              route.showHelpIcon(item);
            }
          });
        }
      }
      this.set('startTime', moment().format('hh:mm'));
      const rootElement = Ember.$(Env.rootElement);
      rootElement.addClass(currentRouteName.replace(/\./g, '_'));
    }.on('activate'),

    /**
     * This event handlers removes an specific class to the body everytime a route is activated
     */
    removeRouteSpecificClass: function() {
      const route = this;
      const currentRouteName = route.routeName;
      const rootElement = Ember.$(Env.rootElement);
      rootElement.removeClass(currentRouteName.replace(/\./g, '_'));
      this.set('endTime', moment().format('hh:mm'));
      // Trigger parse event
      const context = {
        pageName: currentRouteName,
        startTime: this.get('startTime'),
        endTime: this.get('endTime')
      };
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.PAGE_VIEW,
        context
      );
    }.on('deactivate'),

    /**
     * When leaving a route this handler save the previous route so it can be accessed from history
     */
    saveLastRoute: function() {
      const route = this;
      const currentRouteName = route.routeName;
      const currentRouteUrl = route.router.get('url');

      const lastRoute = this.get('history.lastRoute');

      const savedRouteUrl = lastRoute.get('url');
      const parentRouteIdx =
        savedRouteUrl && savedRouteUrl.indexOf(currentRouteUrl);

      if (
        !currentRouteName.match(/\.loading/) &&
        (!savedRouteUrl || parentRouteIdx === -1)
      ) {
        // On deactivate, save the "child-most" route
        // For example: on deactive save the route "search.collection", but "search" (the parent route)
        // will not be saved
        lastRoute.set('name', currentRouteName);
        lastRoute.set('url', currentRouteUrl);
        this.get('history').set('lastRoute', lastRoute);
      }
    }.on('deactivate'),

    /**
     * Resetting the scroll to the top of the page when browsing to a new page
     */
    restoreScroll: function() {
      window.scrollTo(0, 0);
    }.on('activate'),

    getLocalStorage: function() {
      return window.localStorage;
    },

    showHelpIcon(helpInfoDetail) {
      const route = this;
      let deviceLanguage = route
        .getLocalStorage()
        .getItem(route.device_language_key);
      helpInfoDetail.uiElementIdentifiers.map(identifierData => {
        Ember.run.scheduleOnce('afterRender', this, function() {
          Ember.run.later(() => {
            if ($('body').hasClass(`${helpInfoDetail.pageIdentifier.trim()}`)) {
              $(`${identifierData.identifier}`)
                .closest(`${identifierData.identifier}`)
                .css('display', 'inline-flex');
              if (
                identifierData.identifier.includes('.new-version.teacher') ||
                identifierData.identifier.includes('.new-version.student')
              ) {
                var isExists = document.querySelector(
                  `${identifierData.identifier} .showHelpIcon`
                );
                if (isExists === null) {
                  let whatsNew = this.get('i18n').t('whats-new');
                  Ember.$(`${identifierData.identifier}`).append(
                    `<div class="showHelpIcon" id=${identifierData.id} data-toggle="tooltip" title="${identifierData.title}"><span class="whats-new">${whatsNew}</span></div>`
                  );
                }
              } else {
                Ember.$(`${identifierData.identifier}`).append(
                  `<div class="showHelpIcon" id=${identifierData.id} data-toggle="tooltip" title="${identifierData.title}"><span class="material-icons">help</span></div>`
                );
              }
              $('.showHelpIcon').click(function(event) {
                route
                  .get('parseEventService')
                  .postParseEvent(PARSE_EVENTS.CLICK_STUDY_HOME_WHATS_NEW);
                route
                  .get('helpService')
                  .getHelpInfoDescription(
                    event.currentTarget.id,
                    deviceLanguage
                  )
                  .then(response => {
                    $('body').addClass('gruHelpPullup');
                    $('.helpPullUp').css('display', 'block');
                    route
                      .controllerFor('application')
                      .showhelpPullUp(identifierData, response);
                  });
              });
            }
          }, 3000);
        });
      });
    },

    closeNoteToolOnRoute() {
      $('#note-tool-div').hide();
    }
  });

  // History cache is available to all routes
  app.register('history:main', historyCache);
  app.inject('route', 'history', 'history:main');
}

export default {
  name: 'route',
  after: 'gooru-configuration',
  initialize: initialize
};
