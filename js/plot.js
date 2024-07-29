/* Credits: This code is adapted and inspired from the creators of d3 framework from their documentation
and their examples available at d3js.org and observablehq.com for plots and animations.
*/

function setupScene(scene) {
  const existingSVG = d3.select("#chart svg");

  if (!existingSVG.empty()) {
    existingSVG
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .on("end", function () {
        d3.select(this).remove();
        setupNewChart();
      });
  } else {
    setupNewChart();
  }

  d3.select("#filters").html("");

  // Function to setup new SVG and chart elements
  function setupNewChart() {
    let filteredData = [];
    let filteredData2 = [];

    // Setup SVG and margins
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 640 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    var div1 = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip1")
      .style("opacity", 0);
    var div2 = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip2")
      .style("opacity", 0);
    var div3 = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip3")
      .style("opacity", 0);
    // Function to update chart based on selected filters
    function updateChart() {
      svg.selectAll("*").remove();

      switch (scene) {
        case "world":
          filteredData = data.filter(
            (d) =>
              d.REF_AREA === "WLD" &&
              d.SEX === "Total" &&
              d.MEASURE_CAT === "Calories"
          );
          filteredData2 = data.filter(
            (d) =>
              d.REF_AREA === "WLD" &&
              d.SEX === "Total" &&
              d.MEASURE_CAT === "Obese"
          );
          break;
        case "by_country":
          const selectedCountry = d3.select("#countryDropdown").node().value;
          const selectedMeasure1 = d3.select("#measuresDropdown").node().value;
          filteredData = data.filter(
            (d) =>
              d.COUNTRY === selectedCountry &&
              d.SEX === "Total" &&
              d.MEASURE_CAT === selectedMeasure1
          );
          filteredData2 = data.filter(
            (d) =>
              d.COUNTRY === selectedCountry &&
              d.SEX === "Total" &&
              d.MEASURE_CAT === "Obese"
          );
          break;
        case "by_year":
          const startYear = d3.select("#startYearDropdown").node().value;
          const endYear = d3.select("#endYearDropdown").node().value;
          const startDate = d3.timeParse("%Y")(startYear);
          const endDate = d3.timeParse("%Y")(endYear);

          if (startDate > endDate) {
            alert("Start Year cannot be greater than End Year.");
            return;
          }
          filteredData = data.filter(
            (d) =>
              d.REF_AREA === "WLD" &&
              d.SEX === "Total" &&
              d.MEASURE_CAT === "Calories" &&
              d.TIME_PERIOD >= startDate &&
              d.TIME_PERIOD < endDate
          );
          filteredData2 = data.filter(
            (d) =>
              d.REF_AREA === "WLD" &&
              d.SEX === "Total" &&
              d.MEASURE_CAT === "Obese" &&
              d.TIME_PERIOD >= startDate &&
              d.TIME_PERIOD < endDate
          );
          break;
        case "by_measures":
          const selectedMeasure = d3.select("#measureDropdown").node().value;
          filteredData = data.filter(
            (d) =>
              d.REF_AREA === "WLD" &&
              d.SEX === "Total" &&
              d.MEASURE_CAT === selectedMeasure
          );
          filteredData2 = data.filter(
            (d) =>
              d.REF_AREA === "WLD" &&
              d.SEX === "Total" &&
              d.MEASURE_CAT === "Obese"
          );
          break;
        default:
          filteredData = data.filter(
            (d) =>
              d.REF_AREA === "WLD" &&
              d.SEX === "Total" &&
              d.MEASURE_CAT === "Calories"
          );
          filteredData2 = data.filter(
            (d) =>
              d.REF_AREA === "WLD" &&
              d.SEX === "Total" &&
              d.MEASURE_CAT === "Obese"
          );
      }

      filteredData.forEach((d) => {
        d.OBS_VALUE = +d.OBS_VALUE;
      });
      filteredData2.forEach((d) => {
        d.OBS_VALUE = +d.OBS_VALUE;
      });
      const categoryData1 = filteredData[0].MEASURE;
      const measureData1 = filteredData[0].MEASURE_CAT;
      const countryTag =
        filteredData2.length > 0
          ? filteredData2[0].COUNTRY
          : filteredData[0].COUNTRY;

      const xScale = d3
        .scaleTime()
        .domain(d3.extent(filteredData, (d) => d.TIME_PERIOD))
        .range([0, width])
        .nice();

      const yScale = d3
        .scaleLinear()
        .domain(d3.extent(filteredData, (d) => d.OBS_VALUE))
        .range([height, 0]);

      svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickFormat(d3.timeFormat("%Y"))
            .ticks(d3.timeYear.every(5))
        );

      svg
        .append("g")
        .attr("class", "axis y1")
        .style("stroke", "steelblue")
        .call(d3.axisLeft(yScale));
      const annotationText =
        "The 90s decade was the inflection point, which <tspan> saw the highest YoY increase in obesity percentage";
      var lastDataPoint = filteredData[15];
      var reScaleX = xScale;
      var reScaleY = yScale;
      //Append axis label for Y1
      svg
        .append("text")
        .attr("class", "label-y1")
        .attr("transform", "rotate(-90)")
        .attr("y", 54 - margin.left)
        .attr("x", 0 - height / 3)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text(categoryData1);

      var labelY1 = svg.select(".label-y1").node();
      var boxY1 = labelY1.getBBox();

      svg
        .insert("rect", ".label-y1")
        .attr("x", boxY1.x - 5)
        .attr("y", boxY1.y - 5)
        .attr("width", boxY1.width + 10)
        .attr("height", boxY1.height + 10)
        .attr("class", "rect-y1")
        .attr("transform", "rotate(-90)")
        .style("fill", "steelblue")
        .style("opacity", 0.9);

      const line1 = d3
        .line()
        .x((d) => xScale(d.TIME_PERIOD))
        .y((d) => yScale(d.OBS_VALUE));
      const path1 = svg
        .append("path")
        .datum(filteredData)
        .attr("class", "line1")
        .attr("d", line1)
        .style("fill", "none")
        .style("stroke", "steelblue")
        .style("stroke-width", "4px")
        .style("opacity", 0);
      const pathLength1 = path1.node().getTotalLength();

      path1
        .attr("stroke-dasharray", pathLength1 + " " + pathLength1)
        .attr("stroke-dashoffset", pathLength1)
        .style("opacity", 1)
        .transition()
        .duration(2000)
        .ease(d3.easeSin)
        .style("opacity", 1)
        .style("stroke-width", "4px")
        .attr("stroke-dashoffset", 0);
      svg
        .append("path")
        .datum(filteredData)
        .attr("class", "line1")
        .attr("d", line1)
        .style("fill", "none")
        .style("stroke", "steelblue")
        .style("stroke-width", "12px")
        .style("opacity", 0)
        .on("mouseover mousemove", function (event, d) {
          const mouseX = d3.pointer(event)[0];
          const mouseY = d3.pointer(event)[1];
          const yearFormat = d3.timeFormat("%b %Y");
          const numFormat = d3.format(",.2~f");
          const data_X = yearFormat(xScale.invert(mouseX));
          const data_Y = numFormat(yScale.invert(mouseY));
          div1.transition().duration(200).style("opacity", 0.9);
          div1
            .html(`Date: ${data_X}` + "<br/>" + `${categoryData1}: ${data_Y}`)
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function (d) {
          div1.transition().duration(500).style("opacity", 0);
        });

      if (filteredData2.length > 0) {
        var categoryData2 = filteredData2[0].MEASURE;
        var measureData2 = (filteredData2[0].MEASURE_CAT)==='Obese'?'Obesity Rate':filteredData2[0].MEASURE_CAT;
        const yScale2 = d3
          .scaleLinear()
          .domain(d3.extent(filteredData2, (d) => d.OBS_VALUE))
          .range([height, 0]);

        const line2 = d3
          .line()
          .x((d) => xScale(d.TIME_PERIOD))
          .y((d) => yScale2(d.OBS_VALUE));
        const path2 = svg
          .append("path")
          .datum(filteredData2)
          .attr("class", "line2")
          .attr("d", line2)
          .style("fill", "none")
          .style("stroke", "seagreen")
          .style("stroke-width", "4px")
          .style("opacity", 0);

        const pathLength2 = path2.node().getTotalLength();

        path2
          .attr("stroke-dasharray", pathLength2 + " " + pathLength2)
          .attr("stroke-dashoffset", pathLength2)
          .style("opacity", 1)
          .transition()
          .duration(2500)
          .ease(d3.easeSin)
          .style("stroke-width", "4px")
          .style("opacity", 1)
          .attr("stroke-dashoffset", 0);

        svg
          .append("path")
          .datum(filteredData2)
          .attr("class", "line2")
          .attr("d", line2)
          .style("fill", "none")
          .style("stroke", "seagreen")
          .style("stroke-width", "12px")
          .style("opacity", 0)
          .on("mouseover mousemove", function (event, d) {
            const mouseX = d3.pointer(event)[0];
            const mouseY = d3.pointer(event)[1];
            const yearFormat = d3.timeFormat("%b %Y");
            const numFormat = d3.format(",.2~f");
            const data_X = yearFormat(xScale.invert(mouseX));
            const data_Y = numFormat(yScale2.invert(mouseY));
            div2.transition().duration(200).style("opacity", 0.9);
            div2
              .html(`Date: ${data_X}` + "<br/>" + `${categoryData2}: ${data_Y}`)
              .style("left", event.pageX + "px")
              .style("top", event.pageY - 28 + "px");
          })
          .on("mouseout", function (d) {
            div2.transition().duration(500).style("opacity", 0);
          });

        // Axis y2
        svg
          .append("g")
          .attr("class", "axis y2")
          .attr("transform", `translate(${width}, 0)`)
          .style("stroke", "seagreen")
          .call(d3.axisRight(yScale2));
        // Append axis label for y2
        svg
          .append("text")
          .attr("class", "label-y2")
          .attr("transform", "rotate(90)")
          .attr("y", -width - margin.right + 53)
          .attr("x", height / 3)
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .style("fill", "white")
          .text(categoryData2);

        var labelY2 = svg.select(".label-y2").node();
        var boxY2 = labelY2.getBBox();
        var color2 = "seagreen";
        svg
          .insert("rect", ".label-y2")
          .attr("x", boxY2.x - 5)
          .attr("y", boxY2.y - 5)
          .attr("width", boxY2.width + 10)
          .attr("height", boxY2.height + 10)
          .attr("class", "rect-y2")
          .attr("transform", "rotate(90)")
          .style("fill", color2)
          .style("opacity", 0.9);

        var test = filteredData2
          .map((obsValue) => ({
            TIME_PERIOD: obsValue.TIME_PERIOD,
            OBS_VALUE: obsValue.OBS_VALUE,
          }))
          .filter(
            (obsValue) => d3.timeFormat("%Y")(obsValue.TIME_PERIOD) === "1990"
          );
        var lastDataPoint = test;

        var reScaleX = xScale;
        var reScaleY = yScale2;
      }
      // Chart Title
      svg
        .append("text")
        .attr("class", "title")
        .attr("y", 0)
        .attr("x", width / 2)
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text("" + countryTag + " Data ");

      var textTitle = svg.select(".title").node();
      var boxTitle = textTitle.getBBox();

      svg
        .insert("rect", ".title")
        .attr("x", boxTitle.x - 10)
        .attr("y", boxTitle.y - 5)
        .attr("width", boxTitle.width + 20)
        .attr("height", boxTitle.height + 10)
        .style("fill", "chocolate")
        .style("opacity", 0.9);

      // Append Annotation text
      svg
        .append("text")
        .attr("class", "annotation")
        .attr("x", width - 10)
        .attr("y", reScaleY(lastDataPoint[0].OBS_VALUE))
        .attr("text-anchor", "end")
        .append("tspan")
        .attr("x", width - 10)
        .attr("dy", "1.3em")
        .text("The 90s decade was an inflection point, which saw")
        .append("tspan")
        .attr("x", width - 10)
        .attr("dy", "1.2em")
        .text("the highest YoY increase in obesity percentage");

      var textAnnotation = svg.select(".annotation").node();
      var boxAnnotation = textAnnotation.getBBox();

      svg
        .insert("rect", ".annotation")
        .attr("x", boxAnnotation.x - 5)
        .attr("y", boxAnnotation.y - 5)
        .attr("width", boxAnnotation.width + 10)
        .attr("height", boxAnnotation.height + 10)
        .style("fill", "red")
        .style("opacity", 0.9);

      // Annotation end points
      const textX = width - 10; // X position of the text
      const textY = reScaleY(lastDataPoint[0].OBS_VALUE);
      const dataX = xScale(lastDataPoint[0].TIME_PERIOD);
      const dataY = reScaleY(lastDataPoint[0].OBS_VALUE);

      // Annotation connector line
      svg
        .append("line")
        .attr("x1", textX)
        .attr("y1", textY)
        .attr("x2", dataX)
        .attr("y2", dataY)
        .style("stroke", "red")
        .style("stroke-width", 2)
        .style("stroke-linecap", "round");
      svg
        .append("circle")
        .attr("cx", dataX)
        .attr("cy", dataY)
        .attr("r", 5)
        .style("opacity", 0.9)
        .style("fill", "red");

      correlData = filteredData.map((d) => d.OBS_VALUE);
      correlData2 = filteredData2.map((d) => d.OBS_VALUE);
      const correl = calculateCorrel(correlData, correlData2);

      function calculateCorrel(data1, data2) {
        if (data1.length !== data2.length) {
          throw new Error("Datasets must have the same length");
        }

        const n = data1.length;

        const mean1 = data1.reduce((acc, d) => acc + d, 0) / n;
        const mean2 = data2.reduce((acc, d) => acc + d, 0) / n;

        let covariance = 0;
        let variance1 = 0;
        let variance2 = 0;

        for (let i = 0; i < n; i++) {
          covariance += (data1[i] - mean1) * (data2[i] - mean2);
          variance1 += Math.pow(data1[i] - mean1, 2);
          variance2 += Math.pow(data2[i] - mean2, 2);
        }

        covariance /= n;
        const stdDev1 = Math.sqrt(variance1 / n);
        const stdDev2 = Math.sqrt(variance2 / n);

        const correl = covariance / (stdDev1 * stdDev2);

        return correl;
      }

      function createPieData(correl) {
        const percentage = Math.abs(correl) * 100;
        const pieData = [
          { category: "Score", value: percentage },
          { category: "Delta", value: 100 - percentage },
        ];
        return pieData;
      }

      const pieData = createPieData(correl);

      const pieGroup = svg
        .append("g")
        .attr("class", "correl-pie-group")
        .attr("transform", "translate(100, 60)");

      svg
        .append("text")
        .attr("class", "correlBox")
        .attr("dy", "0.35em")
        .attr("transform", "translate(100, 10)")
        .attr("text-anchor", "middle")
        .text("Correlation");

      var textCorrel = svg.select(".correlBox").node();
      //      var boxCorrel = svg.select(".correl-box").node().getBBox();
      var boxCorrel = textCorrel.getBBox();

      svg
        .insert("rect", ".correlBox")
        .attr("x", boxCorrel.x + 98)
        .attr("y", boxCorrel.y + 8)
        .attr("width", boxCorrel.width + 5)
        .attr("height", boxCorrel.height + 3)
        .style("fill", "grey")
        .style("opacity", 0.8);

      const pie = d3
        .pie()
        .sort(null)
        .value((d) => d.value);

      const arc = d3.arc().innerRadius(0).outerRadius(40);

      const arcs = pieGroup
        .selectAll(".arc")
        .data(pie(pieData))
        .enter()
        .append("g")
        .attr("class", "arc");

      const pieColor = correl > 0 ? "green" : "red";

      // Correl Pie
      arcs
        .append("path")
        .attr("class", "correl-pie")
        .attr("d", arc)
        .attr("fill", "none")
        .transition()
        .duration(2000)
        .attr("fill", (d, i) => {
          return i === 0 ? pieColor : "none";
        })
        .attrTween("d", function (d) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return function (t) {
            return arc(interpolate(t));
          };
        });
      arcs
        .on("mouseover mousemove", function (event, d) {
          const mouseX = d3.pointer(event)[0];
          const mouseY = d3.pointer(event)[1];
          const correlScore = d3.format(",.2~f")(correl * 100);
          div3.transition().duration(200).style("opacity", 0.9);
          div3
            .html(
              "Correlation Score: " +
                correlScore +
                "% <br>" +
                measureData1 +
                " v/s " +
                measureData2
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px")
            .style("background", pieColor);
        })
        .on("mouseout", function (d) {
          div3.transition().duration(500).style("opacity", 0);
        });
    }

    function initDropdowns() {
      switch (scene) {
        case "by_country":
          const allCountries = [...new Set(data.map((d) => d.COUNTRY))];
          const countries = allCountries.filter(
            (country) => country !== "World"
          );
          countries.sort((a, b) => b.localeCompare(a));
          const allMeasures1 = [...new Set(data.map((d) => d.MEASURE_CAT))];
          const measures1 = allMeasures1.filter(
            (measure) => measure !== "Obese"
          );
          d3.select("#filters")
            .append("label")
            .attr("class", "filter-label")
            .attr("for", "countryDropdown")
            .attr("fill", "maroon")
            .text("Change Country: ");
          d3.select("#filters")
            .append("select")
            .attr("id", "countryDropdown")
            .selectAll("option")
            .data(countries)
            .enter()
            .append("option")
            .text((d) => d)
            .attr("value", (d) => d);
          d3.select("#filters")
            .append("label")
            .attr("class", "filter-label")
            .attr("for", "measuresDropdown")
            .text("  Change Measures:");
          d3.select("#filters")
            .append("select")
            .attr("id", "measuresDropdown")
            .selectAll("option")
            .data(measures1)
            .enter()
            .append("option")
            .text((d) => d)
            .attr("value", (d) => d);

          d3.select("#countryDropdown").on("change", updateChart);
          d3.select("#measuresDropdown").on("change", updateChart);
          break;
        case "by_year":
          const allYears = data.map((d) => d.TIME_PERIOD);
          const yearStart = [
            ...new Set(allYears.map((d) => d3.timeFormat("%Y")(d))),
          ];
          const yearEnd = [
            ...new Set(allYears.map((d) => d3.timeFormat("%Y")(d))),
          ];
          yearEnd.sort((a, b) => d3.descending(a, b));
          d3.select("#filters")
            .append("label")
            .attr("for", "startYearDropdown")
            .text("Start Year:")
            .attr("class", "filter-label");
          d3.select("#filters")
            .append("select")
            .attr("id", "startYearDropdown")
            .selectAll("option")
            .data(yearStart)
            .enter()
            .append("option")
            .text((d) => d)
            .attr("value", (d) => d);

          d3.select("#filters")
            .append("label")
            .attr("for", "endYearDropdown")
            .attr("class", "filter-label")
            .text("End Year:");

          d3.select("#filters")
            .append("select")
            .attr("id", "endYearDropdown")
            .selectAll("option")
            .data(yearEnd)
            .enter()
            .append("option")
            .text((d) => d)
            .attr("value", (d) => d);

          d3.select("#startYearDropdown").on("change", updateChart);
          d3.select("#endYearDropdown").on("change", updateChart);
          break;
        case "by_measures":
          const allMeasures2 = [...new Set(data.map((d) => d.MEASURE_CAT))];
          const measures2 = allMeasures2.filter(
            (measure) => measure !== "Obese"
          );
          d3.select("#filters")
            .append("label")
            .attr("for", "measureDropdown")
            .attr("class", "filter-label")
            .text(" Change Obesity Factors: ");

          d3.select("#filters")
            .append("select")
            .attr("id", "measureDropdown")
            .selectAll("option")
            .data(measures2)
            .enter()
            .append("option")
            .text((d) => d)
            .attr("value", (d) => d);

          d3.select("#measureDropdown").on("change", updateChart);
          break;
        default:
          break;
      }
    }

    initDropdowns();

    updateChart();
  }
}

d3.csv("./data/aggregate_data.csv").then((data) => {
  window.data = data;

  data.forEach((d) => {
    d.TIME_PERIOD = d3.timeParse("%m/%d/%Y")(d.TIME_PERIOD);
    d.OBS_VALUE = +d.OBS_VALUE;
  });

  setupScene("world");
});
