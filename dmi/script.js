
/* The data array that holds the csv values */
var dataArray;

/* Keeps track which mode the table is in (regular / clusters) */
var clusterMode = false;

/* Converts the csv to a 2d array */
function csvToArray(csvData) {
  var rows = csvData.split('\n');
  var dataArray = [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i].split(',');
    dataArray.push(row);
  }
  return dataArray;
}

/* Re-writes / reloads the table */
function loadData() {
    var table = $('#csv-table');
    var tbody = table.find('tbody');

    /* Adds the cluster column if clusterMode is active */
    if (clusterMode) {
        if ($('#table-header').children('#cluster-header').length === 0) {
            $('#table-header').append('<th id=\"cluster-header\" class=\"headers text-center\">Clusters</th>');
        }
    } else {
        $('#cluster-header').remove();
    }

    /* Clears the table to prevent overwriting to it */
    tbody.empty()

    /* Sort the array based on the index */
    dataArray.sort(function(a, b) {
        return b[5] - a[5];
    });

    /* Keeps track of the rank of the current row */
    var rank = 1;
    
    /* Add table body */
    for (var i = 1; i < dataArray.length - 1; i++) {
        var row = $('<tr class=\"row-line\"></tr>');
        var cols = dataArray[i];

        /* Adds the rank */
        row.append('<td id=\"' + i + '-' + j + '\" class=\"row-header\">' + String(rank) + '</td>');
        
        /* Adds everything except the cluster */
        for (var j = 0; j < cols.length - 2; j++) {
            var content = cols[j].trim();
            if (j >= 1 && j <= 4) {
                content = parseFloat(content).toFixed(3);
                row.append('<td id=\"' + i + '-' + j + '\" contenteditable class=\"rows\">' + String(content) + '</td>');
            } else if (j === 5) {
                content = parseFloat(content).toFixed(3);
                row.append('<td id=\"' + i + '-' + j + '\" class=\"rows\">' + String(content) + '</td>');
            } else {
                row.append('<td id=\"' + i + '-' + j + '\" class=\"rows\">' + String(content) + '</td>');
            }
        }

        if (clusterMode) {
            row.append('<td id=\"' + i + '-' + 6 + '\" class=\"rows text-center\">' + String(cols[6]) + '</td>');
        }

        rank += 1;
        tbody.append(row);
    }
}

/* Load the table and convert csv to array upon document load */
$(document).ready(function() {
    $.get('./dmi_2023_clusters.csv', function(data) {
        dataArray = csvToArray(data);

        loadData(dataArray); 
    });
});

/* Formats the string into a 5 digit number */
function formatNumber(str) {
    // var decimalIndex = str.indexOf(".");
    // if (decimalIndex === -1) {
    //     str += ".000";
    //     decimalIndex = str.indexOf(".");
    // }
    // var numDecimals = str.length - decimalIndex - 1;
    // if (numDecimals === 0) {
    //     str += "00";
    // } else if (numDecimals === 1) {
    //     str += "0";
    // }
    
    // return Number.parseFloat(str).toFixed(2);

    return Number.parseFloat(str);
  }


/* Restricts what keys can be entered, and handles exiting cell if entered or escape is pressed */
$(document).on('keydown', '#csv-table td[contenteditable]', function(e) {
    switch (e.which) {
        case 8: // Backspace
            break;
        case 13: // Enter
            e.preventDefault();
            $(this).blur();
            break;
        case 27: // Escape
            e.preventDefault();
            $(this).blur();
            break;
        case 37: // Left
            break;
        case 39: // Right
            break;
        case 190: // Decimal
            if ($(this).text().length >= 5) {
                e.preventDefault();
            } else if ($(this).text().includes('.')) {
                e.preventDefault();
            }
            break;
        default:
            // console.log(e.which);
            if ($(this).text().length >= 5) {
                e.preventDefault();
            } else if (e.which < 47 || e.which > 57) {
                e.preventDefault();
            }
    }
});

// ====================== CALCULATIONS ====================== \\
$('#clusters-toggle').click(function() {
    clusterMode = !clusterMode;
    loadData(dataArray);
})


/* Handles calculating index, sorting the rows, and reloading the table when the cell is exited */
$(document).on('blur', '#csv-table td[contenteditable]', function() {
    // var changed = false;
    var text = $(this).text();
    var textLength = text.length;
    if (textLength === 0) {
        $(this).text('0.000');
        // changed = true;
    } else {
        $(this).text(formatNumber(text));
    }

    var idParts = $(this).attr('id').split('-');
    var rowIndex = parseInt(idParts[0]);
    var colIndex = parseInt(idParts[1]);
    let difference = $(this).text() - dataArray[rowIndex][colIndex];

    dataArray[rowIndex][colIndex] = $(this).text();


    if (clusterMode) {
        /* Calculate the P1 - P4 in the case of an active clusters mode */
        for (let i = 1; i < dataArray.length - 1; i++) {
            let cluster = dataArray[i][6];
            let oldValue = parseFloat(dataArray[i][colIndex]);
            let newValue = oldValue + (difference * cluster);

            dataArray[i][colIndex] = newValue.toFixed(3);

            var sum = parseFloat(dataArray[i][1]) + parseFloat(dataArray[i][2]) + parseFloat(dataArray[i][3]) + parseFloat(dataArray[i][4]);
            var average = sum / 4;
            dataArray[i][5] = average.toFixed(3);
        }
    } else {
        /* Update the index's value to the new average */
        var sum = parseFloat(dataArray[rowIndex][1]) + parseFloat(dataArray[rowIndex][2]) + parseFloat(dataArray[rowIndex][3]) + parseFloat(dataArray[rowIndex][4]);
        var average = sum / 4;
        dataArray[rowIndex][5] = average.toFixed(3);
    }
    
    loadData(dataArray);
});

