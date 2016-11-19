
import * as d3 from 'd3'

// TODO: path gradients are a bitch

/**
 * Default config.
 */

const defaults = {
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
  interpolate: 'curveBasis',

  // grid
  grid: false
}

/**
 * LineChart.
 */

export default class LineChart {

  /**
   * Construct with the given `config`.
   */

  constructor(config) {
    this.set(config)
    this.init()
  }

  /**
   * Set configuration options.
   */

  set(config) {
    Object.assign(this, defaults, config)
  }

  /**
   * Dimensions without margin.
   */

  dimensions() {
    const { width, height, margin } = this
    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom
    return [w, h]
  }

  /**
   * Initialize the chart.
   */

  init() {
    const { target, width, height, margin, axisPadding, interpolate } = this
    const { tickSize, xTicks, yTicks } = this
    const [w, h] = this.dimensions()

    this.chart = d3.select(target)
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    this.xScale = d3.scaleTime()
      .range([0, w])

    this.yScale = d3.scaleLinear()
      .range([h, 0])

    this.xAxis = d3.axisBottom()
      .scale(this.xScale)
      .ticks(xTicks)
      .tickPadding(8)
      .tickSize(tickSize)

    this.yAxis = d3.axisLeft()
      .scale(this.yScale)
      .ticks(yTicks)
      .tickPadding(8)
      .tickSize(tickSize)

    this.chart.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${h+axisPadding})`)
      .call(this.xAxis)

    this.chart.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${-axisPadding}, 0)`)
      .call(this.yAxis)

    this.line = d3.line()
      .x(d => this.xScale(d.time))
      .y(d => this.yScale(d.value))
      .curve(d3[interpolate])

    this.chart.append('path')
      .attr('class', 'line')
  }

  /**
   * Render axis.
   */

  renderAxis(data, options) {
    const { chart, xScale, yScale, xAxis, yAxis, nice } = this

    const xd = xScale.domain(d3.extent(data, d => d.time))
    const yd = yScale.domain(d3.extent(data, d => d.value))

    if (nice) {
      xd.nice()
      yd.nice()
    }

    const c = options.animate
      ? chart.transition()
      : chart

    c.select('.x.axis').call(xAxis)
    c.select('.y.axis').call(yAxis)
  }

  /**
   * Render Grid
   */

   renderGrid(data) {
    const { chart, xAxis, yAxis } = this
    const [w, h] = this.dimensions()

    chart.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${h})`)
      .call(xAxis.tickSize(-h, 0, 0).tickFormat(''))

    chart.append('g')
      .attr('class', 'grid')
      .call(yAxis.tickSize(-w, 0, 0).tickFormat(''))

  }

  /**
   * Render line.
   */

   renderLine(data, options) {
     const { interpolate, chart } = this
     const tchart = chart.transition()
     const prefix = options.prefix || 'chart'
     let line = d3.line()
       .x(d => this.xScale(d.time))
       .y(d => this.yScale(d.value))
       .curve(d3[interpolate])

     chart.append('path')
       .attr('class', `line line-${prefix}`)

     tchart.select(`.line-${prefix}`)
       .attr('d', line(data))

     // hack: fixes order
     tchart.node().appendChild(tchart.select(`.line-${prefix}`).node())
   }
  /**
   * Render the chart against the given `data`.
   */

   render(data, options = {}) {
     this.renderAxis(data, options)
     if (this.grid) {
       this.renderGrid(data)
     }
     this.renderLine(data, options)
   }

   /**
    * Render mutiple lines
    */
    renderMultiLines(data, options={}) {
      this.renderAxis(data, options)
      if (this.grid) {
        this.renderGrid(data)
      }
      const nestData = d3.nest()
        .key(d => d.symbol)
        .entries(data)

      nestData.forEach(d => {
        this.renderLine(d.values, {prefix: d.key})
      })
    }
  /**
   * Update the chart against the given `data`.
   */

   update(data) {
     this.render(data, {
       animate: true
     })
   }

   updateMulti(data) {
     this.renderMultiLines(data, {
       animate: true
     })
   }
}
