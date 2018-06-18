var userDataLoaded = false;
var sheetsDataLoaded = false;
var beenBefore = false
// var cash = 5000.00
var portfolioWorth = 0
var oohCheckDone = false;
var outOfHours = false;
var initialDataLoaded = false;
var loadingAttempts = 0;
var newLoopStarted = false;
var timeStarted = Date.now()
var chartRendered = false;
var stop = false
var allowQueries = true;
var apiCallFreq = 5000;

var wallet = new class {
  constructor() {
    this.__cash = 5000
  }

  get cash() {
    var t = this.__cash
    return Number(t.toFixed(2))
  }

  updateCash(amt) {
    this.__cash = Number(amt)
  }

  spendMoney(amt) {
    amt = Math.abs(Number(amt))

    if (this.__cash >= amt) {
      this.__cash = Number(this.__cash - amt)
      return true
    } else {
      return false
    }
  }

  giveMoney(amt) {
    amt = Math.abs(Number(amt))

    this.__cash = Number(this.__cash + amt)
  }

  erase() {
    this.__cash = 5000
  }

}

// Check local storage for beenBefore 'cookie'
function checkUser() {
  if (localStorage.getItem("beenBefore") === null) {;
    setTimeout(function() {
      summonModal('Welcome!', "Welcome to Ben's Share Trading game! <br><br> Your goal in this game, well, isn't it obvious already? No? Ok. You have to get as rich as possible as quickly as possible. Simple? Simple. Have fun!");
    }, 750);
    localStorage.setItem("beenBefore", true);
    saveUserData();
  } else if (localStorage.getItem("beenBefore")) {
    ff = setInterval(function() {
      if (sheetsDataLoaded) {
        clearInterval(ff);
        loadUserData();

      }
    }, 100)
  }
}

$(document).ready(function() {

  // Test vars
  // allowQueries = false
  // $("#loading").hide()

  $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
    // doLog(settings.url)
    if (settings.url == "ajax/missing.html") {
      $("div.log").text("Triggered ajaxError handler.");
    }
  });

  $('[data-toggle="tooltip"]').tooltip();

})

var mainLoopTime = 1000;
var starterLoopTime = 500;
var lastCheck = Date.now() - 60000

var starterLoop = setInterval(main, starterLoopTime)

function main() {

  if (chartRendered) {

    if (initialDataLoaded) {
      updateChart();
      if (userDataLoaded) {
        saveUserData();
        // populateStockTable();
      }
    }


    // $("#loading-reason").html(loadingReasons[loadingReasonIndex])


    currentHours = new Date().getHours()
    currentDay = new Date().getDay()
    if (currentHours >= 16 || currentHours < 10) { // only check for new data within trading hours
      outOfHours = true
    } else if (currentDay == 0 || currentDay == 6) {
      outOfHours = true
    } else {
      outOfHours = false
      oohCheckDone = false
    }

    if (!outOfHours) {
      $('#marketStatusIndicator').text("Market Open")
      $('#marketStatusIndicator')[0].style.color = "green"
    } else {
      $('#marketStatusIndicator').text("Market Closed")
      $('#marketStatusIndicator')[0].style.color = "red"
    }

    if (Date.now() - lastCheck >= 59000) {

      if (!outOfHours || !oohCheckDone) {
        oohString = ""
        if (outOfHours) {
          oohString = " - OUT OF HRS"
        }
        doLog("Refreshing data." + oohString);
        $("#dataFetchStatus").html("Fetching <i class='fas fa-circle-notch fa-spin'></i>")
        if (loadingAttempts == 0) {
          $("#loading-reason").text("Fetching stocks data...")
        }
        loadNewAlphaData()
        lastCheck = Date.now()
      } else {
        // doLog("Not refreshing data - out of hours.");
        lastCheck = Date.now()
      }

      if (outOfHours) {
        oohCheckDone = true
      }
    }

    nzc=false
    nzCount=0
    if (!initialDataLoaded) {
      for (var s in stockData) {
        if (stockData.hasOwnProperty(s)) {
          s=stockData[s]
          if (s.price != 0) {
            nzCount += 1
          }
        }
      }
      if (nzCount >= Object.keys(stockData).length) {
        nzc = true;
      }
    }

    if ((dataUpdates >= Object.keys(stockData).length && sheetsDataLoaded) || (nzc && sheetsDataLoaded)) {
      dataUpdates = 0
      doLog("Data refresh completed.");
      $("#loading-reason").text("Done!")
      setTimeout(function() {
          $('#loading').fadeOut();
      }, 1000)

      // lastCheck = Date.now()

      initialDataLoaded = true;
      loadingAttempts = 0;
      populateStockTable()

      $("#dataFetchStatus").html("Latest Data <i class='fas fa-check'></i>")

      setTimeout(function() {
        nextCheckTime = new Date(lastCheck + 60000)
        if (!outOfHours) {
          nextCheck = ("0" + nextCheckTime.getHours()).slice(-2) + ":" + ("0" + nextCheckTime.getMinutes()).slice(-2) + ":" + ("0" + nextCheckTime.getSeconds()).slice(-2)
        } else {
          nextCheck = "10:00:00"
        }
        $("#dataFetchStatus").html("Next check at " + nextCheck)
      }, 3000)

      priceColArray = $(".price-column")

      flashElements(priceColArray, "blue")

      // for (var element in priceColArray) {
      //   if (priceColArray.hasOwnProperty(element)) {
      //     $(priceColArray[element]).addClass("flash")
      //   }
      // }
      //
      // setTimeout(function() {
      //
      //   for (var element in priceColArray) {
      //     if (priceColArray.hasOwnProperty(element)) {
      //       $(element).removeClass("flash")
      //     }
      //   }
      // }, 1000)
    }
  }

  if (!initialDataLoaded) {
    if (Date.now() - lastCheck >= 30000) {
      if (dataUpdates != Object.keys(stockData).length && Object.keys(stockData).length != 0) {
        loadingAttempts++;
        doLog("Data fetch error #" + loadingAttempts + " - Retrying...");
        oohCheckDone = false
        lastCheck -= 60000
        if (loadingAttempts > 4) {
          $("#loading-reason").html("Something seems to be broken.<br>Try again later.")
        } else if (loadingAttempts > 2) {
          $("#loading-reason").text("This seems to be taking longer than usual...")
        }
      }
    }
  }

  if (initialDataLoaded && !newLoopStarted) {
    doLog("All data loaded.");
    updateChart(dataLength, true);
    clearInterval(starterLoop)
    newLoopStarted = true;
    setInterval(main, mainLoopTime)
  }

  if (stop) {
    clearInterval()
  }

}
