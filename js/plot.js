function setupScene(scene) {
    // Remove any existing SVG elements to clear the chart
    d3.select('#chart svg').remove();

    // Clear filters section to avoid duplicate appends
    d3.select('#filters').html('');

    // Define filteredData and filteredData2 as arrays to hold data for two lines/columns
    let filteredData = [];
    let filteredData2 = [];

    // Setup SVG/chart and margins
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Function to update chart based on the selected filters
    function updateChart() {
}
    // Function to build dropdowns filters based on specific data columns.
    function initDropdowns() {

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
