
/* The data array that holds the csv values */
var dataArray;

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

    /* Clears the table to prevent overwriting to it */
    tbody.empty()

    var rank = 1;
    
    /* Add table body */
    for (var i = 1; i < dataArray.length; i++) {
        var row = $('<tr class=\"row-line\"></tr>');
        var cols = dataArray[i];
        for (var j = 1; j < cols.length; j++) {
            var content = cols[j].trim();
            if (j >= 3 && j <= 7) {
                content = parseFloat(content).toFixed(3);
            }
            if (j == 1) {
                row.append('<td id=\"' + i + '-' + j + '\" class=\"row-header\">' + String(rank) + '</td>');
            } else if (j >= 3 && j <= 6) {
                row.append('<td id=\"' + i + '-' + j + '\" contenteditable class=\"rows\">' + String(content) + '</td>');
            } else if (j == 8) {
                row.append('<td id=\"' + i + '-' + j + '\" class=\"rows text-center\">' + String(content) + '</td>');
            } else {
                row.append('<td id=\"' + i + '-' + j + '\" class=\"rows\">' + String(content) + '</td>');
            }
        }

        rank += 1;
        tbody.append(row);
    }
}

/* Load the table and convert csv to array upon document load */
$(document).ready(function() {
    $.get('./dmi_2023_.csv', function(data) {
        dataArray = csvToArray(data);

        loadData(dataArray); 
    });
});

/* Formats the string into a 5 digit number */
function formatNumber(str) {
    var decimalIndex = str.indexOf(".");
    if (decimalIndex === -1) {
        str += ".000";
        decimalIndex = str.indexOf(".");
    }
    var numDecimals = str.length - decimalIndex - 1;
    if (numDecimals === 0) {
        str += "00";
    } else if (numDecimals === 1) {
        str += "0";
    }
    
    return Number.parseFloat(str).toFixed(2);
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

    dataArray[rowIndex][colIndex] = $(this).text();

    var sum = parseFloat(dataArray[rowIndex][3]) + parseFloat(dataArray[rowIndex][4]) + parseFloat(dataArray[rowIndex][5]) + parseFloat(dataArray[rowIndex][6]);
    var average = sum / 4;
    // console.log("Average : " + average);

    // Update Index's average value
    dataArray[rowIndex][7] = average.toFixed(3);
    dataArray.sort(function(a, b) {
        return b[7] - a[7];
    });
    loadData(dataArray);
});

