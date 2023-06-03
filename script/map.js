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
        mapSvg.append("g")
            .selectAll("path")
            .data(world.features)
            .enter()
            .append("path")
            .attr("d", d3.geoPath().projection(d3.geoEquirectangular()))
            .style("fill", function(d) {
                const countryData = migrationData.find(data => data["Country of birth"] === d.properties.name);
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
                // Display country name
                d3.select("#country-label").text(d.properties.name);

                // Update selected country
                selectedCountry = d.properties.name;
                
                // Update lineChart to new country
                document.getElementById('Choice').value = d.properties.Country || d.properties.name;
                extra(document.getElementById('Choice').value);
                            
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
                    .style("top", (d3.event.pageY - 10) + "px");
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