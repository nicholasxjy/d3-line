
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Chart from '../index'

const gen = n => {
  const data = []

  for (var i = 0; i < n; i++) {
    data.push({
      time: new Date(Date.now() - (i * 3600000)),
      value: Math.max(250, Math.random() * 3000 | 0)
    })
  }

  return data
}

class App extends Component {
  componentDidMount() {
    this.a = new Chart({
      target: this.refs.a
    })

    this.b = new Chart({
      target: this.refs.b,
      width: 250,
      height: 100,
      xTicks: 3,
      yTicks: 3
    })

    this.a.render(gen(12))
    this.b.render(gen(8))
  }

  componentDidUpdate() {
    this.changeData()
  }

  changeData = _ => {
    this.a.update(gen(24))
    this.b.update(gen(8))
  }

  render() {
    return <div>
      <div id="actions">
        <button onClick={this.changeData}>Animate</button>
      </div>

      <section>
        <h3>Defaults</h3>
        <p>Chart default settings.</p>
        <svg ref="a" className="chart"></svg>
      </section>

      <section>
        <h3>Small</h3>
        <p>Chart with a smaller size.</p>
        <svg ref="b" className="chart"></svg>
      </section>

      <section>
        <h3>Reference</h3>
        <p>Chart reference image.</p>
        <img src="chart.png" width={500} />
      </section>
    </div>
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))
