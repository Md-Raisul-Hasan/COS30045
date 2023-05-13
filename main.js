const width = 1000;
const height = 600;

// Create a map projection and path generator
const projection = d3.geoMercator().fitSize([width, height], { type: "Sphere" });
const pathGenerator = d3.geoPath().projection(projection);

// Create a color scale
const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 500000]);

// Load the data and draw the map
function loadData(year, valueColumn) {
  Promise.all([
    d3.json("worldGeo.json"),
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
      
      
      .on("mouseout", d => {
        // Hide tooltip on mouseout
        d3.select("#tooltip")
          .classed("hidden", true);
      });
  });
}

// Initialize the visualization
loadData(2005, "Outflows of foreign population by nationality(Total)");
