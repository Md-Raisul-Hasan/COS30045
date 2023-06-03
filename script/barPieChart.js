const chartContainer = d3.select("#chart-container").node();
const chartWidth = chartContainer.clientWidth * 0.8 - margin.left - margin.right;  // 80% of container width
const chartHeight = chartContainer.clientHeight * 0.4 - margin.top - margin.bottom;  // 40% of container height

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

// Load CSV data
d3.csv("csv/migration.csv").then(data => {
    migrationData = data;
});

// UpdateBarchart function here...
// UpdatePiechart function here...
function updateBarchart(country) {
    chartType = "bar";
    // Filter data based on selected country and exclude 'All ages'
    let data = migrationData
        .filter(d => d["Country of birth"] === country)
        .filter(d => d["AGE"] !== "All ages");

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
    chartType = "pie";
    // Filter data based on selected country and exclude 'All ages'
    let data = migrationData
        .filter(d => d["Country of birth"] === country)
        .filter(d => d["AGE"] !== "All ages");

    // Map data to age groups and values
    const ageGroupsValues = data.map(row => ({age: row["AGE"], value: +row["Value"]}));

    // Remove old content from the chartSvg
    chartSvg.selectAll("*").remove();

    // Define pie layout
    const pie = d3.pie().value(d => d.value)(ageGroupsValues);

    // Define arc for the pie chart
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(chartWidth, chartHeight) / 2);

    // Draw pie chart
    const arcs = chartSvg.selectAll(".pie")
        .data(pie)
        .enter()
        .append("g")
        .attr("class", "pie")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight / 2})`);

    arcs.append("path")
        .attr("d", arc)
        .style("fill", (d, i) => d3.schemeCategory10[i]);

    // Append text labels to each arc
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(d => `${d.data.age}: ${d.data.value}`);

    // Update chart title
    chartTitle.text(`Migration Data for ${country}`);
}