function init (){
    map();
    //chart();
}

function map() {

    const width = 850;
    const height = 530;
    
    // Create a map projection and path generator
    const projection = d3.geoMercator().fitSize([width, height], { type: "Sphere" });
    const pathGenerator = d3.geoPath().projection(projection);
    
    // Create a color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 500000]);
    
    // Load the data and draw the map
    function loadData(year, valueColumn) {
      Promise.all([
        d3.json("csv/map.json"),
        d3.csv(`migration_${year}.csv`),
      ]).then(([worldData, migrationData]) => {
        // Create a lookup table for migration data
        const migrationLookup = new Map();
        migrationData.forEach(d => migrationLookup.set(d.Country, d));
    
        // Bind the migration data to the world map
        const countries = worldData.features;
        countries.forEach(d => {
          d.properties = migrationLookup.get(d.properties.name) || {};
        });
    
        // Draw the world map
        const svg = d3.select("#map");
        svg.selectAll("path")
          .data(countries)
          .join("path")
          .attr("d", pathGenerator)
          .attr("stroke", "#000")
          .attr("fill", d => {
            const value = d.properties[valueColumn];
            return value ? colorScale(value) : "#ccc";
          })
          .on("mousemove", (event, d) => {
            // Display tooltip on mousemove
            d3.select("#tooltip")
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY + 10 + "px")
              .html(`
                <p><strong>Country:</strong> ${d.properties.Country || d.properties.name}</p>
                <p><strong>${valueColumn}:</strong> ${d.properties[valueColumn] || "N/A"}</p>
              `)
              .classed("hidden", false);
          })
          .on("click", (event, d) => {
            // Display tooltip on mousemove
          console.log("hello");
          //CODE FOR CHANGE CHART HERE
          chart("Germany");
          })
          
          .on("mouseout", d => {
            // Hide tooltip on mouseout
            d3.select("#tooltip")
              .classed("hidden", true);
          });
      });
    }
    
    // Initialize the visualization
    loadData(2005, "Outflows of foreign population by nationality(Total)");
    
}

function chart(country) {
    // Set margin, height, width
    var svg1 = d3.select("#chart"),
        margin = 200,
        width = svg1.attr("width") - margin,
        height = svg1.attr("height") - margin;

    svg1
        .append("text")
        .attr("transform", "translate(100,0)")
        .attr("x", 200)
        .attr("y", 50)
        .attr("font-size", "20px")
        .text(country + " - Foreign Migration Statistics 2019/2020"); // set chart title

    var xScale = d3.scaleBand().range([0, width]).padding(0.5), // defining x/y scale
        yScale = d3.scaleLinear().range([height, 0]);

    var g = svg1.append("g").attr("transform", "translate(" + 50 + "," + 50 + ")");

    d3.csv("csv/migration_2020.csv").then(function (data) { // import csv file
        xScale.domain(
            data.map(function (d) {
                return d.country;
            })
        );
        yScale.domain([
            0,
            d3.max(data, function (d) {
                return d.population * 1.5;
            }),
        ]);

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("y", height - 140) // define position of x-axis title
            .attr("x", width - 400)
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .attr("font-size", "15px")
            .text("Country"); // x-axis title

        g.append("g")
            .call(d3.axisLeft(yScale))
            .append("text")
            .attr("transform", "rotate(-90)") // rotate y-axis title 90 degrees
            .attr("x", -80)  // define position of y-axis title
            .attr("y", 25)
            .attr("dy", "-5.1em")
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .attr("font-size", "15px")
            .text("Population"); // y-axis title

        g.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return xScale(d.country); // plotting csv dataset onto chart (x-axis)
            })
            .attr("y", function (d) {
                return yScale(d.population); // plotting csv dataset onto chart (y-axis)
            })
            .attr("width", xScale.bandwidth())
            .attr("height", function (d) {
                return height - yScale(d.population);
            });
    });
}

window.onload = init;