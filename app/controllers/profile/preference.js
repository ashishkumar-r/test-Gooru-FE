import Ember from 'ember';
import { PREFERENCE, ROLES, CLASSREPORTS } from 'gooru-web/config/config';
import visibilitySettings from 'gooru-web/mixins/visibility-settings';
import AccessibilitySettingsMixin from 'gooru-web/mixins/accessibility-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Controller.extend(
  visibilitySettings,
  AccessibilitySettingsMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies
    /**
     * taxonomy service dependency injection
     * @type {Object}
     */
    taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

    /**
     * @property {Service} Profile service
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    /**
     * @property {Ember.Service} Service to do retrieve language
     */
    lookupService: Ember.inject.service('api-sdk/lookup'),

    parentController: Ember.inject.controller('profile'),

    session: Ember.inject.service('session'),

    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    //------------------------------------------------------------------------------
    // Attributes

    /**
     * it maintains profile data
     * @type {Object}
     */
    userPreference: Ember.computed.alias('parentController.userPreference'),

    categoriesMaster: null,

    categoriesDropDown: null,

    /**
     * Toggle Options
     * @property {Ember.Array}
     */
    switchOptions: Ember.A([
      Ember.Object.create({
        label: 'common.on',
        value: true
      }),
      Ember.Object.create({
        label: 'common.off',
        value: false
      })
    ]),

    /**
     * Current selection, list of subjects and their fwks for current selected category
     */
    currentCategoriesSubjectFWKs: null,

    /**
     *  Current selection, list of frameworks for current selected subject
     */
    currentSelectedSubject: null,

    /**
     * Temp placeholder for framework selection
     */
    currentSelectedSubjectFWK: null,

    /**
     *  Temp list of current selection of categories, need to see if that is redundant with selections
     */
    addedCategories: null,

    /**
     * Maintains a list of current selection of category.subject : frameworks
     * Is tightly binded with added addedCategories any change in addedCategories should reflect here
     */
    selections: {},

    currentSelectedCategory: null,

    isEditMode: false,

    otherLanguages: null,

    viewPreference: null,

    parsedScaleSize: null,

    isGuestAccount: Ember.computed.alias('session.isGuest'),

    /**
     * @property {Boolean} isStudent
     */
    isStudent: Ember.computed.equal('session.role', ROLES.STUDENT),

    /**
     * @property {Array} sortPreferenceFilterList
     * Property holding the atc chart filter list
     */
    sortPreferenceFilterList: Ember.computed(function() {
      return PREFERENCE;
    }),
    isShowImpersonate: Ember.computed(function() {
      let impersonate;
      if (window.frameElement) {
        impersonate = window.parent.impersonate;
      }
      return impersonate;
    }),

    /**
     * @property {Array}
     */
    classReportList: Ember.computed(function() {
      return CLASSREPORTS;
    }),

    sortedByPreference: Ember.computed('userPreference', function() {
      let userPreference = this.get('userPreference');
      let selectedItem = userPreference.class_sort_preference
        ? PREFERENCE.findBy('key', userPreference.class_sort_preference)
        : null;
      return selectedItem;
    }),

    classReport: Ember.computed('userPreference', function() {
      let userPreference = this.get('userPreference');
      let selectedItem = userPreference.class_report_default_landing_route
        ? CLASSREPORTS.findBy(
          'key',
          userPreference.class_report_default_landing_route
        )
        : null;
      return selectedItem;
    }),

    //------------------------------------------------------------------------------
    actions: {
      addCategory: function(category) {
        if (!category) {
          category = this.get('currentSelectedCategory');
        }
        this.addCategory(category);
        this.set('currentSelectedCategory', null);
      },
      editCategory: function() {
        this.editCategory();
        this.changeMode(true);
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_PREFERENCE_EDIT
        );
      },
      removeCategory: function(category) {
        this.removeCategory(category);
      },
      updateCategory: function(category) {
        this.updateCategory(category);
      },
      markSelectedSubject(subject, category) {
        this.markSelectedSubject(subject, category);
        this.updateMarkedSelectionsAsAdded('dummy', null, category); // Removing + sign
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.PREFERENCE_CHOOSE_SUBJECT
        );
      },
      markSelectedFrameworks: function(fwk, subject, category) {
        this.markSelectedFrameworks(fwk, subject, category);
      },
      addSelectedSubject: function(category) {
        this.updateMarkedSelectionsAsAdded('dummy', null, category);
      },
      updateFrameworkForSubjectCategory: function(fwk, subject, category) {
        let subjectObj = this.getSubjectForCategory(subject, category);
        this.removeSubject(category, subject);
        this.updateMarkedSelectionsAsAdded(fwk, subjectObj, category);
        this.showHideSubjectsDDForCategory(category, false);
      },
      savePreferences: function() {
        this.savePreferences();
        this.changeMode(false);
        this.changeModeOnSaveAll();
        this.saveAccessibilitySettings();
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.PREFERNCE_SAVE
        );
      },

      resetPreferences() {
        this.set('parsedScaleSize', 1);
        this.set('highContrastVisibility', false);
        this.set('hideReset', true);
        this.set('hideSave', true);
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.ACCESSIBILITY_RESET_BUTTON
        );
        this.saveAccessibilitySettings();
      },

      selectCategoryToAdd: function(category) {
        this.set('currentSelectedCategory', category);
      },
      changeMode: function(showedit) {
        this.changeMode(showedit);
      },
      cancel() {
        const controller = this;
        controller.set('selectedSecLanguage', Ember.A([]));
        controller.set('otherLanguages', Ember.A([]));
        let savedResponse = controller.get('savedResponse');
        controller.normalizeLanguageResponse(savedResponse);
        this.getCategories().then(() => {
          this.getProfilePreference();
        });
        this.set('sortedByPreference', this.get('viewPreference'));
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.PREFERENCE_CANCEL
        );
      },

      updateMarkedSelectionsAsAdded(fwk, subjects, category) {
        this.updateMarkedSelectionsAsAdded(fwk, subjects, category);
      },

      removeSubject(category, subject) {
        this.removeSubject(category, subject);
      },
      updateLanguage(language) {
        const controller = this;
        controller.set('selectedLanguage', language);
        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.PREFERENCE_PRIMARY_PREFER_LANGUAGE);
      },
      selectSecLanguage(language) {
        const controller = this;
        controller.set('selectedSecLanguage', language);
      },
      updateSecLanguage(language) {
        const controller = this;
        if (!language) {
          return;
        }
        let languagePreferenceArray = controller.get('otherLanguages')
          ? controller.get('otherLanguages')
          : Ember.A([]);
        languagePreferenceArray.pushObject(language);
        //controller.set('otherLanguages', languagePreferenceArray);
        Ember.set(controller, 'otherLanguages', languagePreferenceArray);
        controller.set('selectedSecLanguage', null);
        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.PREFERENCE_PREFERRED_LANGUAGE);
      },
      removeSecLanguage(language) {
        const controller = this;
        let languagePreferenceArray = controller.get('otherLanguages')
          ? controller.get('otherLanguages')
          : [];
        languagePreferenceArray.removeObject(language);
        Ember.set(controller, 'otherLanguages', languagePreferenceArray);
      },
      showAddSub(category, show) {
        this.showHideSubjectsDDForCategory(category, show || true);
      },
      prepareSubjectList(category) {
        this.prepareSubjectList(category);
      },

      prepareLanguageList() {
        const controller = this;
        let languageList = controller.get('languages');
        let currentSelLanguage = [];
        if (
          controller.get('selectedLanguage') ||
          controller.get('otherLanguages')
        ) {
          if (controller.get('selectedLanguage')) {
            currentSelLanguage = Array.concat(
              currentSelLanguage,
              controller.get('selectedLanguage')
            );
          }

          if (controller.get('otherLanguages')) {
            currentSelLanguage = Array.concat(
              currentSelLanguage,
              controller.get('otherLanguages')
            );
          }
          currentSelLanguage.forEach(sel => {
            languageList = languageList.filter(ddLang => ddLang.id !== sel.id);
          });
        }

        controller.set('languageList', languageList);
      },

      categoriesDropDownFilter() {
        const controller = this;
        let categoriesDropDownFilter = Ember.A([]),
          addedCategories = controller.get('addedCategories'),
          categoriesMaster = controller.get('categoriesMaster');

        categoriesMaster.filter(masterCat => {
          let foundcat = addedCategories.findBy('id', masterCat.id);
          if (
            !foundcat &&
            !categoriesDropDownFilter.findBy('id', masterCat.id)
          ) {
            categoriesDropDownFilter.pushObject(masterCat);
            return masterCat;
          }
        });
        controller.set('categoriesDropDownFilter', categoriesDropDownFilter);
      },

      sortPreference(selectedItem) {
        this.set('sortedByPreference', selectedItem);
      },

      selectReport(selectedItem) {
        this.set('classReport', selectedItem);
      },

      /**
       * @function onToggleCheckbox
       * Method to use update user preference and consent preference
       */
      onToggleCheckbox(value) {
        let userPreference = this.get('userPreference');
        let preferenceData = {
          show_timespent: value,
          show_score: value,
          show_proficiency: value,
          show_email: value
        };
        userPreference.learner_data_visibilty_pref = preferenceData;
        this.updateProfilePreference(userPreference);
        this.get('profileService')
          .updateConsentPreference(preferenceData)
          .then();
        if (value) {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.DATA_VISIBILITY_ON
          );
        } else {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.DATA_VISIBILITY_OFF
          );
        }
      },

      onToggleHighContrastCheckbox(value) {
        this.set('hideSave', false);
        this.set('hideReset', false);
        this.saveAccessibilitySettings();
        this.set('highContrastVisibility', value);
      },

      updateFont(action) {
        let updatedValue = this.get('parsedScaleSize');
        let settings = 'accessibility_settings';
        let accessibilitySettings = JSON.parse(
          window.localStorage.getItem(settings)
        );
        let screenZoomValue =
          accessibilitySettings && accessibilitySettings.screen_zoom_value
            ? accessibilitySettings.screen_zoom_value
            : 1;
        let zoomSize = updatedValue ? updatedValue : screenZoomValue;
        zoomSize = Number(zoomSize);
        zoomSize = zoomSize.toFixed(1);
        let parsedScaleSize = Number(zoomSize);
        if (action === 'size-up') {
          if (parsedScaleSize < 2) {
            parsedScaleSize += 0.1;
          }
        } else if (action === 'size-down') {
          if (parsedScaleSize > 1) {
            parsedScaleSize -= 0.1;
          }
        }

        this.set('hideSave', false);
        this.set('hideReset', false);
        this.applyAccessibilityToDom(parsedScaleSize);
        this.set('parsedScaleSize', parsedScaleSize);
      }
    },
    //--- pro

    getSubjectForCategory: function(subjectCode, category) {
      const controller = this;

      let categoriesMaster = controller.get('categoriesMaster');
      let found = categoriesMaster.findBy('id', category.id);
      if (found.subjectFwks) {
        return found.subjectFwks.findBy('code', subjectCode);
      }
    },

    showHideSubjectsDDForCategory(category, show) {
      let found = this.addedCategories.findBy('id', category.id);
      Ember.set(found, 'showAddSub', show);
    },

    prepareSubjectList(category) {
      this.set('currentCategorySubjectFwks', null);
      let subjectFwks =
        category && category.subjectFwks && category.subjectFwks.copy
          ? category.subjectFwks.copy()
          : Object.assign({}, category.subjectFwks);
      if (category.subjects) {
        category.subjects.forEach(subject => {
          subjectFwks = subjectFwks.filter(sub1 => {
            return Object.keys(subject)[0] !== sub1.code;
          });
        });
      }
      this.set('currentCategorySubjectFwks', subjectFwks);
    },

    //------------------------------------------------------------------------------
    // Impl methods
    //------------------------------------------------------------------------------
    removeSubject1(category, subject) {
      let addedCategories = this.get('addedCategories');
      if (addedCategories && category) {
        let found = addedCategories.findBy('id', category.id);
        if (found) {
          if (category.subjects.findBy('code', subject.code)) {
            category.removeObject(subject);
          }
        }

        Ember.set(found, 'edit', true);
      }
    },

    removeSubject(category, subject) {
      const controller = this;
      let addedCategories = controller.get('addedCategories');
      let found = addedCategories.findBy('id', category.id);
      if (found.subjects) {
        let subjectIndex = found.subjects.findIndex(
          c => Object.keys(c)[0] === subject
        );
        if (subjectIndex > -1) {
          found.subjects.removeAt(subjectIndex);
        }
      }
      controller.set('addedCategories', addedCategories);
    },
    changeModeOnSaveAll() {
      let addedCategories = this.get('addedCategories');
      addedCategories.map(c => Ember.set(c, 'edit', false));
      this.set('addedCategories', addedCategories);
    },

    changeMode: function(showedit) {
      this.set('isEditMode', showedit);
    },
    /**
     *
     * @param {object} category
     * Marks a category for adding to profile preference
     * Removes the marked category from the drop down of categories
     * Set current selection to edit, its saved with the update category
     */
    addCategory(category) {
      let addedCategories = this.get('addedCategories');
      Ember.set(category, 'edit', true);
      addedCategories.pushObject(category);
      this.set('addedCategories', addedCategories);

      let categoriesDropDown = this.get('categoriesDropDown');
      categoriesDropDown.removeObject(category);
      this.get('categoriesDropDown', categoriesDropDown);
      this.getSubjectFrameworks(category);
      //this.changeMode(false);
      this.scrollToEnd();
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.PREFERENCE_ADD_NEW_CATEGORY
      );
    },

    scrollToEnd() {
      $('html,body').animate(
        {
          scrollTop: document.body.scrollHeight
        },
        'fast'
      );
    },
    /**
     *
     * @param {object} category
     * Marks a category for editing to in memory
     * Removes the marked category from the drop down of categories
     * Set current selection to edit, its saved with the update category
     */
    editCategory(category) {
      this.getTenantSettings();
      let addedCategories = this.get('addedCategories');
      if (category) {
        let found = addedCategories.findBy('id', category.id);
        Ember.set(found, 'edit', true);
        addedCategories.removeObject(category);
        addedCategories.pushObject(found);
      } else {
        addedCategories.map(c => Ember.set(c, 'edit', true));
      }
      this.set('addedCategories', addedCategories);
    },

    /**
     * Converts the edit mode to read only mode
     * save the in edit list to the list to be saved category
     * @param {object} category
     */
    updateCategory(category) {
      let addedCategories = this.get('addedCategories');
      addedCategories.removeObject(category);
      Ember.set(category, 'edit', false);
      addedCategories.pushObject(category);
      this.set('addedCategories', addedCategories);
      // Add new Object
    },

    markSelectedSubject(subject, category) {
      Ember.set(category, 'currentSelectedSubject', subject);
    },

    markSelectedFrameworks(fwk, subjects, category) {
      Ember.set(category.currentSelectedSubject, 'currentSelectedFwk', fwk);
    },

    setSelectedSubjectFrameworks(fwk, subject, category) {
      if (fwk && subject && category) {
        const controller = this;
        let subjectEntry = {};
        subjectEntry[subject.code] = fwk.frameworkId;
        let addedCategories = controller.get('addedCategories');
        let found = addedCategories.findBy('id', category.id);
        if (found) {
          Ember.set(found, 'currentSelectedSubject', null);
          //found.currentSelectedSubject = null;
        }
        if (found.subjects) {
          if (found.subjects[subject.code]) {
            found.subjects.remove(subject.code);
          }
          found.subjects.pushObject(subjectEntry);
        } else {
          Ember.set(found, 'subjects', Ember.A([]));
          found.subjects.pushObject(subjectEntry);
        }
        addedCategories.sortBy('id');
        controller.set('addedCategories', addedCategories);
      }
    },

    updateAddedCategories(category, subject, opCode) {
      const controller = this;
      let addedData = controller.get('addedCategories');

      if (opCode === 'addCat') {
        addedData.pushObject(category);
        controller.set('addedCategories', addedData);
      } else if (opCode === 'removeCat') {
        addedData.removeObject(category);
        controller.set('addedCategories', addedData);
      } else if (opCode === 'removeSub') {
        let found = addedData.findBy('id', category.id);
        if (found.subjectFwks) {
          if (found.subjectFwks.findBy('code', subject.code)) {
            let subjectsCpy = Object.assign(Ember.A([]), found.subjectFwks);
            found.subjectFwks.removeObject(subject);
            let selCate = controller.categoriesMaster.findBy('id', category.id);
            Ember.set(
              selCate,
              'subjectFwks',
              Object.assign(Ember.A([]), subjectsCpy)
            );
          }
        }
      } else if (opCode === 'addSub') {
        let found = addedData.findBy('id', category.id);
        if (found.subjects) {
          found.subjects.pushObject(subject);
        }
      }
      controller.set('addedCategories', addedData);
    },

    updateMarkedSelectionsAsAdded(fwk, subject, category) {
      const controller = this;

      if (!category) {
        category = controller.get('currentSelectedCategory');
      }
      if (!subject) {
        subject =
          category.currentSelectedSubject ||
          category.get('currentSelectedSubject');
      }
      if (!fwk) {
        fwk = subject.currentSelectedFwk || subject.get('currentSelectedFwk');
      }

      if (subject && category && fwk) {
        Ember.set(category, 'currentSelectedSubject', null);
        //category.currentSelectedSubject = null;
        controller.setSelectedSubjectFrameworks(fwk, subject, category);
        controller.updateAddedCategories(category, subject, 'removeSub'); //here a

        controller.set('currentSelectedSubject', null);
        controller.set('currentSelectedCategory', null);
        controller.set('currentSelectedFwk', null);
      }
    },

    savePreferences() {
      const controller = this;

      this.set('hideSave', true);
      this.set('hideReset', false);

      let selectionsInit = controller.get('selections');
      if (selectionsInit) {
        selectionsInit = Ember.A([]);
      }
      controller.set('selections', selectionsInit); // Set clear

      let addedCategories = controller.get('addedCategories');
      if (addedCategories) {
        addedCategories = addedCategories.filter(c => {
          if (c.subjects) {
            //let catSubjects = c.subjects.map;
            c.subjects.map(s => {
              controller.markSelectedFrameworksParsed(
                Object.values(s),
                Object.keys(s),
                c
              );
            });
            if (c.subjects.length > 0) {
              return c;
            }
          }
        });
      }
      controller.set('addedCategories', addedCategories);

      let selections = controller.get('selections');
      //Flatten Data array not expected
      let flatSelections = Object.assign({}, selections);
      let languagePreferenceArray = controller.get('selectedLanguage')
        ? [controller.get('selectedLanguage').id]
        : null;
      if (controller.get('otherLanguages')) {
        controller.get('otherLanguages').forEach(secLanguage => {
          if (secLanguage && secLanguage.id) {
            languagePreferenceArray.push(secLanguage.id);
          }
        });
      }
      let sortedByPreference = this.get('sortedByPreference');
      let preferenceData = {
        standard_preference: flatSelections,
        language_preference: languagePreferenceArray
      };
      if (sortedByPreference) {
        preferenceData.class_sort_preference = sortedByPreference.key;
      }
      let classReport = this.get('classReport');
      if (classReport) {
        preferenceData.class_report_default_landing_route = classReport.key;
      }
      this.set('viewPreference', sortedByPreference);
      controller.updateProfilePreference(preferenceData);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.ACCESSIBILITY_SAVE_BUTTON
      );
      this.getTenantSettings();
    },

    saveAccessibilitySettings() {
      let highContrastVisibility = this.get('highContrastVisibility');
      let parsedScaleSize = this.get('parsedScaleSize');
      let accessibility_settings = {
        screen_zoom_value: parsedScaleSize ? parsedScaleSize : 1,
        is_high_contrast_enabled: highContrastVisibility
          ? highContrastVisibility
          : false
      };
      let settings = 'accessibility_settings';
      window.localStorage.setItem(
        settings,
        JSON.stringify(accessibility_settings)
      );
      this.set(
        'highContrastVisibility',
        accessibility_settings.is_high_contrast_enabled
      );
      this.applyAccessibilityToDom(
        accessibility_settings.screen_zoom_value,
        accessibility_settings.is_high_contrast_enabled
      );
    },

    setAccessibilitySettings() {
      let settings = 'accessibility_settings';
      let accessibilitySettings = JSON.parse(
        window.localStorage.getItem(settings)
      );
      let screenZoomValuePageSet =
        accessibilitySettings && accessibilitySettings.screen_zoom_value
          ? accessibilitySettings.screen_zoom_value
          : 1;

      let highContrastVisibilityPageSet =
        accessibilitySettings && accessibilitySettings.is_high_contrast_enabled
          ? accessibilitySettings.is_high_contrast_enabled
          : false;
      this.set('highContrastVisibility', highContrastVisibilityPageSet);
      this.set('parsedScaleSize', screenZoomValuePageSet);
    },

    //------------------------------------------------------------------------------
    // Impl methods
    //------------------------------------------------------------------------------

    removeCategory(category) {
      const controller = this;
      let addedCopy = controller.get('addedCategories');
      addedCopy.removeObject(category);
      controller.set('addedCategories', addedCopy);
      let categoriesDropDown = controller.get('categoriesDropDown');
      categoriesDropDown.pushObject(category);
      controller.set('categoriesDropDown', categoriesDropDown);
    },

    markSelectedFrameworksParsedWithCategrory(
      fwkValue,
      subjectValue,
      category
    ) {
      let fwk = Ember.isArray(fwkValue) ? fwkValue[0] : fwkValue,
        subject = Ember.isArray(subjectValue) ? subjectValue[0] : subjectValue;

      const controller = this;
      let categorySubject = `${category.id}.${subject}`, //eslint-disable-line
        tEntry = {},
        selections = controller.get('selections');
      tEntry[categorySubject] = fwk;
      selections.pushObject(tEntry); //Push object for saving
      controller.set('selections', selections);
    },
    markSelectedFrameworksParsed(fwkValue, subjectValue) {
      let fwk = Ember.isArray(fwkValue) ? fwkValue[0] : fwkValue,
        subject = Ember.isArray(subjectValue) ? subjectValue[0] : subjectValue;

      const controller = this;
      let selections = controller.get('selections');
      if (fwk) {
        selections[subject] = fwk; //Push object for saving
      }
      controller.set('selections', selections);
    },

    /**
     * Maintains list of categories and associated subject -> Frameworks
     * @param {object} category
     * @param {object} subjectFwks
     */
    maintainMaster(category, subjectFwks) {
      const controller = this;
      let found = controller.get('categoriesMaster').findBy('id', category.id);
      if (!found.subjectFwks) {
        Ember.set(found, 'subjectFwks', subjectFwks);
        controller.get('categoriesMaster').pushObject(found);
      } else {
        return found;
      }
      /* found.subjectFwks.find(c => c.key ===`${category.id}.${subject.code}` ); */
    },

    /**
     * Normalize data
     * @param {object} response
     * { "preference_settings": {
     * "standard_preference": {
     *   "K12.MA": "TEKS"
     * }}
     */
    normalizeProfilePreference(response) {
      const controller = this;
      let data = response.standard_preference;
      for (let categorySubject in data) {
        let subject = {},
          fwk = {},
          categoryCode = categorySubject.split('.')[0];

        subject.code = categorySubject;
        fwk.frameworkId = data[categorySubject];

        let foundCategory = controller
          .get('categoriesMaster')
          .findBy('code', categoryCode);
        let foundAddedCategory = controller
          .get('addedCategories')
          .findBy('code', categoryCode);
        if (foundCategory && !foundAddedCategory) {
          controller.addCategory(foundCategory, false); //Complete category object
        }
        controller.setSelectedSubjectFrameworks(fwk, subject, foundCategory); // fwk.frameworkId, subject.code, cat
      }
      controller.set('savedResponse', response);
      controller.normalizeLanguageResponse(response);
      controller.changeModeOnSaveAll();
      controller.changeMode(false);
    },

    normalizeLanguageResponse(response) {
      const controller = this;
      if (
        response &&
        response.language_preference &&
        response.language_preference.length > 0
      ) {
        let languagePreSelection, // First / primary language consideration as spec.
          selectedSecLanguage = [];
        if (response.language_preference.length > 0) {
          response.language_preference.forEach((secPref, indx) => {
            if (indx === 0) {
              languagePreSelection = controller
                .get('languages')
                .findBy('id', secPref);
            } else {
              selectedSecLanguage.push(
                controller.get('languages').findBy('id', secPref)
              );
            }
          });
        }
        controller.set('otherLanguages', selectedSecLanguage);
        controller.set('selectedLanguage', languagePreSelection);
      }
    },
    //------------------------------------------------------------------------------
    // Data Helpers
    //------------------------------------------------------------------------------

    getProfilePreference() {
      const controller = this;
      const userPreference = controller.get('userPreference');
      controller.normalizeProfilePreference(userPreference);
    },

    updateProfilePreference(data) {
      const controller = this;
      let highContrastVisibility = this.get('highContrastVisibility');
      let parsedScaleSize = this.get('parsedScaleSize');
      data.accessibility_settings = {
        screen_zoom_value: parsedScaleSize ? parsedScaleSize : 1,
        is_high_contrast_enabled: highContrastVisibility
          ? highContrastVisibility
          : false
      };
      controller
        .get('profileService')
        .updateProfilePreference(data)
        .then(/* Do nothing */);
    },
    getSubjectFrameworks(category) {
      const controller = this;
      let taxonomyService = controller.get('taxonomyService');
      let subjectFwksCategory = controller.maintainMaster(category);
      let addedCategories = controller.get('addedCategories');

      /* If subjects are already fetched use them else fetch and cache */
      if (subjectFwksCategory) {
        addedCategories.removeObject(category);
        Ember.set(category, 'subjectFwks', subjectFwksCategory.subjectFwks);
        addedCategories.pushObject(category);
        controller.set('addedCategories', addedCategories);
        /* controller.set('currentCategoriesSubjectFWKs', subjectFwks); */
      } else {
        return taxonomyService.fetchSubjects(category.id).then(response => {
          addedCategories.removeObject(category);

          Ember.set(
            category,
            'subjectFwks',
            Object.assign(Ember.A([]), response)
          );
          controller.maintainMaster(
            category,
            Object.assign(Ember.A([]), response)
          );
          addedCategories.pushObject(category);
          controller.set('addedCategories', addedCategories);
        });
      }
    },

    getCategories() {
      const controller = this;
      let taxonomyService = controller.get('taxonomyService');
      return new Ember.RSVP.Promise(function(resolve) {
        return taxonomyService.fetchCategories().then(response => {
          controller.set('categoriesDropDown', response.copy());
          controller.set(
            'categoriesMaster',
            Object.assign(Ember.A([]), response)
          );
          let addedCopy = response.copy();
          addedCopy = Ember.A([]);
          controller.set('addedCategories', addedCopy); // Create a shallow copy of the original one
          controller.set('selections', addedCopy.copy());
          resolve(response);
        });
      });
    },
    fetchLanguage() {
      const controller = this;
      controller
        .get('lookupService')
        .getLanguages()
        .then(languages => controller.set('languages', languages));
    },

    /**
     * @function getActiveTenantSetting
     * Method to get activity tenant settings
     */
    getTenantSettings() {
      let userPreference = this.get('userPreference');
      if (userPreference.learner_data_visibilty_pref) {
        let visibiltyPref = userPreference.learner_data_visibilty_pref;
        let learnerVisibilty;
        if (
          visibiltyPref.show_proficiency === false &&
          visibiltyPref.show_score === false &&
          visibiltyPref.show_timespent === false &&
          visibiltyPref.show_email === false
        ) {
          learnerVisibilty = false;
        } else {
          learnerVisibilty = true;
        }
        this.set('learnerDataVisibilty', learnerVisibilty);
      } else {
        this.set('learnerDataVisibilty', true);
      }
      this.getTenantSetting().then(data => {
        if (data) {
          this.set(
            'enableLearnersData',
            data.enable_learners_data_visibilty_pref === 'on'
          );
        }
      });
    },

    //------------------------------------------------------------------------------
    // Initialize the controller
    //------------------------------------------------------------------------------
    initControllerFromRoute() {
      this.set('hideSave', true);
      this.set('hideReset', true);

      this.fetchLanguage();
      this.getTenantSettings();
      this.setAccessibilitySettings();
      this.getCategories().then(() => {
        this.getProfilePreference();
      });
      this.set('viewPreference', this.get('sortedByPreference'));
    }
  }
);
