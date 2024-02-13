document.addEventListener('DOMContentLoaded', function () {
    const pitchButtons = document.querySelectorAll('.pitch-button');
    const resultButtons = document.querySelectorAll('.result-button');
    const inPlayOutcomeSelector = document.getElementById('inPlayOutcomeSelector');
    const typeOfPlaySelector = document.getElementById('typeOfPlaySelector');
    const qocSelector = document.getElementById('qocSelector');
    const logPitchButton = document.getElementById('logPitchButton');
    const undoButton = document.getElementById('undoButton');
    const pitchTableBody = document.getElementById('pitchTable').getElementsByTagName('tbody')[0];

    let pitches = [];
    let currentBatter = 1;
    let balls = 0;
    let strikes = 0;
    let selectedPitch = null;
    let selectedResult = null;
    let currentOuts = 0;
    let totalPitchCount = 0; // Initialize a global pitch count

    const exportCsvButton = document.getElementById('exportCsvButton');
    exportCsvButton.addEventListener('click', function() {
        const userConfirmed = confirm("Are you sure you want to save this file and end this session?");
        if (userConfirmed) {
            // Call the function to export the table data to CSV
            // You can customize the filename as needed
            exportTableToCSV('pitch_data.csv');
        }
    });

    // Reset selectors to their default state on page load
    resetSelectors();

    // Event listeners for pitch and result buttons
    pitchButtons.forEach(button => button.addEventListener('click', pitchButtonHandler));
    resultButtons.forEach(button => button.addEventListener('click', resultButtonHandler));

    // Event listeners for logging and undoing pitches
    logPitchButton.addEventListener('click', logPitch);
    undoButton.addEventListener('click', undoLastPitch);

    // Initialize the charts
    initializeCharts();

    function pitchButtonHandler() {
        selectedPitch = this.getAttribute('data-pitch');
        highlightButton(this, pitchButtons);
    }

    function resultButtonHandler() {
        selectedResult = this.getAttribute('data-result');
        highlightButton(this, resultButtons);
        toggleSelectorsBasedOnResult(selectedResult);
    }


    function logPitch() {
        if (!selectedPitch || !selectedResult) {
            alert("Please select both pitch type and result.");
            return;
        }
    
        // Increment pitch count
        totalPitchCount++;
    
        const inPlayOutcome = selectedResult === 'In Play' ? inPlayOutcomeSelector.value : '';
        const typeOfPlay = typeOfPlaySelector.value;
        const qoc = selectedResult === 'In Play' ? qocSelector.value : '';
    
        updateCount(selectedResult);
    
        let outsToAdd = 0;
        if (inPlayOutcome === 'Out') {
            outsToAdd = 1;
        } else if (typeOfPlay === 'Double Play') {
            outsToAdd = 2;
        } else if (typeOfPlay === 'Triple Play') {
            outsToAdd = 3;
        }
    
        currentOuts += outsToAdd;
    
        pitches.push({
            pitchCount: totalPitchCount,
            batter: currentBatter,
            pitchType: selectedPitch,
            result: selectedResult,
            count: `${balls}-${strikes}`,
            outcome: determineOutcome(inPlayOutcome),
            type: typeOfPlay,
            qoc,
        });
    
        updateTable();
        updateChartsData();
    
        if (balls >= 4 || strikes >= 3 || selectedResult === 'In Play') {
            moveToNextBatter();
        }
        resetSelectors();
    }

    function toggleSelectorsBasedOnResult(result) {
        const isDisabled = result !== 'In Play';
        inPlayOutcomeSelector.disabled = isDisabled;
        typeOfPlaySelector.disabled = isDisabled;
        qocSelector.disabled = isDisabled;
    }

    function updateChartsData() {
        // Calculate and update data for Pitch Usage Chart
        updatePitchUsageChartData();

        // Calculate and update data for Strike Percentage Chart
        updateStrikePercentageChartData();

        // Calculate and update data for Whiff Rate Chart
        updateWhiffRateChartData();

        // Calculate and update data for Quality of Contact
        updateQualityOfContactChartData(); 

        // Calculate and update data for 2of3 Chart
        update2of3ChartData();

    }

    function updatePitchUsageChartData() {
        let pitchCounts = {
            'Fastball': 0,
            'Curveball': 0,
            'Slider': 0,
            'Change Up': 0,
            'Other': 0
        };
    
        // Count the occurrences of each pitch type
        pitches.forEach(pitch => {
            if (pitchCounts.hasOwnProperty(pitch.pitchType)) {
                pitchCounts[pitch.pitchType]++;
            }
        });
    
        let totalPitches = pitches.length;
        let pitchPercentages = Object.values(pitchCounts).map(count => 
            totalPitches > 0 ? (count / totalPitches) * 100 : 0
        );
    
        updatePitchUsageChart(pitchPercentages);
    }

    function updateStrikePercentageChartData() {
        let strikeCounts = {
            'Fastball': 0,
            'Curveball': 0,
            'Slider': 0,
            'Change Up': 0,
            'Other': 0
        };
    
        let pitchTypeCounts = {
            'Fastball': 0,
            'Curveball': 0,
            'Slider': 0,
            'Change Up': 0,
            'Other': 0
        };
    
        // Accumulate counts for each pitch type and strikes
        pitches.forEach(pitch => {
            if (pitchTypeCounts.hasOwnProperty(pitch.pitchType)) {
                pitchTypeCounts[pitch.pitchType]++;
                // Updated condition to include 'Called Strike'
                if (pitch.result === 'Foul' || pitch.result === 'Whiff' || pitch.result === 'Called Strike' || (pitch.result === 'In Play' && pitch.outcome !== 'HBP')) {
                    strikeCounts[pitch.pitchType]++;
                }
            }
        });
    
        let strikePercentages = Object.keys(strikeCounts).map(type => 
            pitchTypeCounts[type] > 0 ? (strikeCounts[type] / pitchTypeCounts[type] * 100).toFixed(1) : 0
        );
    
        // Ensure this function exists in charts.js and is correctly defined to update the strike percentage chart
        updateStrikePercentageChart(strikePercentages);
    }

    function updateWhiffRateChartData() {
        let whiffCounts = {
            'Fastball': 0,
            'Curveball': 0,
            'Slider': 0,
            'Change Up': 0,
            'Other': 0
        };
    
        let pitchTypeCounts = {
            'Fastball': 0,
            'Curveball': 0,
            'Slider': 0,
            'Change Up': 0,
            'Other': 0
        };
    
        // Accumulate counts for each pitch type and whiffs
        pitches.forEach(pitch => {
            if (pitchTypeCounts.hasOwnProperty(pitch.pitchType)) {
                pitchTypeCounts[pitch.pitchType]++;
                if (pitch.result === 'Whiff') { // Check if the result is a whiff
                    whiffCounts[pitch.pitchType]++;
                }
            }
        });
    
        let whiffPercentages = Object.keys(whiffCounts).map(type => 
            pitchTypeCounts[type] > 0 ? (whiffCounts[type] / pitchTypeCounts[type] * 100).toFixed(1) : 0
        );
    
        // Call the function to update the chart with calculated data
        updateWhiffRateChart(whiffPercentages); // Make sure this function is defined in charts.js
    }
    
    function updateQualityOfContactChartData() {
        let qocCounts = {
            'Fastball': { 'Hard': 0, 'Regular': 0, 'Soft': 0 },
            'Curveball': { 'Hard': 0, 'Regular': 0, 'Soft': 0 },
            'Fastball': { 'Hard': 0, 'Regular': 0, 'Soft': 0 },
            'Curveball': { 'Hard': 0, 'Regular': 0, 'Soft': 0 },
            'Slider': { 'Hard': 0, 'Regular': 0, 'Soft': 0 },
            'Change Up': { 'Hard': 0, 'Regular': 0, 'Soft': 0 },
            'Other': { 'Hard': 0, 'Regular': 0, 'Soft': 0 },
        };

        let pitchTypeInPlayCounts = {
            'Fastball': 0,
            'Curveball': 0,
            'Slider': 0,
            'Change Up': 0,
            'Other': 0,
            
        };
    
        // Count QoC for each pitch type and total In Play pitches
    pitches.forEach(pitch => {
        if (pitch.qoc && qocCounts[pitch.pitchType] && pitch.result === 'In Play') {
            qocCounts[pitch.pitchType][pitch.qoc]++;
            pitchTypeInPlayCounts[pitch.pitchType]++;
        }
    });
    
       // Convert counts to percentages
    let hardData = [], regularData = [], softData = [];
    Object.keys(qocCounts).forEach(type => {
        let totalInPlay = pitchTypeInPlayCounts[type];
        hardData.push(totalInPlay > 0 ? (qocCounts[type]['Hard'] / totalInPlay * 100) : 0);
        regularData.push(totalInPlay > 0 ? (qocCounts[type]['Regular'] / totalInPlay * 100) : 0);
        softData.push(totalInPlay > 0 ? (qocCounts[type]['Soft'] / totalInPlay * 100) : 0);
    });

    updateQualityOfContactChart(hardData, regularData, softData);
    }

    function calculate2of3Counts() {
        let winCount = 0;
        let earlyCount = 0;
        let loseCount = 0;
        let battersProcessed = new Set();
    
        // Function to determine the outcome of the first 3 pitches or earlier if applicable
        const determineOutcome = (pitchesForBatter) => {
            let count = 0;
            for (let pitch of pitchesForBatter) {
                if (++count <= 3) {
                    if (['0-2', '1-2'].includes(pitch.count)) return 'win';
                    if (['2-0', '2-1'].includes(pitch.count)) return 'lose';
                    if (['0-0', '0-1', '1-0', '1-1'].includes(pitch.count) && pitch.result === 'In Play') return 'early';
                } else {
                    break; // Exit after checking the first 3 pitches
                }
            }
            return null; // No outcome determined in the first 3 pitches
        };
    
        // Organize pitches by batter
        let pitchesByBatter = {};
        pitches.forEach(pitch => {
            if (!pitchesByBatter[pitch.batter]) pitchesByBatter[pitch.batter] = [];
            pitchesByBatter[pitch.batter].push(pitch);
        });
    
        // Process each batter's pitches for the first outcome
        Object.keys(pitchesByBatter).forEach(batter => {
            if (!battersProcessed.has(batter)) {
                const outcome = determineOutcome(pitchesByBatter[batter]);
                if (outcome === 'win') winCount++;
                else if (outcome === 'early') earlyCount++;
                else if (outcome === 'lose') loseCount++;
    
                battersProcessed.add(batter); // Mark this batter as processed
            }
        });
    
        return { winCount, earlyCount, loseCount };
    }
    
    

    function update2of3ChartData() {
        // Directly call calculate2of3Counts here to get the counts
        const { winCount, earlyCount, loseCount } = calculate2of3Counts();
    
        // Assuming twoOfThreeChart is already initialized and is the chart instance
        if (twoOfThreeChart) {
            twoOfThreeChart.data.datasets[0].data[0] = winCount;
            twoOfThreeChart.data.datasets[0].data[1] = earlyCount;
            twoOfThreeChart.data.datasets[0].data[2] = loseCount;
            twoOfThreeChart.update();
        }
    }
    
    
    function updateCount(result) {
        if (result === 'Ball') {
            balls = Math.min(balls + 1, 4);
        } else if (['Called Strike', 'Whiff'].includes(result)) {
            strikes = Math.min(strikes + 1, 3);
        } else if (result === 'Foul') {
            if (strikes < 2) {
                strikes++;
            }
        }
    }

    function determineOutcome(inPlayOutcome) {
        if (balls >= 4) {
            return 'Walk';
        } else if (strikes >= 3) {
            return 'Strikeout';
        } else if (inPlayOutcome) {
            return inPlayOutcome;
        }
        return '';
    }

    function moveToNextBatter() {
        currentBatter = currentBatter % 9 + 1;
        // batterSelector.value = currentBatter.toString();
        balls = 0;
        strikes = 0;
        selectedPitch = null;
        selectedResult = null;
        resetButtonStyles(pitchButtons);
        resetButtonStyles(resultButtons);
    }

    // Handles the Pitch Table
    function updateTable() {
        pitchTableBody.innerHTML = '';
        pitches.forEach((pitch, index) => {
            const row = pitchTableBody.insertRow(0);
            row.insertCell(0).textContent = pitch.batter;
            row.insertCell(1).textContent = pitch.pitchCount;
            row.insertCell(2).textContent = pitch.pitchType;
            row.insertCell(3).textContent = pitch.result;
            row.insertCell(4).textContent = pitch.count;
            row.insertCell(5).textContent = pitch.outcome;
            row.insertCell(6).textContent = pitch.type || '';
            row.insertCell(7).textContent = pitch.qoc || '';
        });
    }

    function undoLastPitch() {
        if (pitches.length > 0) {
            const lastPitch = pitches.pop();
            // Decrement pitch count only if the last action wasn't an inning break
            if (!lastPitch.inningBreak) {
                totalPitchCount = Math.max(0, totalPitchCount - 1);
            }
    
            // Directly remove the last row from the table
            if (pitchTableBody.rows.length > 0) {
                pitchTableBody.deleteRow(0); // Removes the top row, which corresponds to the last action
            }    
    
            // Revert to the previous pitch's state if available
            if (pitches.length > 0) {
                const previousPitch = pitches[pitches.length - 1];
                currentBatter = previousPitch.batter;
                let previousCount = previousPitch.count.split('-');
                balls = parseInt(previousCount[0], 10);
                strikes = parseInt(previousCount[1], 10);
            } else {
                // If no pitches are left, reset to the initial state
                resetGameToInitialState();
            }
            
            // Correctly handle the pitch count and batter number display
            updateTable(true); // Passing true to indicate an undo operation
        }
        resetSelectors();
    }
    
    function resetGameToInitialState() {
        balls = 0;
        strikes = 0;
        currentBatter = 1; // Or however you track the starting batter
        currentOuts = 0;
    }    

    function resetSelectors() {
        inPlayOutcomeSelector.disabled = true;
        typeOfPlaySelector.disabled = true;
        qocSelector.disabled = true;

        // Set to default values if you have such options
        inPlayOutcomeSelector.value = ""; // Assuming "" maps to a default option like "Select..."
        typeOfPlaySelector.value = "";
        qocSelector.value = "";
    }

    function toggleSelectorsBasedOnResult(result) {
        const isEnabled = result === 'In Play';
        inPlayOutcomeSelector.disabled = !isEnabled;
        typeOfPlaySelector.disabled = !isEnabled;
        qocSelector.disabled = !isEnabled;

        if (!isEnabled) {
            // Optionally reset values to defaults when not 'In Play'
            inPlayOutcomeSelector.value = "";
            typeOfPlaySelector.value = "";
            qocSelector.value = "";
        }
    }

    function highlightButton(selectedButton, buttonGroup) {
        // Remove 'active' class from all buttons
        resetButtonStyles(buttonGroup);
        // Add 'active' class to the selected button
        selectedButton.classList.add('active');
    }
    
    function resetButtonStyles(buttonGroup) {
        buttonGroup.forEach(button => {
            button.classList.remove('active');
        });
    }
    

    // Download Data
    function exportTableToCSV(filename) {
        let csv = [];
        const rows = document.querySelectorAll("#pitchTable tr");
        
        for (let i = 0; i < rows.length; i++) {
            const row = [], cols = rows[i].querySelectorAll("td, th");
            
            for (let j = 0; j < cols.length; j++) {
                row.push(cols[j].innerText);
            }
            
            csv.push(row.join(","));        
        }
    
        // Download CSV file
        downloadCSV(csv.join("\n"), filename);
    }
    // Download Data
    function downloadCSV(csv, filename) {
        const csvFile = new Blob([csv], {type: "text/csv"});
        const downloadLink = document.createElement("a");
    
        downloadLink.download = filename;
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = "none";
    
        document.body.appendChild(downloadLink);
        downloadLink.click();
    }
});
