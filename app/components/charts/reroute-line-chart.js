import Ember from 'ember';
import d3 from 'd3';
import { getGradeRange, sec2time } from 'gooru-web/utils/utils';
import { CONTENT_TYPES } from 'gooru-web/config/config';

export default Ember.Component.extend({
  // ----------------------------------------------------
  // Attributes

  classNames: ['reroute-line-chart'],

  // ----------------------------------------------------
  // Dependencies

  // ----------------------------------------------------
  // Properties

  suggestedContents: null,

  routeContents: Ember.computed(
    'suggestedContents',
    'suggestedContents.@each.performance',
    function() {
      const suggestedContents = this.get('suggestedContents');
      const routeContents = Ember.A([]);
      const selectedLesson = this.get('selectedLesson');
      suggestedContents.forEach(content => {
        const routeContent = content.format
          ? this.createCollectionRenderObj(content, selectedLesson.lesson_id)
          : this.createRenderObj(content);
        routeContents.push(routeContent);
      });
      return routeContents;
    }
  ),

  lineGroups: null,

  isZoomIn: false,

  resizeWidth: Ember.computed(function() {
    return this.$().width();
  }),

  isLessonLoading: false,

  watchLessonData: Ember.observer(
    'isLessonLoading',
    'suggestedContents.@each.performance',
    function() {
      if (!this.get('isLessonLoading')) {
        this.loadHtmlElement();
      }
    }
  ),

  selectedLesson: null,

  // ----------------------------------------------------
  // Hooks

  didInsertElement() {
    const component = this;
    this.loadHtmlElement();
    $(window).on('resize', function() {
      component.set('resizeWidth', component.$().width());
      component.windowResizerChart();
    });
    setTimeout(() => {
      this.drawChartLine();
      this.shuffleElementPosition();
    }, 1000);
  },

  willDestroyElement() {
    $(window).off('resize');
  },

  // ----------------------------------------------------
  // Actions

  actions: {
    onToggleZoom() {
      this.toggleProperty('isZoomIn');
      this.loadData();
    },

    onSelectLesson(content) {
      if (!content.isExpanded) {
        this.sendAction('onSelectLesson', content);
        this.set('isLessonLoading', true);
      }
      this.loadLessonCollections(content);
    },

    onShowCollectionReport(content, lesson) {
      this.sendAction('onShowCollectionReport', content, lesson);
    }
  },

  // ----------------------------------------------------
  // Methods

  loadData() {
    this.loadHtmlElement();
    this.drawChartLine();
    this.shuffleElementPosition();
  },

  /**
   * @function loadHtmlElement help to load the html content inside the route chart
   */
  loadHtmlElement() {
    const component = this;
    const routeContents = component.get('routeContents');
    const chartBody = component.$('.reroute-line-chart-body');
    chartBody.find('.row-content-panel').remove();
    let contentBody = null;
    let rowCount = 0;
    let noOfBox = component.get('resizeWidth') > 600 ? 5 : 3;
    routeContents.forEach((content, cIndex) => {
      if (cIndex % noOfBox === 0) {
        rowCount++;
        contentBody = $('<div/>', {
          class: `row-content-panel ${
            rowCount % 2 === 0 ? 'content-right-align' : ''
          }`
        });
      }
      let collectionSections = $('<div/>', {
        class: `collection-panel-sections row-grid-item-${noOfBox}`
      });
      collectionSections.html(
        `<span class="collection-icon format-${content.format}"></span>`
      );

      if (content.format === CONTENT_TYPES.LESSON) {
        collectionSections.find('.collection-icon').on('click', function() {
          component.send('onSelectLesson', content);
        });
      }
      if (content.format !== CONTENT_TYPES.LESSON) {
        collectionSections.find('.collection-icon').on('click', function() {
          component.sendAction('onPlay', content.parentId, content);
        });
      }
      let compCode = content.competencyDisplayCode
        ? content.competencyDisplayCode
        : null;
      const expandCard = $('<div/>', {
        class: 'collection-popup-container',
        html: `<span class="competency-code ${
          compCode ? '' : 'empty-comp-code'
        }">${compCode ? compCode : ''}</span>`
      });
      const competencyTag = expandCard.find('.competency-code');
      this.loadCompetencyStatus(content, competencyTag);
      collectionSections[rowCount % 2 === 0 ? 'append' : 'prepend'](expandCard);
      if (component.get('isZoomIn')) {
        const popupComponent = component.expandContentCard(content);
        expandCard[rowCount % 2 === 0 ? 'prepend' : 'append'](popupComponent);
        expandCard[
          rowCount % 2 === 0 ? 'prepend' : 'append'
        ](`<span class="material-icons-outlined arrow-icon-item ${
          rowCount % 2 === 0 ? 'arrow_drop_up' : 'arrow_drop_down'
        }">
          arrow_forward_ios</span>
          `);
      }

      contentBody.append(collectionSections);
      if (cIndex % noOfBox === 0 || cIndex === routeContents.length - 1) {
        chartBody.append(contentBody);
      }
    });
  },

  expandContentCard(content) {
    const component = this;
    const expandedCard = $('<div/>', {
      class: 'collection-popup-panel',
      html: ` <span class="material-icons-outlined play_circle">play_circle</span>
              <div class="content-detail-panel">
                  <span class="domain-title">${content.title}</span>
              </div>
              <div class="performance-item">--</div>
             `
    });
    const performanceItem = expandedCard.find('.performance-item');
    this.loadPerformanceData(content, performanceItem);
    expandedCard.find('.play_circle').on('click', function() {
      if (content.format === CONTENT_TYPES.LESSON) {
        component.sendAction(
          'onPlay',
          content.lesson_id,
          content.collections[0]
        );
      } else {
        component.sendAction('onPlay', content.parentId, content);
      }
    });
    return expandedCard;
  },

  drawChartLine() {
    const component = this;

    const container = d3
      .select(`#${component.elementId}`)
      .select('.reroute-line-chart-body .reroute-chart');
    container.select('svg').remove();
    const svg = container.append('svg');
    const width = component.$().width();
    svg.attr('width', width).attr('height', component.$().height());
    component.set('lineGroups', svg.append('g'));
  },

  shuffleElementPosition() {
    const component = this;
    const chartBody = component.$('.reroute-line-chart-body');
    const rowItems = chartBody.children('.row-content-panel');
    let lineGroups = component.get('lineGroups');
    let startPointX = 35;
    let startPointY = 0;
    let isRightBend = true;
    Array.from(rowItems).forEach((rowItem, rowIndex) => {
      let rowContents = $(rowItem).children('.collection-panel-sections');

      if (rowContents) {
        rowContents = rowContents.get();
        rowContents.forEach((el, elIndex) => {
          el = $(el).find('.collection-icon')[0];
          const midHeight = el.offsetHeight / 2;
          let x = el.offsetLeft + el.offsetWidth;
          let y = el.offsetTop + midHeight;
          let curveX1 = startPointX;
          let curveY1 = y;
          let curveX2 = x;
          let curveY2 = y;

          if (x === startPointX) {
            const arcPoint = y - startPointY;
            curveX1 = isRightBend
              ? startPointX + arcPoint
              : startPointX -
                (component.get('isZoomIn') ? arcPoint / 2 : arcPoint);
            curveX2 = isRightBend
              ? x + arcPoint
              : x - (component.get('isZoomIn') ? arcPoint / 2 : arcPoint);
            curveY1 = startPointY;
            isRightBend = !isRightBend;
          }
          lineGroups
            .append('path')
            .attr(
              'd',
              `M ${startPointX} ${startPointY} C ${curveX1} ${curveY1} ${curveX2} ${curveY2} ${x} ${y}`
            );
          startPointX = x;
          startPointY = y;
          if (
            rowItems.length - 1 === rowIndex &&
            rowContents.length - 1 === elIndex
          ) {
            if (rowIndex % 2 === 0) {
              y = startPointY + 50;
              curveX1 = startPointX + 50;
              curveY1 = startPointY;
              curveX2 = curveX1;
              curveY2 = y;

              lineGroups
                .append('path')
                .attr(
                  'd',
                  `M ${startPointX} ${startPointY} C ${curveX1} ${curveY1} ${curveX2} ${curveY2} ${x} ${y}`
                );
            }
            // End curve to join the next lesson
            startPointY = y;
            x = 35;
            y = component.$().height();
            curveX1 = x;
            curveY1 = startPointY;
            curveX2 = x;
            curveY2 = startPointY;
            lineGroups
              .append('path')
              .attr(
                'd',
                `M ${startPointX} ${startPointY} C ${curveX1} ${curveY1} ${curveX2} ${curveY2} ${x} ${y}`
              );
          }
        });
      }
    });
  },

  loadLessonCollections(content) {
    const component = this;
    let routeContents = component.get('routeContents');
    content.toggleProperty('isExpanded');
    if (content.get('isExpanded')) {
      routeContents.splice(
        routeContents.indexOf(content) + 1,
        0,
        ...content.collections
      );
    } else {
      routeContents = routeContents.filter(
        item => content.lesson_id !== item.parentId
      );
    }
    component.set('routeContents', routeContents);
    component.loadData();
  },

  windowResizerChart() {
    this.loadData();
  },

  createRenderObj(content) {
    const collectionSet = [...content.collections].map(collection => {
      return this.createCollectionRenderObj(collection, content.lesson_id);
    });
    const selectedLesson = this.get('selectedLesson');
    const standard = selectedLesson.get('taxonomy');
    const competencyObj = standard[0] || {};
    return Ember.Object.create({
      title: content.lesson_title,
      format: CONTENT_TYPES.LESSON,
      performance: content.performance,
      collections: collectionSet,
      competencyDisplayCode: competencyObj.code,
      lesson_id: content.lesson_id,
      unit_id: content.unit_id
    });
  },

  createCollectionRenderObj(content, lessonId = null) {
    const selectedLesson = this.get('selectedLesson');
    const standard = selectedLesson.get('taxonomy');
    const competencyObj = standard[0] || {};
    return Ember.Object.create({
      title: content.title,
      format: content.format,
      performance: content.get('performance'),
      id: content.id,
      competencyDisplayCode: competencyObj.code,
      parentId: lessonId,
      isSuggested: content.isSuggested,
      lessonContext: content.lessonContext,
      lessonStats: content.lessonStats
    });
  },

  loadPerformanceData(content, performanceItem) {
    const component = this;
    const performance = content.performance;
    const suggestedContents = component.get('suggestedContents');
    if (performance) {
      if (
        content.format === CONTENT_TYPES.COLLECTION ||
        content.format === CONTENT_TYPES.EXTERNAL_COLLECTION
      ) {
        performanceItem.html(sec2time(performance.timeSpent / 1000));
        performanceItem.addClass('timespent-item');
      } else {
        performanceItem.html(
          performance.scoreInPercentage || performance.scoreInPercentage === 0
            ? `${performance.scoreInPercentage}%`
            : '--'
        );
        performanceItem.addClass(
          `grade-range-${getGradeRange(performance.scoreInPercentage)}`
        );
      }
      if (content.format !== CONTENT_TYPES.LESSON) {
        let activeLesson = null;
        if (content.parentId) {
          activeLesson = suggestedContents.findBy(
            'lesson_id',
            content.parentId
          );
        }
        performanceItem.on('click', function() {
          component.send('onShowCollectionReport', content, activeLesson);
        });
      }
    }
  },

  loadCompetencyStatus(content, performanceItem) {
    const performance = content.performance;
    performanceItem.addClass('not-started');
    if (performance) {
      if (
        content.format !== CONTENT_TYPES.COLLECTION ||
        content.format !== CONTENT_TYPES.EXTERNAL_COLLECTION
      ) {
        performanceItem.removeClass('not-started');
        performanceItem.addClass(
          `grade-range-${getGradeRange(performance.scoreInPercentage)}`
        );
      }
    }
  }
});
