function init() {
    // Set margin, height, width
    var svg = d3.select("svg"),
        margin = 200,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    svg
        .append("text")
        .attr("transform", "translate(100,0)")
        .attr("x", 200)
        .attr("y", 50)
        .attr("font-size", "20px")
        .text("Foreign Migration Statistics 2019/2020"); // set chart title

    var xScale = d3.scaleBand().range([0, width]).padding(0.5), // defining x/y scale
        yScale = d3.scaleLinear().range([height, 0]);

    var g = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");

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

window.onload = init; // execute function on script load