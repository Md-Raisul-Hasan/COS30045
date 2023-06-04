// Define margins
const margin = {top: 10, right: 10, bottom: 20, left: 40};

const mapContainer = d3.select("#map-container").node();
const mapWidth = mapContainer.clientWidth - margin.left - margin.right;
const mapHeight = mapContainer.clientHeight - margin.top - margin.bottom;

// Create SVG for map
const mapSvg = d3.select("#map")
    .append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

let migrationDataByYear;  // Declare migrationData only once
let paths;

// Load CSV data
d3.csv("csv/migration.csv").then(data => {
    migrationData = data;
    const minVal = d3.min(migrationData, d => +d.Value);
    const maxVal = d3.max(migrationData, d => +d.Value);
    // Create a color scale
const colorScale = d3.scaleSequentialLog(d3.interpolateYlGnBu)
.domain([1, d3.max(migrationData, d => d.Value)]);

    
    // Load and display the World
    d3.json("script/worldGeo.json").then(world => { 
        // Define the default stroke and stroke width
        const defaultStroke = "#bdd7e7";
        const defaultStrokeWidth = "1px";
        
        paths = mapSvg.append("g")
            .selectAll("path")
            .data(world.features)
            .enter()
            .append("path")
            .attr("d", d3.geoPath().projection(d3.geoEquirectangular()))
            .style("fill", function(d) {
                const countryData = migrationData.find(data => data["Country of birth"] === d.properties.name);
                const countryValue = migrationData.find(data => data["Value"] === d.properties.value);
                if (d.properties.name === 'Australia') {
                    return "#993404";
                } else if (countryData) {
                    return colorScale(+countryData["Value"]);
                } else {
                    return "#bdc9e1"; // default color for countries without data
                }
            })
            
            .style("stroke", defaultStroke)
            .style("stroke-width", defaultStrokeWidth)
            .on("click", d => {
                if (d.properties.name == "Australia") {
                    window.alert("You cannot view migration data from the originating destination! Please try another country.");
                }
                else {
                    // Display country name
                    d3.select("#country-label").text("Migration Data for " + d.properties.name);

                    // Update selected country
                    selectedCountry = d.properties.name;

                    // Update all charts to new country
                    /*
                    document.getElementById('Choice').value = d.properties.Country || d.properties.name;
                    const countryData = migrationData.find(data => data["Country of birth"] === d.properties.name);
                    const value = countryData ? countryData["Value"] : "N/A";
                    if (value == "N/A") {
                        window.alert("There is no statistical information available for " + d.properties.name);
                    }
                    extra(document.getElementById('Choice').value);
                    */
                                
                    // Bind click events to existing buttons
                    d3.select("#bar-chart-btn").on("click", () => updateBarchart(selectedCountry));
                    d3.select("#pie-chart-btn").on("click", () => updatePiechart(selectedCountry));
                    if (chartType == "bar") {
                        updateBarchart(selectedCountry);
                    }
                    else if (chartType == "pie") {
                        updatePiechart(selectedCountry);
                    }
                    else {
                        updatePiechart(selectedCountry);
                    }
                    document.dispatchEvent(new CustomEvent('countrySelected', {detail: d.properties.name}));
                }
            })
            .on("mouseover", function(d) {
                // Apply hover effect
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", "3px");
            
                // Show country of birth and value information as tooltip
                const countryData = migrationData.find(data => data["Country of birth"] === d.properties.name);
                const value = countryData ? countryData["Value"] : "N/A";
            
                d3.select("#tooltip")
                .style("opacity", 1)
                .html(`<strong>Country:</strong> ${d.properties.name}<br>
                       <strong>Value:</strong> ${value}`)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 10) + "px")
                .style("background-color", "rgba(0, 0, 0, 0.8)") // Update background color
                .style("color", "#fff") // Update text color
                .style("padding", "10px") // Update padding
                .style("border-radius", "5px"); // Update border-radius

            })
            
            .on("mouseout", function() {
                // Reset to default style
                d3.select(this)
                    .style("stroke", defaultStroke)
                    .style("stroke-width", defaultStrokeWidth);
    
                // Hide tooltip
                d3.select("#tooltip")
                    .style("opacity", 0);
            });
    });
});

// Create a function to redraw map based on selected year
function drawMap(year) {
    // Create a color scale
    const colorScale = d3.scaleSequentialLog(d3.interpolateYlGnBu)
        .domain([1, d3.max(migrationDataByYear, d => +d[year] || 0)]);

    paths.style("fill", function(d) {
            const countryData = migrationDataByYear.find(data => data["Name"] === d.properties.name);
            if (countryData && countryData[year]) {
                return colorScale(+countryData[year]);
            } else {
                return "#ccc";  // default color for countries without data
            }
        });
}

// Load CSV data
d3.csv("csv/Australia_data.csv").then(data => {
    migrationDataByYear = data;  // Assign value to migrationData
    drawMap(2018);  // draw map for the default year i.e. 2018
});

// Handle slider input for year selection
const slider = d3.select("#year-input");
const output = d3.select("#year-label");
slider.on("input", function() {
  output.text("Showing migration geo-data for: " + this.value);
  drawMap(this.value);  // redraw map for the selected year
});
          
var linear = d3.scaleLinear()
.domain([0,10])
.range(["rgb(165, 213, 223)", "rgb(46, 73, 123)"]);

var svg = d3.select("svg");

svg.append("g")
.attr("class", "legendLinear")
.attr("transform", "translate(600,500)");
//mapWidth,mapHeight

var legendLinear = d3.legendColor()
.shapeWidth(30)
.cells(10)
.orient('horizontal')
.scale(linear);

svg.select(".legendLinear")
.call(legendLinear);