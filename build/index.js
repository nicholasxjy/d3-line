'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _d2 = require('d3');

var _d3 = _interopRequireDefault(_d2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Default config.
 */

var defaults = {
  // target element or selector to contain the svg
  target: '#chart',

  // width of chart
  width: 450,

  // height of chart
  height: 130,

  // margin
  margin: { top: 15, right: 0, bottom: 35, left: 60 },

  // axis padding
  axisPadding: 5,

  // axis tick size
  tickSize: 10,

  // padding between bars
  barPadding: 13,

  // nice round values for axis
  nice: true
};

/**
 * BarChart.
 */

var BarChart = function () {

  /**
   * Construct with the given `config`.
   */

  function BarChart(config) {
    _classCallCheck(this, BarChart);

    this.set(config);
    this.init();
  }

  /**
   * Set configuration options.
   */

  _createClass(BarChart, [{
    key: 'set',
    value: function set(config) {
      for (var k in defaults) {
        this[k] = config[k] == null ? defaults[k] : config[k];
      }
    }

    /**
     * Dimensions without margin.
     */

  }, {
    key: 'dimensions',
    value: function dimensions() {
      var width = this.width;
      var height = this.height;
      var margin = this.margin;

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
      var target = this.target;
      var width = this.width;
      var height = this.height;
      var margin = this.margin;
      var axisPadding = this.axisPadding;
      var tickSize = this.tickSize;

      var _dimensions = this.dimensions();

      var _dimensions2 = _slicedToArray(_dimensions, 2);

      var w = _dimensions2[0];
      var h = _dimensions2[1];


      this.chart = _d3.default.select(target).attr('width', width).attr('height', height).append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

      this.x = _d3.default.time.scale().range([0, w]);

      this.y = _d3.default.scale.linear().range([h, 0]);

      this.xAxis = _d3.default.svg.axis().orient('bottom').scale(this.x).ticks(5).tickPadding(8).tickSize(tickSize);

      this.yAxis = _d3.default.svg.axis().orient('left').scale(this.y).ticks(3).tickPadding(8).tickSize(tickSize);

      this.chart.append('g').attr('class', 'x axis').attr('transform', 'translate(0, ' + (h + axisPadding) + ')').call(this.xAxis);

      this.chart.append('g').attr('class', 'y axis').attr('transform', 'translate(' + -axisPadding + ', 0)').call(this.yAxis);
    }

    /**
     * Render axis.
     */

  }, {
    key: 'renderAxis',
    value: function renderAxis(data, options) {
      var chart = this.chart;
      var x = this.x;
      var y = this.y;
      var xAxis = this.xAxis;
      var yAxis = this.yAxis;
      var nice = this.nice;


      var xd = x.domain(_d3.default.extent(data, function (d) {
        return d.time;
      }));
      var yd = y.domain(_d3.default.extent(data, function (d) {
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
      var chart = this.chart;
      var x = this.x;
      var y = this.y;
      var barPadding = this.barPadding;

      var _dimensions3 = this.dimensions();

      var _dimensions4 = _slicedToArray(_dimensions3, 2);

      var w = _dimensions4[0];
      var h = _dimensions4[1];


      var colWidth = w / data.length - barPadding;
      if (colWidth < 1) throw new Error('BarChart is too small for the amount of data provided');

      var column = chart.selectAll('.column').data(data);

      // enter
      column.enter().append('rect').attr('class', 'column');

      // update
      column.attr('x', function (d) {
        return x(d.time);
      }).attr('rx', colWidth / 2).attr('ry', colWidth / 2).attr('width', colWidth).attr('y', 0).attr('height', function (d) {
        return h;
      });

      // exit
      column.exit().remove();
    }

    /**
     * Render bars.
     */

  }, {
    key: 'renderBars',
    value: function renderBars(data) {
      var chart = this.chart;
      var x = this.x;
      var y = this.y;
      var barPadding = this.barPadding;

      var _dimensions5 = this.dimensions();

      var _dimensions6 = _slicedToArray(_dimensions5, 2);

      var w = _dimensions6[0];
      var h = _dimensions6[1];


      var barWidth = w / data.length - barPadding;
      if (barWidth < 1) throw new Error('BarChart is too small for the amount of data provided');

      var bar = chart.selectAll('.bar').data(data);

      // enter
      bar.enter().append('rect').attr('class', 'bar');

      // update
      bar.attr('x', function (d) {
        return x(d.time);
      }).attr('rx', barWidth / 2).attr('ry', barWidth / 2).attr('width', barWidth).transition().attr('y', function (d) {
        return y(d.value);
      }).attr('height', function (d) {
        return h - y(d.value);
      });

      // exit
      bar.exit().remove();
    }

    /**
     * Render the chart against the given `data`.
     */

  }, {
    key: 'render',
    value: function render(data) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.renderAxis(data, options);
      this.renderCols(data, options);
      this.renderBars(data, options);
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

  return BarChart;
}();

exports.default = BarChart;