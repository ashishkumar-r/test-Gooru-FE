import Ember from 'ember';
import d3 from 'd3';
import { getGradeColor } from 'gooru-web/utils/utils';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['chrono-header'],

  /**
   * @property {String} color - Hex color value for the default bgd color
   */
  defaultBarColor: '#E3E5EA',

  /**
   * @property {draw observer}
   * draw the timeline activities whenever data model changes
   */
  draw: Ember.observer(
    'activities.[]',
    'activities.@each.selected',
    function() {
      this.set('isLoading', false);
      this.drawTimeLineActivities();
    }
  ),

  /**
   * @property {rightTimeLine}
   */
  rightTimeLine: null,

  /**
   * @property {leftTimeLine}
   */
  leftTimeLine: null,

  /**
   * @property {activities}
   */
  activities: null,

  /**
   * @property {selectedIndex}
   */
  selectedIndex: null,

  /**
   * @property {isLoading}
   */
  isLoading: false,

  /**
   * @property {activityEndDate}
   */
  activityEndDate: Ember.computed('activities', function() {
    let lastIndex = this.get('activities').length - 1;
    let lastAccesedResource = this.get('activities').objectAt(lastIndex);
    return this.uiDateFormat(lastAccesedResource.get('lastAccessedDate'));
  }),

  /**
   * @property {activityDate}
   */
  activityDate: Ember.computed('startDate', function() {
    return this.uiDateFormat(this.get('startDate'));
  }),

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    const component = this;
    component.drawTimeLineActivities();
    component.paginateNext();
  },

  didRender() {
    const component = this;
    if (component.get('positionToCenter')) {
      component.scrollToCenter();
    }
    this.fillActiveResource();
  },

  willDestroyElement() {
    let component = this;
    component.clearChart();
  },

  actions: {
    onOpenCourseReport() {
      this.sendAction('onOpenCourseReport');
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function uiDateFormat
   * Method to parse given date
   */
  uiDateFormat(givenDate) {
    givenDate = givenDate || new Date();
    if (typeof givenDate === 'string') {
      givenDate = new Date(givenDate);
    }
    let dateLocale = 'en-us',
      dateMonth = givenDate.toLocaleString(dateLocale, {
        month: 'short'
      }),
      dateYear = givenDate.toLocaleString(dateLocale, {
        year: '2-digit'
      }),
      dateDisplay = {
        mon: dateMonth,
        year: dateYear
      };
    return dateDisplay;
  },

  /**
   * @function drawTimeLineActivities
   * Method to draw timeline activities
   */
  drawTimeLineActivities() {
    const component = this;
    component.clearChart();
    let selectedActivity = component.get('activities').findBy('selected', true);
    let selectedIndex = component.get('activities').indexOf(selectedActivity);
    if (selectedIndex > -1) {
      component.set('selectedIndex', selectedIndex);
    }
    component.calculateRightNodes();
    component.calculateLeftNodes();
    component.drawActiveResource();
  },

  fillActiveResource() {
    let component = this;
    let selectedActivity = component.get('activities').findBy('selected', true);
    if (selectedActivity) {
      let color = getGradeColor(selectedActivity.get('score'));
      component.$('.active-resource').css('background-color', color);
    }
  },

  /**
   * @function drawActiveResource
   * Function to draw active resource
   */
  drawActiveResource() {
    const component = this;
    let selectedActivity = component.get('activities').findBy('selected', true);
    let selectedIndex = component.get('activities').indexOf(selectedActivity);
    if (selectedIndex > -1) {
      let svg = d3.select('#active-resource').select('svg');
      if (!svg[0][0]) {
        svg = d3
          .select('#active-resource')
          .append('svg')
          .attr('class', 'center-activities');
      }
      let activeResourceGroup = svg.append('g');
      activeResourceGroup.append('circle').attr('class', () => {
        let className = selectedActivity.get('pathId') ? 'suggested' : '';
        return `active node-${selectedIndex} ${className}`;
      });
      activeResourceGroup
        .append('foreignObject')
        .append('xhtml:div')
        .attr('class', () => {
          let className =
            selectedActivity.get('collectionType') === 'collection'
              ? 'active-collection'
              : 'active-assessment';
          return `active-resource ${className}`;
        });
      let currentNodeX = 0; //constant cx position
      let currentNodeY = 35; //constant xy position
      let previousIndex = selectedIndex - 1;
      let nextIndex = selectedIndex + 1;
      let previousResource = component
        .get('activities')
        .objectAt(previousIndex);
      let nextResource = component.get('activities').objectAt(nextIndex);
      if (nextResource) {
        let nextNode = this.$(`.right-node-${nextIndex}`);
        let nextNodeY = parseInt(nextNode.attr('cy'));
        if (currentNodeY === nextNodeY) {
          this.drawHorizontalLine(
            {
              x: 80, //constant startpoint position
              y: currentNodeY - 5,
              length: 20
            },
            nextResource.pathId,
            'center'
          );
        } else {
          this.drawCurve(
            {
              x: 80,
              y: currentNodeY
            },
            {
              x: nextNodeY - currentNodeY,
              y: currentNodeY - 5,
              curve: 20
            },
            nextResource.pathId,
            'center'
          );
        }
      }

      if (previousResource) {
        let previousNode = this.$(`.left-node-${previousIndex}`);
        let prevNodeY = parseInt(previousNode.attr('cy'));
        if (currentNodeY === prevNodeY) {
          this.drawHorizontalLine(
            {
              x: currentNodeX,
              y: currentNodeY - 5,
              length: 20
            },
            selectedActivity.pathId,
            'center'
          );
        } else {
          this.drawCurve(
            {
              x: currentNodeX,
              y: currentNodeY
            },
            {
              x: currentNodeY - prevNodeY,
              y: prevNodeY - 5,
              curve: 20
            },
            selectedActivity.pathId,
            'center'
          );
        }
      }
    }
  },

  /**
   * @function calculateLeftNodes
   * Function to calculate left timeline
   */
  calculateLeftNodes() {
    let component = this;
    let resources = this.get('activities');
    let selectedIndex = this.get('selectedIndex');
    let leftTimeLine = resources.slice(0, selectedIndex);
    component.set('leftTimeLine', leftTimeLine);
    component.drawNodes(leftTimeLine, 'left');
    component.drawPath('left');
    component.handleView('left');
  },

  /**
   * @function calculateRightNodes
   * Function to calculate right timeline
   */
  calculateRightNodes() {
    let component = this;
    let resources = this.get('activities');
    let selectedIndex = this.get('selectedIndex');
    let rightTimeLine = resources.slice(selectedIndex + 1, resources.length);
    component.set('rightTimeLine', rightTimeLine);
    component.drawNodes(rightTimeLine, 'right');
    component.handleView('right');
    component.drawPath('right');
  },

  /**
   * @function drawPath
   * Function to draw path
   */
  drawPath(position) {
    let resources =
      position === 'right'
        ? this.get('rightTimeLine')
        : this.get('leftTimeLine');
    resources.forEach(resource => {
      let index = this.get('activities')
        .map(x => x)
        .indexOf(resource);
      let node = this.$(`.${position}-node-${index}`);
      let nodeX = parseInt(node.attr('cx'));
      let nodeY = parseInt(node.attr('cy'));
      if (index < this.get('activities').length - 1) {
        let nextIndex = index + 1;
        let nextResource = this.get('activities').get(nextIndex);
        let nextNode = this.$(`.${position}-node-${nextIndex}`);
        let nextNodeY = parseInt(nextNode.attr('cy'));
        if (nextResource && nextNode.length > 0) {
          if (nodeY === nextNodeY) {
            this.drawHorizontalLine(
              {
                x: nodeX + 8,
                y: nodeY,
                length: 14
              },
              nextResource.pathId,
              position
            );
          } else {
            this.drawCurve(
              {
                x: nodeX + 10,
                y: nodeY
              },
              {
                x: nextNodeY - nodeY,
                y: nodeY,
                curve: 10
              },
              nextResource.pathId,
              position
            );
          }
        }
      }
    });
  },

  /**
   * @function drawHorizontalLine
   * Function to draw horizontal line
   */
  drawHorizontalLine(startPoint, isSuggestion, position) {
    d3.select(`.${position}-activities`)
      .append('path')
      .attr('class', () => {
        return isSuggestion ? 'suggestion-line' : 'line';
      })
      .attr('d', `M ${startPoint.x} ${startPoint.y} l ${startPoint.length} 0`);
  },

  /**
   * @function drawCurve
   * Function to draw curve line
   */
  drawCurve(startPoint, points, isSuggestion, position) {
    d3.select(`.${position}-activities`)
      .append('path')
      .attr('class', () => {
        return isSuggestion ? 'suggestion-curve' : 'curve';
      })
      .attr(
        'd',
        `M ${startPoint.x} ${points.y} q 5 0 ${points.curve} ${points.x}`
      );
  },

  /**
   * @function drawNodes
   * Function to draw nodes
   */
  drawNodes(timeLine, position) {
    let component = this;
    let resources = this.get('activities');
    let isLeft = position === 'left';
    let svg = d3.select(`#${position}-activities`).select('svg');
    if (!svg[0][0]) {
      svg = d3
        .select(`#${position}-activities`)
        .append('svg')
        .attr('class', `${position}-activities`);
    }
    let node = svg
      .selectAll('.student-node')
      .data(timeLine)
      .enter();
    let group = node.append('g');
    group
      .append('circle')
      .attr('class', d => {
        let index = resources.map(x => x).indexOf(d);
        let className = d.pathId ? 'suggestion-activity' : 'activity';
        return `${className} ${position}-node-${index}`;
      })
      .attr('cx', (d, i) => {
        let xAxis = 11 + i * 30;
        return isLeft ? xAxis + 70 : xAxis;
      })
      .attr('cy', d => {
        let position;
        if (d.pathId) {
          position = d.pathType === 'teacher' ? 25 : 45;
        } else {
          position = 35;
        }
        return position;
      });
    group
      .append('foreignObject')
      .attr('width', 24)
      .attr('height', 24)
      .attr('x', (d, i) => {
        let xAxis = i * 30;
        return isLeft ? xAxis + 69 : xAxis - 1;
      })
      .attr('y', d => {
        let position;
        if (d.pathId) {
          position = d.pathType === 'teacher' ? 13 : 33;
        } else {
          position = 23;
        }
        return position;
      })
      .append('xhtml:div')
      .attr('class', d => {
        return d.collectionType === 'collection'
          ? 'collection-img'
          : 'assessment-img';
      });
    group.on('click', d => {
      component.set('positionToCenter', true);
      component.sendAction('onSelectCard', d);
    });
  },

  /**
   * @function handleView
   * Function to handle svg view
   */
  handleView(position) {
    let component = this;
    const svg = component.$(`.${position}-activities`)[0];
    const bbox = svg.getBBox();
    let width = bbox.width;
    let height = 5;
    let xPosition = bbox.x;
    let yPosition = 37;
    svg.setAttribute('viewBox', `${xPosition} ${yPosition} ${width} ${height}`);
    svg.setAttribute('width', `${width}px`);
    svg.setAttribute('height', `${yPosition}px`);
  },

  /**
   * @function scrollToCenter
   * Function to set scroll position
   */
  scrollToCenter() {
    let component = this;
    let activeOffset = component.$('#active-resource').offset().left;
    let activitiesOneHalfWidthContainer =
      component.$('.student-activities').width() / 2;
    let activeResourceWidth = component.$('#active-resource').width();
    let scrollLeft =
      component.$('.student-activities').scrollLeft() +
      (activeOffset -
        (activitiesOneHalfWidthContainer + (activeResourceWidth + 50)));
    component.$('.student-activities').scrollLeft(scrollLeft);
    component.set('positionToCenter', false);
  },

  /**
   * @function paginateNext
   * Function to call paginate when scroll reaches at the end
   */
  paginateNext() {
    let component = this;
    component.$('.student-activities').scroll(() => {
      if (component.$('.student-activities').scrollLeft() === 0) {
        if (!component.get('isLoading')) {
          component.sendAction('onPaginateNext');
          component.set('isLoading', true);
        }
      }
    });
  },

  /**
   * @function clearChart
   * Function to clear svg
   */
  clearChart() {
    let component = this;
    component.$('svg').empty();
  }
});
