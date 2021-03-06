'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _d2 = require('d3');

var d3 = _interopRequireWildcard(_d2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: path gradients are a bitch

/**
 * Default config.
 */

var defaults = {
  // target element or selector to contain the svg
  target: '#chart',

  // width of chart
  width: 550,

  // height of chart
  height: 170,

  // margin
  margin: { top: 15, right: 0, bottom: 35, left: 60 },

  // axis padding
  axisPadding: 5,

  // axis tick size
  tickSize: 0,

  // number of x-axis ticks
  xTicks: 5,

  // number of y-axis ticks
  yTicks: 3,

  // nice round values for axis
  nice: false,

  // line interpolation
  interpolate: 'curveBasis'
};

/**
 * LineChart.
 */

var LineChart = function () {

  /**
   * Construct with the given `config`.
   */

  function LineChart(config) {
    _classCallCheck(this, LineChart);

    this.set(config);
    this.init();
  }

  /**
   * Set configuration options.
   */

  _createClass(LineChart, [{
    key: 'set',
    value: function set(config) {
      Object.assign(this, defaults, config);
    }

    /**
     * Dimensions without margin.
     */

  }, {
    key: 'dimensions',
    value: function dimensions() {
      var width = this.width,
          height = this.height,
          margin = this.margin;

      var w = width - margin.left - margin.right;
      var h = height - margin.top - margin.bottom;
      return [w, h];
    }

    /**
     * Initialize the chart.
     */

  }, {
    key: 'init',
    value: function init() {
      var _this = this;

      var target = this.target,
          width = this.width,
          height = this.height,
          margin = this.margin,
          axisPadding = this.axisPadding,
          interpolate = this.interpolate;
      var tickSize = this.tickSize,
          xTicks = this.xTicks,
          yTicks = this.yTicks;

      var _dimensions = this.dimensions(),
          _dimensions2 = _slicedToArray(_dimensions, 2),
          w = _dimensions2[0],
          h = _dimensions2[1];

      this.chart = d3.select(target).attr('width', width).attr('height', height).append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

      this.x = d3.scaleTime().range([0, w]);

      this.y = d3.scaleLinear().range([h, 0]);

      this.xAxis = d3.axisBottom().scale(this.x).ticks(xTicks).tickPadding(8).tickSize(tickSize);

      this.yAxis = d3.axisLeft().scale(this.y).ticks(yTicks).tickPadding(8).tickSize(tickSize);

      this.chart.append('g').attr('class', 'x axis').attr('transform', 'translate(0, ' + (h + axisPadding) + ')').call(this.xAxis);

      this.chart.append('g').attr('class', 'y axis').attr('transform', 'translate(' + -axisPadding + ', 0)').call(this.yAxis);

      this.line = d3.line().x(function (d) {
        return _this.x(d.time);
      }).y(function (d) {
        return _this.y(d.value);
      }).curve(d3[interpolate]);

      this.chart.append('path').attr('class', 'line');
    }

    /**
     * Render axis.
     */

  }, {
    key: 'renderAxis',
    value: function renderAxis(data, options) {
      var chart = this.chart,
          x = this.x,
          y = this.y,
          xAxis = this.xAxis,
          yAxis = this.yAxis,
          nice = this.nice;


      var xd = x.domain(d3.extent(data, function (d) {
        return d.time;
      }));
      var yd = y.domain(d3.extent(data, function (d) {
        return d.value;
      }));

      if (nice) {
        xd.nice();
        yd.nice();
      }

      var c = options.animate ? chart.transition() : chart;

      c.select('.x.axis').call(xAxis);
      c.select('.y.axis').call(yAxis);
    }

    /**
     * Render columns.
     */

  }, {
    key: 'renderCols',
    value: function renderCols(data) {
      var chart = this.chart,
          x = this.x,
          y = this.y;

      var _dimensions3 = this.dimensions(),
          _dimensions4 = _slicedToArray(_dimensions3, 2),
          w = _dimensions4[0],
          h = _dimensions4[1];

      var column = chart.selectAll('.column').data(data);

      // enter
      column.enter().append('rect').attr('class', 'column');

      // update
      column.attr('width', 1).attr('height', function (d) {
        return h;
      }).attr('x', function (d) {
        return x(d.time);
      }).attr('y', 0);

      // exit
      column.exit().remove();
    }

    /**
     * Render line.
     */

  }, {
    key: 'renderLine',
    value: function renderLine(data) {
      var chart = this.chart.transition();
      var line = this.line;


      chart.select('.line').attr('d', line(data));

      // hack: fixes order
      chart.node().appendChild(chart.select('.line').node());
    }

    /**
     * Render the chart against the given `data`.
     */

  }, {
    key: 'render',
    value: function render(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.renderAxis(data, options);
      this.renderCols(data, options);
      this.renderLine(data, options);
    }

    /**
     * Update the chart against the given `data`.
     */

  }, {
    key: 'update',
    value: function update(data) {
      this.render(data, {
        animate: true
      });
    }
  }]);

  return LineChart;
}();

exports.default = LineChart;