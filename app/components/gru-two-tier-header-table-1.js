import gruTwoTierHeaderTable from 'gooru-web/components/gru-two-tier-header-table';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';

import Ember from 'ember';

export default gruTwoTierHeaderTable.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: [-1],
  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  didRender() {
    this._super(...arguments);
    Ember.run.later(function() {
      $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
    });
  },

  didReceiveAttrs() {
    this._super(...arguments);
    const component = this;
    let classNames = ['gru-two-tier-header-table-1'];
    component.set('classNames', classNames);
    component.setSortedData();
  },
  resourceCount: 1,

  caAverage: Ember.computed('data.length', 'sortCriteria', function() {
    let cavg = this.get('sortedData')[0].content.length - 1;
    return cavg - 1;
  }),
  /**
   * Get students avatar url if present,
   * if not returns the default profile img
   */
  setSortedData: function() {
    const appRootPath = this.get(
      'configurationService.configuration.appRootPath'
    )
      ? this.get('configurationService.configuration.appRootPath')
      : '/';
    let imageUrl = appRootPath + DEFAULT_IMAGES.USER_PROFILE;

    this.get('sortedData').map(data => {
      Ember.set(
        data,
        'avatarUrl',
        data.avatarUrl && data.avatarUrl !== 'undefined'
          ? data.avatarUrl
          : imageUrl,
        true
      );
    });
  },

  updateSortClasses: Ember.observer('sortCriteria', function() {
    this._super(...arguments);
    const sortCriteria = this.get('sortCriteria');

    if (sortCriteria.secondTierIndex === 1) {
      const totalSecondTierHeaders = this.get('secondTierHeaders').length;
      const headers = this.$('.second-tier th');

      var currentHeaderIndex =
        sortCriteria.firstTierIndex * totalSecondTierHeaders +
        sortCriteria.secondTierIndex;

      headers.removeClass('ascending').removeClass('descending');

      if (currentHeaderIndex >= 0) {
        if (sortCriteria.order > 0) {
          headers.eq(currentHeaderIndex).addClass('ascending');
        } else {
          headers.eq(currentHeaderIndex).addClass('descending');
        }
      }
    }
  }),

  /**
   * Set default visibility to
   */
  updateColumnVisibility: Ember.observer(
    'secondTierHeaders.@each.visible',
    function() {
      //this._super(...arguments);

      var selectors = [];
      let offsetStr = '-2'; // -2 show only score , -1 score  and time, 0 score and reaction
      if (this.isCollectionType) {
        offsetStr = '-0';
      } else {
        offsetStr = '-1';
      }

      selectors.push('table tr.second-tier th.correct');
      selectors.push(`table tr.data td:nth-child(3n${offsetStr})`);
      var cssSelector = selectors.join(',');
      this.$(cssSelector).removeClass('hidden');
      var that = this;

      if (this.isCollectionType) {
        let scoreCol = $('table tr.second-tier th.correct:first >span');
        let icn = scoreCol.find('i[data-toggle="tooltip"]'),
          lbl = scoreCol.find('div.col-label'),
          lbl1 = scoreCol.find('div.sortIcn');
        lbl.removeClass('hidden');
        lbl1.removeClass('hidden');

        let sortIcn = scoreCol.find('.sortIcn');
        sortIcn.css('display', 'inline-block');
        icn.css('display', 'none');
        let tsColTitle = this.get('i18n').t('gru-data-picker.timeSpent').string;
        lbl.text(tsColTitle);
        sortIcn.addClass('cursor-pointer');
      } else {
        //Applicable to score i.e. questions
        let innerSpan = this.$(cssSelector).find('span > span.score');

        innerSpan.map((idx, spn) => {
          that.resourceCount += 1;

          if (
            spn &&
            ($(spn).text() === '' ||
              $(spn).text() === null ||
              $(spn).text() === 'ic_done_all' ||
              $(spn).text() === 'clear')
          ) {
            $(spn).text(that.resourceCount);
            if (that.resourceCount % 5 === 0) {
              $(spn).addClass('fifth-col');
            }
          } else {
            that.resourceCount = 0;
          }
        });

        if (innerSpan.text() === '' || innerSpan.text() === null) {
          innerSpan.text(this.resourceCount);
        } else {
          this.resourceCount = 0;
        }

        let scoreCol = $('table tr.second-tier th.correct:first >span');

        let icn = scoreCol.find('i:first'),
          lbl = scoreCol.find('div.col-label'),
          lbl1 = scoreCol.find('div.sortIcn');
        lbl.removeClass('hidden');
        lbl1.removeClass('hidden');

        let sortIcn = scoreCol.find('.sortIcn');
        sortIcn.css('display', 'inline-block');
        sortIcn.addClass('cursor-pointer');
        icn.css('display', 'none');
      }
    }
  )
});
