// Global chart variables
let pitchUsageChart;
let strikePercentageChart;
let whiffRateChart;
let qualityOfContactChart;
let twoOfThreeChart;

//Show percentages in charts (Global)
const percentageAlongBarPlugin = {
    id: 'percentageAlongBarPlugin',
    afterDatasetsDraw: function(chart, easing) {
        var ctx = chart.ctx;
        chart.data.datasets.forEach(function(dataset, i) {
            var meta = chart.getDatasetMeta(i);
            if (!meta.hidden) {
                meta.data.forEach(function(element, index) {
                    ctx.fillStyle = 'black';
                    var fontSize = 8;
                    ctx.font = Chart.helpers.fontString(fontSize, 'normal', 'Helvetica Neue');
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'middle';

                    var value = dataset.data[index];
                    var text = parseFloat(value).toFixed(1) + '%'; // Ensure value is treated as a float
                    var xPosition = chart.chartArea.right - 5; // Adjust as needed
                    var yPosition = element.tooltipPosition().y;

                    ctx.fillText(text, xPosition, yPosition);
                });
            }
        });
    }
};

// Register the plugin globally
// Chart.register(percentageAlongBarPlugin);

// Stacked bar graph percentages
const stackedBarPercentagePlugin = {
    id: 'stackedBarPercentagePlugin',
    afterDatasetsDraw: function(chart, easing) {
        var ctx = chart.ctx;
        chart.data.datasets.forEach(function(dataset, datasetIndex) {
            var meta = chart.getDatasetMeta(datasetIndex);
            if (!meta.hidden) {
                meta.data.forEach(function(element, index) {
                    const position = element.tooltipPosition();
                    let total = 0;
                    chart.data.datasets.forEach(dataset => {
                        total += dataset.data[index];
                    });

                    const segmentValue = dataset.data[index];
                    const percentage = ((segmentValue / total) * 100).toFixed(1) + '%';

                    // Calculate the position for the text, adjust as necessary
                    var xPosition = position.x;
                    var yPosition = position.y;

                    // Render text if there's enough space (may need to adjust this logic)
                    if (segmentValue / total > 0.1) {
                        ctx.fillStyle = 'black'; // Text color
                        ctx.font = Chart.helpers.fontString(10, 'normal', 'Helvetica Neue');
                        ctx.textAlign = 'right';
                        ctx.fillText(percentage, xPosition, yPosition);
                    }
                });
            }
        });
    }
};


// Initializes the Pitch Usage Chart
function initializePitchUsageChart() {
    const ctxPitchUsage = document.getElementById('pitchUsageCanvas').getContext('2d');
    if (pitchUsageChart) {
        pitchUsageChart.destroy(); // Destroy the existing chart
    }
    pitchUsageChart = new Chart(ctxPitchUsage, {
        type: 'bar',
        data: {
            labels: ['Fastball', 'Curveball', 'Slider', 'Change', 'Other'],
            datasets: [{
                label: 'Pitch Usage (%)',
                data: [],
                backgroundColor: [
                    '#f78b9c',
                    '#f2c38f',
                    '#62b6ef', 
                    '#2bb673', 
                    '#bb87e8'],
                borderColor: [
                    'red', 
                    'orange', 
                    'blue', 
                    'green', 
                    'purple'], // Matching or contrasting border colors
                borderWidth: 1,
            }]
        },
        options: {
            ...getChartOptions('Pitch Usage Chart'), // Pass the title for this chart 
        },
        plugins: [percentageAlongBarPlugin] // Apply the plugin locally     
    });
}

// Initializes the Strike Percentage Chart
function initializeStrikePercentageChart() {
    const ctxStrikePercentage = document.getElementById('strikePercentageCanvas').getContext('2d');
    if (strikePercentageChart) {
        strikePercentageChart.destroy(); // Destroy the existing chart
    }
    strikePercentageChart = new Chart(ctxStrikePercentage, {
        type: 'bar',
        data: {
            labels: ['Fastball', 'Curveball', 'Slider', 'Change', 'Other'],
            datasets: [{
                label: 'Strike Percentage (%)',
                data: [],
                backgroundColor: [
                    '#f78b9c',
                    '#f2c38f',
                    '#62b6ef', 
                    '#2bb673', 
                    '#bb87e8'],
                borderColor: [
                    'red', 
                    'orange', 
                    'blue', 
                    'green', 
                    'purple'], // Matching or contrasting border colors
                borderWidth: 1,
            }]
        },
        options: {
            ...getChartOptions('Strike Percentage'), // Pass the title for this chart
        },
        plugins: [percentageAlongBarPlugin] // Apply the plugin locally
    });
}

//Initialize Whiff Rate Chart
function initializeWhiffRateChart() {
    const ctx = document.getElementById('whiffRateCanvas').getContext('2d');
    if (whiffRateChart) {
        whiffRateChart.destroy(); // Destroy the existing chart
    }
    whiffRateChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Fastball', 'Curveball', 'Slider', 'Change', 'Other'],
            datasets: [{
                label: 'Whiff Rate (%)',
                data: [0, 0, 0, 0, 0], // Initialize with zeros
                backgroundColor: [
                    '#f78b9c',
                    '#f2c38f',
                    '#62b6ef', 
                    '#2bb673', 
                    '#bb87e8'],
                borderColor: [
                    'red', 
                    'orange', 
                    'blue', 
                    'green', 
                    'purple'], // Matching or contrasting border colors
                borderWidth: 1,
            }]
        },
        options: {
            ...getChartOptions('Whiff Rate Chart'),
        },            
        plugins: [percentageAlongBarPlugin] // Apply the plugin locally
    });
}

//Initialize QoC Chart
function initializeQualityOfContactChart() {
    const ctx = document.getElementById('qualityOfContactCanvas').getContext('2d');
    if (qualityOfContactChart) {
        qualityOfContactChart.destroy(); // Destroy the existing chart
    }
    qualityOfContactChart = new Chart(ctx, {
        type: 'bar', // Keeps as 'bar' but we'll change orientation via options
        data: {
            labels: ['Fastball', 'Curveball', 'Slider', 'Change', 'Other'],
            datasets: [
                {
                    label: 'Hard',
                    data: [0, 0, 0, 0, 0], // Initial data set to 0
                    backgroundColor: '#f78b92',
                    borderColor: 'red', // Consistent border color across datasets
                    borderWidth: 1, // Consistent border width
                    stack: 'Stack 0', // Ensure all datasets are in the same stack
                },
                {
                    label: 'Regular',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: '#f2c38f',
                    borderColor: 'orange', // Consistent border color across datasets
                    borderWidth: 1, // Consistent border width
                    stack: 'Stack 0',
                },
                {
                    label: 'Soft',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: '#62b6ef',
                    borderColor: 'blue', // Consistent border color across datasets
                    borderWidth: 1, // Consistent border width
                    stack: 'Stack 0',
                }
            ]
        },
        options: {
            indexAxis: 'y', // This changes the chart to horizontal
            scales: {
                x: {
                    stacked: true, // Enable stacking on the horizontal axis
                    min: 0,
                    max: 100,
                    ticks: {
                        // Format ticks to display as percentages
                        callback: function(value) {
                            return `${value}%`;
                        }},
                },
                y: {
                    stacked: true, // Enable stacking on the vertical axis as well for horizontal bars
                }
            },
            plugins: {
                // Apply any plugin configurations here, e.g., title, legend adjustments
            },
        },
        plugins: [stackedBarPercentagePlugin]
    });
}
// Initializes 2of3Chart()
function initialize2of3Chart() {
    const ctx2of3 = document.getElementById('2of3ChartCanvas').getContext('2d');
    if (twoOfThreeChart) {
        twoOfThreeChart.destroy(); // Destroy the existing chart if it exists
    }
    twoOfThreeChart = new Chart(ctx2of3, {
        type: 'bar',
        data: {
            labels: ['Win', 'Early', 'Lose'],
            datasets: [{
                label: '2 of 3 Outcome',
                data: [0, 0, 0], // Initial data, will be updated dynamically
                backgroundColor: [
                    '#2bb673', // Green
                    '#f2c38f', // Yellow
                    '#f78b9c', // Red
                ],
                borderColor: [
                    'green', 
                    'orange',  
                    'red',
                ],
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'First 2 of 3', // The title you want to give to the chart
                    font: {
                        size: 12 // You can adjust the font size as needed
                    }
                },
                legend: {
                    display: false, // If you want to display the legend, set this to true
                    position: 'top', // Position of the legend, can be 'top', 'bottom', etc.
                }
            },
        }
    });
}



// Updates the Pitch Usage Chart data
function updatePitchUsageChart(data) {
    pitchUsageChart.data.datasets[0].data = data;
    pitchUsageChart.update();
}

// Updates the Strike Percentage Chart data
function updateStrikePercentageChart(data) {
    strikePercentageChart.data.datasets[0].data = data;
    strikePercentageChart.update();
}

// Updates the Whiff Rate Chart data
function updateWhiffRateChart(data) {
    whiffRateChart.data.datasets[0].data = data;
    whiffRateChart.update();
}

// Updates QoC Chart Data
function updateQualityOfContactChart(hardData, regularData, softData) {
    qualityOfContactChart.data.datasets[0].data = hardData;
    qualityOfContactChart.data.datasets[1].data = regularData;
    qualityOfContactChart.data.datasets[2].data = softData;
    qualityOfContactChart.update();
}

//Update 2of3 Chart Data
function update2of3ChartData(winCount, earlyCount, loseCount) {
    twoOfThreeChart.data.datasets[0].data = [winCount, earlyCount, loseCount];
    twoOfThreeChart.update();
}

// Returns common chart options to avoid duplication
function getChartOptions(titleText) {
    return {
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: titleText,
                padding: {
                    top: 5,
                    bottom: 5
                },
                font: {
                    size: 12
                }
            }
        },
        layout: {
            padding: {
                right: 20 // Adjust this value as needed to fit the percentage labels
            }
        },
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                max: 100, // Ensure the scale is suitable for percentage values
                ticks: {
                    callback: function(value) {
                        return value + "%";
                    }
                }
            },
            y: {
                beginAtZero: true
            }
        },
        maintainAspectRatio: true,
        responsive: true,
    };
}

// Initial setup function that's called from scripts.js
function initializeCharts() {
    initializePitchUsageChart();
    initializeStrikePercentageChart();
    initializeWhiffRateChart();
    initializeQualityOfContactChart();
    initialize2of3Chart();
}
