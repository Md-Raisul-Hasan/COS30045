// Define margins
const margin = {top: 10, right: 10, bottom: 20, left: 40};
const mapWidth = 1500 - margin.left - margin.right;  // 3/4 of screen width
const mapHeight = 600 - margin.top - margin.bottom;
const chartWidth = 300 - margin.left - margin.right;  // 1/4 of screen width
const chartHeight = 600 - margin.top - margin.bottom;

// Create SVG for map
const mapSvg = d3.select("#map")
    .append("svg")
    .attr("width", mapWidth + margin.left + margin.right)
    .attr("height", mapHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create SVG for bar chart
const chartSvg = d3.select("#chart")
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create title for bar chart
const chartTitle = chartSvg.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + margin.bottom)
    .style("text-anchor", "middle")
    .text("");

let migrationData;

// Create a container for the buttons and country name
const buttonsDiv = d3.select("body").append("div");

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
                // Add country name
                buttonsDiv.html(`<h2>${d.properties.name}</h2>`);

                // Add buttons
                buttonsDiv.append("button")
                    .text("Bar chart")
                    .on("click", () => updateBarchart(d.properties.name));

                buttonsDiv.append("button")
                    .text("Pie chart")
                    .on("click", () => updatePiechart(d.properties.name));
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

    function updateBarchart(country) {
        // Filter data based on selected country
        let data = migrationData.filter(d => d["Country of birth"] === country);
    
        // Map data to age groups and values
        const ageGroups = data.map(row => row["AGE"]);
        const values = data.map(row => +row["Value"]);
    
        // Define scales
        const xScale = d3.scaleBand()
            .domain(ageGroups)
            .range([0, chartWidth])
            .padding(0.1);
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(values)])
            .range([chartHeight, 0]);
    
        // Remove old bars and axes
        chartSvg.selectAll("*").remove();
    
        // Draw bars
        chartSvg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d["AGE"]))
            .attr("y", d => yScale(+d["Value"]))
            .attr("width", xScale.bandwidth())
            .attr("height", d => chartHeight - yScale(+d["Value"]));
    
        // Add x-axis
        chartSvg.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(xScale));
    
        // Add y-axis
        chartSvg.append("g")
            .call(d3.axisLeft(yScale));
    
        // Update chart title
        chartTitle.text(`Migration Data for ${country}`);
    }
    
    function updatePiechart(country) {
        // Filter data based on selected country
        let data = migrationData.filter(d => d["Country of birth"] === country);
    
        // Map data to age groups and values
        const ageGroups = data.map(row => row["AGE"]);
        const values = data.map(row => +row["Value"]);
    
        // Remove old content from the chartSvg
        chartSvg.selectAll("*").remove();
    
        // Define pie layout
        const pie = d3.pie()(values);
    
        // Define arc for the pie chart
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(Math.min(chartWidth, chartHeight) / 2);
    
        // Draw pie chart
        chartSvg.selectAll(".pie")
            .data(pie)
            .enter()
            .append("path")
            .attr("class", "pie")
            .attr("d", arc)
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight / 2})`)
            .style("fill", (d, i) => d3.schemeCategory10[i]);
    
        // Update chart title
        chartTitle.text(`Migration Data for ${country}`);
    }
    