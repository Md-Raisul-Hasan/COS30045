var p, rawdata, newdata, val, maxval,
marg = {
  top: 20,
  right: 20,
  left: 50,
  bottom: 20
},
w = 1000 - marg.left - marg.right,
h = 300; //window.innerHeight - 800 - marg.top - marg.bottom;
var u = w + marg.left + marg.right,
v = h + marg.top + marg.bottom + 25;

p = d3v3.select('#rightpane').append("svg").attr("width", u).attr("height", v).attr("transform", "translate(" + marg.left + "," + marg.top + ")");

function extra() {
var key = document.getElementById('Choice').value;
d3v3.selectAll('.lineGroup').each(function(d, i) {
  if (d.key === key || key == "All") {
    d3v3.select('.' + d.key).style('opacity', 1);
  } else {
    d3v3.select('.' + d.key).style('opacity', 0);
  }
});
}

var slots = ["2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008"];

d3v3.csv("newChart/Australia_data.csv")
.row(function(d) {
  return {
    key: d.Name,
    values: [+d.val1, +d.val2, +d.val3, +d.val4, +d.val5, +d.val6, +d.val7, +d.val8]
  };
})
.get(function(error, data) {
  var rangeX = d3v3.scale.ordinal().rangeRoundBands([0, w], 0.2).domain(slots);
  var rangeY = d3v3.scale.linear().range([h, 0]).domain([0, d3v3.max(data, function(d, i) {
    return d3v3.max(d.values);
  })]);
  var xAxis = d3v3.svg.axis().scale(rangeX).tickSize(2);
  var yAxis = d3v3.svg.axis().scale(rangeY).tickSize(2).ticks(14).orient("left");
  //adding the axes
  p.append("g").call(xAxis).attr("transform", "translate(0," + (h) + ")");;
  p.append("g").call(yAxis).attr("transform", "translate(50,0)");

  p
  .append("text")
  .attr("transform", "translate(100,0)")
  .attr("x", 200)
  .attr("y", 20)
  .attr("font-size", "20px")
  .text(document.getElementById('Choice').value + " - Foreign Migration Statistics 2001-2008"); // set chart title

  //adding text to x- and y-axes
  p.append("text").attr("x", (w - marg.right) / 2).attr("y", (h - marg.top + 50)).style("font-size", "14px").text("Year");
  p.append("text").attr("transform", "rotate(-90)").attr("x", 0 - (h / 2)).attr("y", (marg.left - 87)).style("font-size", "14px").text("Population");

  var line = d3v3.svg.line()
    .interpolate("linear")
    .x(function(d, i) {
      return rangeX(slots[i]);
    })
    .y(function(d, i) {
      return rangeY(d);
    });

  var color = d3v3.scale.category10();

  var g = p.selectAll(".lineGroup")
    .data(data)
    .enter().append("g")
    .attr("class", function(d, i) {
      return "lineGroup " + d.key;
    });

  g.append("path")
    .attr("class", "line")
    .attr("d", function(d) {
      return line(d.values);
    })
    .style("stroke", function(d, i) {
      return color(i);
    })
    .attr("fill", "none");


});