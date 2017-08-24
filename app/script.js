// global settings

var w = document.body.clientWidth
var h = document.body.clientHeight

var colors = ['#CA0002', '#3B5998', '#FDB815', '#004276', '#222']

var svg = d3.select('svg')
    .attr('width', w)
    .attr('height', h)

var padding = 20

var g = svg.append('g')
    .attr('transform', 'translate(' + padding + ', ' + padding + ')')

var gtext = svg.append('g')
    .attr('transform', 'translate(' + padding + ',' + (h - padding * 2) + ')')

gtext.append('text').classed('cond', true)
gtext.append('text')
  .text('HAR')
  .attr('y', 0)
  .attr('x', 0)
  .style('font-size', 80)

gtext.append('text')
  .text('ABSTRACTOR')
  .attr('y', 18)
  .attr('x', 1)
  .style('font-size', 19)

var datasets = ['2013/cnn', '2017/cnn',
  '2013/facebook', '2017/facebook',
  '2013/google', '2017/google',
  '2013/nytimes', '2017/nytimes',
  '2013/wikipedia', '2017/wikipedia'
]

var index = 0
svg.on('click', function () {
  var path = 'assets/data/' + datasets[index] + '.json'
  load(path)
  index++
  if (index > datasets.length - 1) index = 0
}).dispatch('click')

// -----------------

// load and mangle data
function load (path) {
  console.log(path)
  d3.json(path, function (data) {
    var entries = data.log.entries

    entries = entries.map(function (d) {
      d.startedDateTime = new Date(d.startedDateTime).getTime()
      return d
    })

    entries.sort(function (a, b) {
      return d3.descending(a.startedDateTime, b.startedDateTime)
    })

    var picked = parseInt(Math.random() * colors.length)
    d3.select('body').style('background-color', colors[picked])

    update(entries)
    legend(data)
  })
}

// ------------------

function update (data) {
  var minTime = d3.min(data, function (d) {
    return d.startedDateTime
  })

  var maxTime = d3.max(data, function (d) {
    return d.startedDateTime
  })

  var lastTime = data[data.length - 1].time

  var gh = h - padding * 2

  var ch = (gh / data.length)

  var mapWidth = d3.scaleLinear()
        .domain([0, maxTime - minTime + lastTime])
        .range([1, w - padding * 2])

  var rects = g.selectAll('rect')
    .data(data)

  var eRects = rects.enter()
    .append('rect')
    .attr('y', function (d, i) {
      return i * ch
    })
    .attr('x', function (d) {
      var t = maxTime - new Date(d.startedDateTime).getTime()
      return mapWidth(t)
    })

  rects.merge(eRects)
    .transition()
    .delay(function (d, i) {
      return i * 5
    })
    .attr('y', function (d, i) {
      return i * ch
    })
    .attr('x', function (d) {
      var t = maxTime - new Date(d.startedDateTime).getTime()
      return mapWidth(t)
    })
    .attr('height', ch - 1)
    .attr('width', function (d) {
      return mapWidth(d.time)
    })

  rects.merge(eRects)

  rects.exit()
    .remove()
}

function legend (data) {
  var page = data.log.pages[0]

  var myreg = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/g
  var match = myreg.exec(page.title)

  var date = new Date(page.startedDateTime)
  var format = d3.timeFormat('%Y-%m')

  gtext.select('.cond')
        .text(match[1] + ' ' + format(date))
        .attr('y', -62)
        .attr('x', 5)
        .style('font-size', 14)
}
