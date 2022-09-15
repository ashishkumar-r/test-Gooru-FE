import Ember from 'ember';
import d3 from 'd3';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['chrono-header-xs'],

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
   * @property {activities}
   */
  activities: null,

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
    let leftTimeLineHeight = component.$('.left-timeline-activities')[0]
      .scrollHeight;
    component.$('.student-activities').scrollTop(leftTimeLineHeight - 294);
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
   * @function calculateLeftNodes
   * Function to calculate left t(imeline
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
    component.drawPath('right');
    component.handleView('right');
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
    component.calculateLeftNodes();
    component.calculateRightNodes();
    component.drawActiveResource();
  },

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
      svg.attr('viewBox', '-10 -5  59 50');
      let activeResourceGroup = svg.append('g');
      activeResourceGroup.append('circle').attr('class', () => {
        return `active node-${selectedIndex} active-resource`;
      });
      activeResourceGroup
        .append('foreignObject')
        .attr('class', 'active-resource')
        .append('xhtml:div')
        .attr('class', () => {
          let className =
            selectedActivity.get('collectionType') === 'collection'
              ? 'collection-img'
              : 'assessment-img';
          return `resource-icon ${className}`;
        });
      let currentNodeX = 35; //constant x position
      let previousIndex = selectedIndex - 1;
      let nextIndex = selectedIndex + 1;
      let previousResource = component
        .get('activities')
        .objectAt(previousIndex);
      let nextResource = component.get('activities').objectAt(nextIndex);
      if (nextResource) {
        let nextNode = this.$(`.right-node-${nextIndex}`);
        let nextNodeX = parseInt(nextNode.attr('cx'));
        if (currentNodeX === nextNodeX) {
          this.drawHorizontalLine(
            {
              x: currentNodeX - 15,
              y: 25
            },
            nextResource.pathId,
            'center'
          );
        } else {
          this.drawCurve(
            {
              x: currentNodeX - 10,
              y: 45
            },
            {
              x: 10,
              y: currentNodeX,
              curve: nextNodeX - currentNodeX
            },
            nextResource.pathId,
            'center'
          );
        }
      }

      if (previousResource) {
        let previousNode = this.$(`.left-node-${previousIndex}`);
        let prevNodeX = parseInt(previousNode.attr('cx'));
        if (currentNodeX === prevNodeX) {
          this.drawHorizontalLine(
            {
              x: currentNodeX - 15,
              y: -20
            },
            previousResource.pathId,
            'center'
          );
        } else {
          this.drawCurve(
            {
              x: 15,
              y: 45
            },
            {
              x: currentNodeX - prevNodeX,
              y: -5,
              curve: 10
            },
            previousResource.pathId,
            'center'
          );
        }
      }
    }
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
        let nextNodeX = parseInt(nextNode.attr('cx'));
        if (nextResource && nextNode.length > 0) {
          if (nodeX === nextNodeX) {
            this.drawHorizontalLine(
              {
                x: nodeX,
                y: nodeY,
                length: 14
              },
              nextResource.pathId,
              position
            );
          } else {
            this.drawCurve(
              {
                x: nodeX,
                y: nodeY
              },
              {
                x: 15,
                y: nodeY + 10,
                curve: nextNodeX - nodeX
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
      .attr('d', `M${startPoint.x} ${startPoint.y + 10} v6 10`);
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
    let resources = component.get('activities');
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
      .attr('cx', d => {
        let position;
        if (d.pathId) {
          position = d.pathType === 'teacher' ? 25 : 45;
        } else {
          position = 35;
        }
        return position;
      })
      .attr('cy', (d, i) => {
        let xAxis = 85 + i * 30;
        return xAxis;
      });
    group
      .append('foreignObject')
      .attr('width', 24)
      .attr('height', 24)
      .attr('x', d => {
        let position;
        if (d.pathId) {
          position = d.pathType === 'teacher' ? 13 : 33;
        } else {
          position = 23;
        }
        return position;
      })
      .attr('y', (d, i) => {
        let xAxis = 73 + i * 30;
        return xAxis;
      })
      .append('xhtml:div')
      .attr('class', d => {
        let className =
          d.collectionType === 'collection'
            ? 'collection-img'
            : 'assessment-img';
        return `resource-icon ${className}`;
      });
    group.on('click', function(d) {
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
    let width = 59;
    let height = bbox.height;
    let xPosition = 5;
    let yPosition = bbox.y;
    svg.setAttribute(
      'viewBox',
      `${xPosition}  ${yPosition}  ${width} ${height}`
    );
    svg.setAttribute('width', `${width}px`);
    svg.setAttribute('height', `${height}px`);
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
