var portfolioHistory = [];
var cashHistory = [];
var combinedHistory = [];
var chartRendered = true

var chart = new CanvasJS.Chart("chartContainer", {
  // exportEnabled: true,
  theme: "light2",
  animationEnabled: false,
  animationDuration: 1000,
  interactivityEnabled: true,
  axisY: {
    includeZero: false
  },
  axisX: {
    valueFormatString: "h:mm:ss tt"
  },
  data: [{
    showInLegend: true,
    lineColor: "black",
    name: "Portfolio",
    type: "line",
    markerSize: 0,
    dataPoints: portfolioHistory,
    yValueFormatString: "$########.##",
    xValueType: "dateTime"
  }, {
    showInLegend: true,
    lineColor: "green",
    name: "Cash",
    type: "line",
    markerSize: 0,
    dataPoints: cashHistory,
    yValueFormatString: "$########.##",
    xValueType: "dateTime"
  }, {
    showInLegend: true,
    lineColor: "orange",
    name: "PF + Cash",
    type: "line",
    markerSize: 0,
    dataPoints: combinedHistory,
    yValueFormatString: "$########.##",
    xValueType: "dateTime"
  }],
  height: $('#chartContainer').height(),
  legend: {
    verticalAlign: "top",
    horizontalAlign: "right",
    dockInsidePlotArea: true
  },
  toolTip: {
    shared: true,
    animationEnabled: true,
    contentFormatter: function(e) {

      ttDate = getFormattedDate(Number(e.entries[0].dataPoint.x))
      lines = [ttDate]

      var sortable = [];
      for (var entry in e.entries) {
        d = e.entries[entry]
        sortable.push([d.dataSeries.name, d.dataPoint.y, d.dataSeries.lineColor]);
      }
      sortable.sort(function(a, b) {
        return b[1] - a[1];
      });

      for (var entry in sortable) {
        d = sortable[entry]
        lines.push("<span class='text-bold text-monospace' style='color:" + d[2] + "'>" + d[0] + "~$" +
          numberFormat(d[1]) + "</span>")
      }

      longest = 0

      for (var l in lines) {
        if (lines[l].length > longest) {
          longest = lines[l].length
        }
      }
      for (var l in lines) {
        d = lines[l]
        numSpaces = longest + 5 - d.length
        if (d.length == longest) {
          numSpaces += 1
        }
        lines[l] = lines[l].toString().replace("~", ("&nbsp;".repeat(numSpaces)))
        // console.log(d);
        // console.log(lines[l]);
      }

      return lines.join("<br>")
      // return "Custom ToolTip" +  e.entries[0].dataPoint.y;
    }

  }
})

var dataLength = 90;


var updateChart = function(count, initial) {
  count = count || 1;
  initial = initial || false;
  // count is number of times loop runs to generate random dataPoints.
  for (var j = 0; j < count; j++) {

    pWorth = 0.00

    for (var stock in stockData) {
      if (stockData.hasOwnProperty(stock)) {
        s = stockData[stock]
        pWorth += Number(s["price"] * s["ownedQuantity"])
      }
    }
    if (!initial) {
      xVal = Date.now()
    } else {
      xVal = Date.now() - j
    }


    // For updating portfolioHistory value
    portfolioHistory.push({
      x: xVal,
      y: roundToTwo(pWorth)
    });

    // For updating cashHistory values
    cashHistory.push({
      x: xVal,
      y: wallet.cash
    });

    // For updating combinedHistory values
    combinedHistory.push({
      x: xVal,
      y: Number(wallet.cash + pWorth)
    });

    if (count == 1) {
      if (pWorth < 0) {
        $('#portfolioWorth')[0].style.color = "#dc3545"
      } else {
        $('#portfolioWorth')[0].style.color = "#28a745"
      }
    }
    if (count == 1) {
      if (wallet.cash < 0) {
        $('#cashAmt')[0].style.color = "#dc3545"
      } else {
        $('#cashAmt')[0].style.color = "#28a745"
      }
    }



  }
  if (portfolioHistory.length > dataLength) {
    portfolioHistory.shift();
  }
  if (cashHistory.length > dataLength) {
    cashHistory.shift();
  }
  if (combinedHistory.length > dataLength) {
    combinedHistory.shift();
  }


  // chartHeight = ($('#chartOuter').height() - $('#chartTitle').height() - 10) + "px"
  // document.getElementById("chartContainer").style.height = chartHeight;

  $('#portfolioWorth').text("$" + numberFormat(pWorth))
  $('#cashAmt').text("$" + numberFormat(wallet.cash))

  chart.render();
};

// updateChart(dataLength, true);


setTimeout(function() {
  chartRendered = true;
  // console.log("chart.js - Chart finished rendering.")
}, 1000)
