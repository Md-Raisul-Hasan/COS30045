function init (){
    // Set width and height of the SVG canvas
var w = 850;
var h = 530;

// Set up the path Configure the projection (center, translate, and scale)
var projection = d3.geoMercator()
    .center([0, 20])
    .translate([w / 2, h / 2])
    .scale(130);

// Set up the path with the projection
var path = d3.geoPath()
    .projection(projection);

// Add the SVG canvas to the body
var svg = d3.select("#map")
    .attr("width", w)
    .attr("height", h);

// Read the GeoJSON file and bind it to a path
d3.json("csv/map.json").then(function(json) {
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "grey");
});

}

window.onload = init;