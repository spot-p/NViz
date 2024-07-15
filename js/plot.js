function setupScene(scene) {
    const existingSVG = d3.select('#chart svg');

    if (!existingSVG.empty()) {
        existingSVG.transition()
            .duration(1000)
            .style('opacity', 0)
            .on('end', function() {
                d3.select(this).remove();
                setupNewChart();
            });
    } else {
        setupNewChart();
    }

    d3.select('#filters').html('');

    // Function to setup new SVG and chart elements
    function setupNewChart() {

        let filteredData = [];
        let filteredData2 = [];

        // Setup SVG and margins
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const width = 640 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select('#chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

    // Function to update chart based on selected filters
    function updateChart() {
        svg.selectAll("rect").remove();
        svg.selectAll(".line").remove();
        svg.selectAll(".x.axis").remove();
        svg.selectAll(".y.axis").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        switch (scene) {
            case 'world':
                filteredData = data.filter(d => d.REF_AREA === "WLD" && d.SEX === "Total" && d.MEASURE_CAT === "Calories");
                filteredData2 = data.filter(d => d.REF_AREA === "WLD" && d.SEX === "Total" && d.MEASURE_CAT === "Obese");
                break;
            case 'by_country':
                const selectedCountry = d3.select('#countryDropdown').node().value;
                const selectedMeasure1 = d3.select('#measuresDropdown').node().value;
                filteredData = data.filter(d => d.COUNTRY === selectedCountry && d.SEX === "Total" && d.MEASURE_CAT === selectedMeasure1);
                filteredData2 = data.filter(d => d.COUNTRY === selectedCountry && d.SEX === "Total" && d.MEASURE_CAT === "Obese");
                break;
            case 'by_year':
                const startYear = d3.select('#startYearDropdown').node().value;
                const endYear = d3.select('#endYearDropdown').node().value;
                const startDate = d3.timeParse('%Y')(startYear);
                const endDate = d3.timeParse('%Y')(endYear);

                if (startDate > endDate) {
                    alert('Start Year cannot be greater than End Year.');
                    return;
                }
                filteredData = data.filter(d => d.REF_AREA === "WLD" && d.SEX === "Total" && d.MEASURE_CAT === "Calories" && d.TIME_PERIOD >= startDate && d.TIME_PERIOD < endDate);
                filteredData2 = data.filter(d => d.REF_AREA === "WLD" && d.SEX === "Total" && d.MEASURE_CAT === "Obese" && d.TIME_PERIOD >= startDate && d.TIME_PERIOD < endDate);
                break;
            case 'by_measures':
                const selectedMeasure = d3.select('#measureDropdown').node().value;
                filteredData = data.filter(d => d.REF_AREA === "WLD" && d.SEX === "Total" && d.MEASURE_CAT === selectedMeasure);
                filteredData2 = data.filter(d => d.REF_AREA === "WLD" && d.SEX === "Total" && d.MEASURE_CAT === "Obese");
                break;
            default:
                filteredData = data.filter(d => d.REF_AREA === "WLD" && d.SEX === "Total" && d.MEASURE_CAT === "Calories");
                filteredData2 = data.filter(d => d.REF_AREA === "WLD" && d.SEX === "Total" && d.MEASURE_CAT === "Obese");
        }

        filteredData.forEach(d => { d.OBS_VALUE = +d.OBS_VALUE; });
        filteredData2.forEach(d => { d.OBS_VALUE = +d.OBS_VALUE; });
        const categoryData1 = filteredData[0].MEASURE;
        const countryTag = (filteredData2.length > 0) ? (filteredData2[0].COUNTRY) : (filteredData[0].COUNTRY);



        const xScale = d3.scaleTime()
            .domain(d3.extent(filteredData, d => d.TIME_PERIOD))
            .range([0, width])
            .nice();

        const yScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.OBS_VALUE))
            .range([height, 0]);
        const tooltip = svg.append('g')
            .attr('class', 'tooltip')
            .style('opacity', 0);
        tooltip.append('rect')
            .attr('width', 200)
            .attr('height', 45)
            .attr('fill', 'white')
            //.style('stroke', 'black');
        tooltip.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .style('text-anchor', 'left')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold');
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .tickFormat(d3.timeFormat('%Y'))
                .ticks(d3.timeYear.every(5)));

        svg.append('g')
            .attr('class', 'y axis')
            .style('stroke', 'steelblue')
            .call(d3.axisLeft(yScale));
        const annotationText = 'The 90s decade was the inflection point, which <tspan> saw the highest YoY increase in obesity percentage' ;
        var lastDataPoint = filteredData[15];
        var reScaleX = xScale;
        var reScaleY = yScale;
        //Append axis label for Y1
        svg.append("text")
            .attr('class','label-y1')
            .attr("transform", "rotate(-90)")
            .attr("y", 50 - margin.left)
            .attr("x", 0 - (height / 3))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style('fill', 'white')
            .text(categoryData1);

        var labelY1 = svg.select('.label-y1').node();
        var boxY1 = labelY1.getBBox();

        svg.insert('rect', '.label-y1')
            .attr('x', boxY1.x - 5)
            .attr('y', boxY1.y - 5)
            .attr('width', boxY1.width + 10)
            .attr('height', boxY1.height + 10)
            .attr("transform", "rotate(-90)")
            .style('fill', 'steelblue')
            .style('opacity', 0.9);

        const line = d3.line()
            .x(d => xScale(d.TIME_PERIOD))
            .y(d => yScale(d.OBS_VALUE));

        svg.append('path')
            .datum(filteredData)
            .attr('class', 'line tooltip-trigger')
            .attr('d', line)
            .style('stroke', 'steelblue')
            .on('mouseover mousemove', function (event, d) {
                   const mX = d3.pointer(event)[0];
                   const mY = d3.pointer(event)[1];
                   const yearFormat = d3.timeFormat("%b %Y");
                   const numFormat = d3.format(",.2~f")
                   const mouseX = yearFormat(xScale.invert(mX));
                   const mouseY = numFormat(yScale.invert(mY));
                   tooltip.transition()
                       .duration(200)
                       .style('opacity', .9);

                      tooltip.select('text')
                           .text(null);

                        tooltip.select('text')
                            .append('tspan')
                            .text(`Date: ${mouseX}`)
                            .attr('x', mX+10)
                            .attr('y', mY);

                        tooltip.select('text')
                            .append('tspan')
                            .text(`${categoryData1}: ${mouseY}`)
                            .attr('x', mX+10)
                            .attr('y', mY+10 );

                   tooltip.select('rect')
                       .attr('x', mX -5)
                       .attr('y', mY -20)
                       .style('fill', 'lightblue');

            })
            .on('mouseout', function (event, d) {
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
            });

        if (filteredData2.length > 0) {
            const categoryData2 = filteredData2[0].MEASURE;
            const yScale2 = d3.scaleLinear()
                .domain(d3.extent(filteredData2, d => d.OBS_VALUE))
                .range([height, 0]);

            const line2 = d3.line()
                .x(d => xScale(d.TIME_PERIOD))
                .y(d => yScale2(d.OBS_VALUE));

            svg.append('path')
                .datum(filteredData2)
                .attr('class', 'line tooltip-trigger')
                .attr('d', line2)
                .style('stroke', 'green')
                .on('mouseover mousemove', function (event, d) {
                   const mX = d3.pointer(event)[0];
                   const mY = d3.pointer(event)[1];
                   const yearFormat = d3.timeFormat("%b %Y");
                   const numFormat = d3.format(",.2~f")
                   const mouseX = yearFormat(xScale.invert(mX));
                   const mouseY = numFormat(yScale2.invert(mY));
                      tooltip.transition()
                           .duration(200)
                           .style('opacity', .9);

                      tooltip.select('text')
                           .text(null);

                        tooltip.select('text')
                            .append('tspan')
                            .text(`Date: ${mouseX}`)
                            .attr('x', mX+10)
                            .attr('y', mY);

                        tooltip.select('text')
                            .append('tspan')
                            .text(`${categoryData2}: ${mouseY}`)
                            .attr('x', mX+10)
                            .attr('y', mY +10);

                        tooltip.select('rect')
                            .attr('x', mX - 5 )
                            .attr('y', mY - 20 )
                            .style('fill', 'lightgreen');

                })
                .on('mouseout', function (event, d) {
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });
            // Axis y2
            svg.append('g')
                .attr('class', 'y axis')
                .attr('transform', `translate(${width}, 0)`)
                .style('stroke', 'green')
                .call(d3.axisRight(yScale2));
            // Append axis label for y2
            svg.append("text")
                .attr('class','label-y2')
                .attr("transform", "rotate(90)")
                .attr("y", -width - margin.right+52)
                .attr("x", height / 3)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("fill", "white")
                .text(categoryData2);

            var labelY2 = svg.select('.label-y2').node();
            var boxY2 = labelY2.getBBox();

            svg.insert('rect', '.label-y2')
                .attr('x', boxY2.x - 5)
                .attr('y', boxY2.y - 5)
                .attr("dy", "-3em")
                .attr('width', boxY2.width + 10)
                .attr('height', boxY2.height + 10)
                .attr("transform", "rotate(90)")
                .style('fill', 'green')
                .style('opacity', 0.9);


        var test = filteredData2.map(obsValue =>({TIME_PERIOD:obsValue.TIME_PERIOD,OBS_VALUE:obsValue.OBS_VALUE}))
                                .filter(obsValue => d3.timeFormat('%Y')(obsValue.TIME_PERIOD)==='1990');
        var lastDataPoint = test;

        var reScaleX = xScale;
        var reScaleY = yScale2;
        }
        // Chart Title
        svg.append("text")
            .attr('class','title')
            .attr("y", 0)
            .attr("x",width/2)
            .style("text-anchor", "middle")
            .style('fill', 'white')
            .text(""+countryTag + " Data ");

        var textTitle = svg.select('.title').node();
        var boxTitle = textTitle.getBBox();

        svg.insert('rect', '.title')
            .attr('x', boxTitle.x - 10)
            .attr('y', boxTitle.y - 5)
            .attr('width', boxTitle.width + 20)
            .attr('height', boxTitle.height + 10)
            .style('fill', 'purple')
            .style('opacity', 0.9);

        // Append Annotation text
        svg.append('text')
            .attr('class', 'annotation')
            .attr('x', width - 10)
            .attr('y', reScaleY(lastDataPoint[0].OBS_VALUE ))
            .attr('text-anchor', 'end')
            .append("tspan")
            .attr("x", width - 10)
            .attr("dy", "1.3em")
            .text("The 90s decade was an inflection point, which saw")
            .append("tspan")
            .attr("x", width - 10)
            .attr("dy", "1.2em")
            .text("the highest YoY increase in obesity percentage");

        var textAnnotation = svg.select('.annotation').node();
        var boxAnnotation = textAnnotation.getBBox();

        svg.insert('rect', '.annotation')
            .attr('x', boxAnnotation.x - 5)
            .attr('y', boxAnnotation.y - 5)
            .attr('width', boxAnnotation.width + 10)
            .attr('height', boxAnnotation.height + 10)
            .style('fill', 'red')
            .style('opacity', 0.9);

        // Annotation end points
        const textX = width - 10; // X position of the text
        const textY = reScaleY(lastDataPoint[0].OBS_VALUE);
        const dataX = xScale(lastDataPoint[0].TIME_PERIOD);
        const dataY = reScaleY(lastDataPoint[0].OBS_VALUE);

        // Annotation connector line
        svg.append('line')
            .attr('x1', textX)
            .attr('y1', textY)
            .attr('x2', dataX)
            .attr('y2', dataY)
            .style('stroke', 'black')
            .style('stroke-width', 1)
            .style('stroke-dasharray', '3,3');

    }

    function initDropdowns() {
        switch (scene) {
            case 'by_country':
                const allCountries = [...new Set(data.map(d => d.COUNTRY))];
                const countries = allCountries.filter(country => country !== "World");
                countries.sort((a, b) => b.localeCompare(a));
                const allMeasures1 = [...new Set(data.map(d => d.MEASURE_CAT))];
                const measures1 = allMeasures1.filter(measure => measure !== "Obese");
                d3.select('#filters')
                    .append('label')
                    .attr('class','filter-label')
                    .attr('for', 'countryDropdown')
                    .attr('fill','maroon')
                    .text('Change Country: ');
                d3.select('#filters')
                    .append('select')
                    .attr('id', 'countryDropdown')
                    .selectAll('option')
                    .data(countries)
                    .enter().append('option')
                    .text(d => d)
                    .attr('value', d => d);
                d3.select('#filters')
                    .append('label')
                    .attr('class','filter-label')
                    .attr('for', 'measuresDropdown')
                    .text('  Change Measures:');
                d3.select('#filters')
                    .append('select')
                    .attr('id', 'measuresDropdown')
                    .selectAll('option')
                    .data(measures1)
                    .enter().append('option')
                    .text(d => d)
                    .attr('value', d => d);

                d3.select('#countryDropdown').on('change', updateChart);
                d3.select('#measuresDropdown').on('change', updateChart);
                break;
            case 'by_year':
                const allYears = data.map(d => d.TIME_PERIOD);
                const yearStart = [...new Set(allYears.map(d => d3.timeFormat('%Y')(d)))];
                const yearEnd = [...new Set(allYears.map(d => d3.timeFormat('%Y')(d)))];
                yearEnd.sort((a, b) => d3.descending(a, b));
                d3.select('#filters')
                    .append('label')
                    .attr('for', 'startYearDropdown')
                    .text('Start Year:')
                    .attr('class','filter-label');
                d3.select('#filters')
                    .append('select')
                    .attr('id', 'startYearDropdown')
                    .selectAll('option')
                    .data(yearStart)
                    .enter().append('option')
                    .text(d => d)
                    .attr('value', d => d);

                d3.select('#filters')
                    .append('label')
                    .attr('for', 'endYearDropdown')
                    .attr('class','filter-label')
                    .text('End Year:');

                d3.select('#filters')
                    .append('select')
                    .attr('id', 'endYearDropdown')
                    .selectAll('option')
                    .data(yearEnd)
                    .enter().append('option')
                    .text(d => d)
                    .attr('value', d => d);

                d3.select('#startYearDropdown').on('change', updateChart);
                d3.select('#endYearDropdown').on('change', updateChart);
                break;
            case 'by_measures':
                const allMeasures2 = [...new Set(data.map(d => d.MEASURE_CAT))];
                const measures2 = allMeasures2.filter(measure => measure !== "Obese");
                d3.select('#filters')
                    .append('label')
                    .attr('for', 'measureDropdown')
                    .attr('class','filter-label')
                    .text(' Change Obesity Factors: ');

                d3.select('#filters')
                    .append('select')
                    .attr('id', 'measureDropdown')
                    .selectAll('option')
                    .data(measures2)
                    .enter().append('option')
                    .text(d => d)
                    .attr('value', d => d);

                d3.select('#measureDropdown').on('change', updateChart);
                break;
            default:
                break;
        }
    }

    initDropdowns();

    updateChart();
}
}

d3.csv('./data/aggregate_data.csv').then(data => {
    window.data = data;

    data.forEach(d => {
        d.TIME_PERIOD = d3.timeParse('%m/%d/%Y')(d.TIME_PERIOD);
            d.OBS_VALUE = +d.OBS_VALUE;
    });

    setupScene('world');
});
