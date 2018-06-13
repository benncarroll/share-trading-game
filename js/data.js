var obj;
var av_data;
var dataUpdates = 0;

class StockClass {
  constructor(name, fullName) {
    this.__stockCode = name;
    this.__fullName = fullName;
    this.__ownedQuantity = 0;
    this.__price = 0;
    this.__pDayClose = 0;
    this.__movement = 0;
    this.__data = {};
    this.__key = "";
    this.__lastFetch = 0;
    this.__checkInterval = 20000;
  }

  get name() {
    return this.__stockCode
  }
  get ownedQuantity() {
    return Number(this.__ownedQuantity)
  }
  get price() {
    return Number(this.__price)
  }
  get movement() {

    return this.__movement
  }
  get data() {
    return this.__data
  }
  get fullName() {
    return this.__fullName;
  }

  setKey(x) {
    this.__key = x.toString()
  }
  setPrice(x) {
    try {
      if (x == "") throw "Price was provided empty.";
      if (isNaN(x)) throw "Price provided was not a number.";
      this.__price = Number(x);
    } catch (e) {
      doLog("StockClass error - " + e)
    }
  }
  setOwnedQuantity(x) {
    try {
      if (x == "") {
        x = 0
      };
      if (isNaN(x)) throw "OQ provided was not a number.";
      this.__ownedQuantity = Number(x);
    } catch (e) {
      doLog("Stock Listing Error - " + e)
    }

  }
  setData(x) {
    this.__data = x
  }
  setPDayClose(x) {
    try {
      if (x == "") throw "Price was provided empty.";
      if (isNaN(x)) throw "Price provided was not a number.";
      this.__pDayClose = Number(x);
    } catch (e) {
      doLog("StockClass error - " + e)
    }
  }

  fetchPrice(rl = false) {
    if (this.__key != "") {
      var b = this.__checkInterval
      if (this.__price == 0) {
        b = 5000
      }
      var a = this.__lastFetch <= Date.now() + b
      if (a) {
        // doLog(this.__stockCode + " - FP called.")
        this.__lastFetch = Date.now()

        var av_query_url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + this.__stockCode + ".AX&interval=1min&apikey=" + this.__key;
        var brokenObj = false;

        var me = this;

        if (allowQueries) {
          $.get(av_query_url, function(loadedAlphaData) {

            if (loadedAlphaData["Meta Data"] == undefined) {
              brokenObj = true
            }

            if (!brokenObj && loadedAlphaData != undefined) {
              // console.log("Hit");
              var obj = loadedAlphaData;
              me.__data = obj;
              var objKeys = Object.keys(obj["Time Series (1min)"])
              me.__price = (Number(obj["Time Series (1min)"][objKeys.sort()[objKeys.length - 1]]["4. close"]))
              // doLog(`Set price of ${me.__stockCode} to ${me.__price}`)
              dataUpdates += 1
              this.__lastFetch = Date.now() + 50000
              // debugger;

            } else {
              // dataUpdates -= 1
              doLog("Failed - " + av_query_url)
            }
          });
        }
      }
      if (rl) {
        populateStockTable()
      }
    }
  }

  tradeShares(amount, buySell) {

    var didErr = false
    var quantity = 0;

    if (this.__price != 0) {
      if ($.isNumeric(amount)) {
        amount = Math.floor(Math.abs(amount))

        if (buySell == "buy") { // Buy shares

          quantity = Math.min(amount, Math.floor(wallet.cash / this.price))

          var cost = Number(this.price * quantity).toFixed(2)

          if (quantity == 0) {
            doLog("You cannot buy any more of this stock!")

          } else {
            if (wallet.spendMoney(cost)) {
              this.__ownedQuantity += Number(quantity)
            } else {
              doLog("Not enough cash.")
            }
          }

        } else if (buySell == "sell") { // Sell shares

          var quantity = Math.min(amount, this.__ownedQuantity)

          var repayment = (this.__price * quantity).toFixed(2)
          this.__ownedQuantity -= quantity

          wallet.giveMoney(repayment)

        }
        // } else {
        //   doLog("tradeShares error - stock doesn't exist");
        //   didErr = true
        // }
      } else {
        doLog("tradeShares error - amount isnt integer");
        didErr = true
      }
    } else {
      doLog("tradeShares error - price is zero. re-fetching data...")
      this.fetchPrice(true)

    }

    if (didErr) {
      doLog("TRADE FAIL    - " + actionName + " - " + stockName + " - " + quantity);
    } else {
      doLog("TRADE SUCCESS - " + actionName + " - " + stockName + " - " + quantity);


    }
    populateStockTable();

  }

  erase() {
    this.__ownedQuantity = 0;
  }

}

class UpgradeClass {
  constructor(text, option1, option2, effect1, effect2) {
    this.p = 'p'
  }
}

class EventClass {
  constructor(index, title, text, source, modifierType, modifier, target, recurring, recurringInterval) {
    // effectsArray = [(%/$)modifier:($/-)target:recurring:recurringInterval]
    this.__index = index;
    this.__title = title;
    this.__body = text;
    this.__source = source;
    this.__modifierType = modifierType;
    this.__modifier = Number(modifier);
    this.__target = target;
    this.__recurring = eval(recurring);
    if (this.__recurring) {
      this.__interval = Number(recurringInterval);
    };

    var es = "This will mean that "
    if (this.__recurring) {

      var hrInterval = this.__interval / 3600
      var hrIntervalText = ""
      if (Number(hrInterval) == 1) {
        hrIntervalText = "hour"
      } else {
        hrIntervalText = hrInterval + " hours"
      }
      es += "every <strong>" + hrIntervalText + "</strong> "
    }

    if (this.__target[0] == "$") {
      es += "your <strong>cash balance</strong> will "
    } else {
      es += "the price of <strong>" + this.__target.substring(1, 4) + "</strong> stocks will "
    }

    if (Number(this.__modifier) > 0) {
      es += "increase by "
    } else {
      es += "decrease by "
    }

    es += "<strong>"

    var absMod = Math.abs(modifier)

    if (modifierType == "%") {
      es += (absMod * 100).toString() + "%"
    } else {
      es += "$" + numberFormat(absMod).toString()
    }

    es += "</strong>."

    this.__summary = es


  }

  display() {
    summonEventModal()
  }

}

var stockData = {}
var eventsData = {}
var upgradeData = {}

// retreieve sheets data
function initTabletop() {
  var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1uhynmbbuLDiXzdC34v8fF_a6JqczFub-TYe1rbOOPD4/edit?usp=sharing';
  Tabletop.init({
    key: publicSpreadsheetUrl,
    callback: loadSheetsData,
    simpleSheet: false
  })
}

function loadSheetsData(data) {

  // Load in stocks data
  stockList = data["stocks"]["elements"]
  for (var s in stockList) {
    if (stockList.hasOwnProperty(s)) {
      sn = stockList[s]["stock"]
      sfn = stockList[s]["fullName"]
      stockData[sn] = new StockClass(sn, sfn)
    }
  }

  // Load in news data
  articleList = data["articles"]["elements"]
  for (var a in articleList) {
    if (articleList.hasOwnProperty(a)) {
      a = articleList[a]
      eventsData[a.index] = new EventClass(a.index, a.title, a.body, a.source, a.modifierType, a.modifier, a.target, a.recurring, a.recurringInterval)
      // constructor(index, title, text, modifier, target, recurring, recurringInterval) {

    }
  }

  // Pick an API key
  keyList = data["keys"]["elements"]
  for (var s in stockData) {
    if (stockData.hasOwnProperty(s)) {
      s = stockData[s]
      s.setKey(keyList[Math.floor(Math.random() * keyList.length)]["key"])
    }
  }

  loadNewAlphaData();

  populateNewsTable()
  populateStockTable()
  // populateUpgradesTable()

  // Allow every thing to do its respective thing
  sheetsDataLoaded = true;
  data = []

}

function loadNewAlphaData() {

  dataUpdates = 0
  c = 0
  l = []
  for (var stock in stockData) {
    if (stockData.hasOwnProperty(stock)) {
      l.push(stockData[stock].name)
    }
  }
  var ind = 0
  for (var i = 0; i < l.length; i++) {
    setTimeout(function() {
      stockData[l[ind]].fetchPrice()
      ind++;
    }, (c))
    c += 500
  }
  ind = 0
  // debugger;


  populateStockTable()

  // // Convert date
  // moment.tz.add("America/New_York|EST EDT EWT EPT|50 40 40 40|01010101010101010101010101010101010101010101010102301010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-261t0 1nX0 11B0 1nX0 11B0 1qL0 1a10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 RB0 8x40 iv0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 s10 1Vz0 LB0 1BX0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|21e6")
  // // dte = "2018-05-16 02:00:00"
  // var ts = moment.tz(dte, "America/New_York").valueOf() // "YYYY-MM-DD HH:mm:ss"
  // var m = moment(ts)
  // // return m.format("YYYY-MM-DD HH:mm:ss")
  // return m.valueOf()
}

function populateStockTable() {
  $("#stockInfoInsertPoint").empty()

  var sortable = [];
  for (var stock in stockData) {
    sortable.push([stock, stockData[stock].name]);
  }
  sortable.sort()

  // console.log(sortable);

  for (var n in sortable) {

    stock = sortable[n][0]

    if (stockData.hasOwnProperty(stock)) {
      s = stockData[stock]


      if (s.movement == 1) {
        priceColour = "green"
        movementText = "↑"
      } else if (s.movement == -1) {
        priceColour = "red"
        movementText = "↓"
      } else {
        priceColour = "grey"
        movementText = "-"
      }

      holdingAmt = (s.price * s.ownedQuantity).toFixed(2)

      constructedRow = `<tr>
      <td>
        <span data-toggle='tooltip' data-placement='bottom' title='${s.fullName}'>${s.name}</span>
      </td>
      <td class='price-column'>
        <kbd style='background:${priceColour}'>${s.price}</kbd>
      </td>
      <td style='color:${priceColour}'>
        ${movementText}
      </td>
      <td>${s.ownedQuantity}</td>
      <td>$${holdingAmt}</td>
      <td class='w-87'>
        <div class='input-group'>
          <input min='0' type='number' data-type='buyQty' data-type2='buy' class='btn-outline-light form-control' data-stock='${s.name}' rows='1' cols='4' />
          <div class="input-group-append">
            <button data-type='buy' class='btn btn-outline-light text-success buySellButton' data-stock='${s.name}' href='javascript:void(0)'>Buy</button>
          </div>
        </div>
      </td>
      <td class='w-87'>
        <div class='input-group'>
          <input min='0' type='number' data-type='sellQty' data-type2='sell' class='btn-outline-light form-control' data-stock='${s.name}' rows='1' cols='4' />
          <div class="input-group-append">
            <button data-type='sell' class='btn btn-outline-light text-info buySellButton' data-stock='${s.name}'>Sell</button>
          </div>
        </div>
      </td>
      </tr>`

      $('#stockInfoInsertPoint').append(constructedRow)

      if (!initialDataLoaded) {

        // Disable buying/selling elements until data is loaded
        $('#stockInfoInsertPoint').find('input, textarea, button, select').attr('disabled', true);
        $('#stockInfoInsertPoint').find('input, textarea, button, select').addClass("disabled");

      }

    }
  }

  $('[role="tooltip"]').remove();
  $('[data-toggle="tooltip"]').tooltip();

  $('.buySellButton').on("click", function(e) {
    btn = $(e["currentTarget"])
    stockName = btn.attr("data-stock")
    actionName = btn.attr("data-type")
    textArea = $("[data-stock=" + stockName + "][data-type=" + actionName + "Qty]")

    if (!stockData[stockName].tradeShares(textArea.val(), actionName)) {
      flashElements([textArea], "red")
    }

    textArea.empty()
  })

  $('.buySell').on("keypress", function(e) {
    if (e.which == 13) {

      textArea = $(e["currentTarget"])
      stockName = textArea.attr("data-stock")
      actionName = textArea.attr("data-type2")

      stockData[stockName].tradeShares(textArea.val(), actionName)


      textArea.empty()

    }
  });


  // console.log("data.js  - Table finished rendering.")
}

function populateNewsTable() {

  $("#newsArticleInsertPoint").empty()

  for (var article in eventsData) {
    if (eventsData.hasOwnProperty(article)) {
      article = eventsData[article]

      constructedRow = "<tr><td class='w-max-75' rows=1>" + article.__title + "</td><td class='r-button'><a href='javascript:void(0)' onclick='summonNewsArticle(" + article.__index + ")'>View</a></td></tr>"

      $("#newsArticleInsertPoint").append(constructedRow)

    }
  }
}

function saveUserData() {

  // obj = localStorage.getItem(userData)
  if (localStorage.getItem('userData') == null) {
    craftedStorage = {
      timeStarted: 0,
      userCash: 5000,
      userStocks: {},
      cs: 0,
      closePrices: {}
    }
  } else {
    craftedStorage = JSON.parse(Base64.decode(localStorage.getItem('userData')))
  }

  craftedStorage.userCash = Number(wallet.cash)

  cs = craftedStorage.userCash

  if (craftedStorage.timeStarted == 0) {
    craftedStorage.timeStarted = timeStarted
  }

  cs *= craftedStorage.timeStarted

  craftedStorage.userStocks = {}

  for (var stock in stockData) {
    if (stockData.hasOwnProperty(stock)) {
      s = stockData[stock]
      craftedStorage.userStocks[s.name] = {
        name: s.name,
        ownedQuantity: s.ownedQuantity
      }
      cs += (s.ownedQuantity * 3)
    }
  }

  craftedStorage.cs = cs

  localStorage.setItem('userData', Base64.encode(JSON.stringify(craftedStorage)))

  // doLog("Save completed.");

}

function loadUserData() {

  $("#loading-reason").text("Fetching previous user data...")

  if (localStorage.getItem('userData') == null) {
    saveUserData()
  }

  userData = JSON.parse(Base64.decode(localStorage.getItem('userData')))

  // Gen checksum
  cs = genChecksum(userData)

  if (cs != Number(userData.cs)) {
    doLog("Checksum invalid - Setting values to 0.");
    summonModal("Data reset", "Your statistics have been reset as the save file was corrupted or tampered with.<br>Your cash values and share holdings have been reset.", "Don't cheat!")
    resetUserData(true)
    return;
  } else {
    doLog("Checksum validated - User data loaded.")
  }


  wallet.updateCash(Number(userData.userCash))
  timeStarted = Number(userData.timeStarted)

  for (var stock in userData.userStocks) {
    if (userData.userStocks.hasOwnProperty(stock)) {
      ss = userData.userStocks[stock]

      if (stockData.hasOwnProperty(stock)) {
        s = stockData[stock]

        s.setOwnedQuantity(ss.ownedQuantity)

        // doLog(s.name + "")

      }
    }
  }

  userDataLoaded = true;

}

function resetUserData(i) {
  i = i || false;
  localStorage.removeItem("userData");
  if (!i) {
    location.reload()
  }
}

function exportSaveData() {
  saveUserData()
  d = localStorage.getItem("userData")

  c = `Below is your data in encoded format. By default, this is saved and update within your browser. If you would like to transfer your progress to another computer or browser, you will need to copy the code below and visit the 'Import Data' menu item from your new device.
  <br><br>
  <textarea class="data-box" readonly>${d}</textarea>`

  summonModal('Export Data', c, false)
}

function importSaveData(f, d) {
  if (f == 0) {
    c = `Here is where you can import data from a previous game. Paste your exported data from another browser into the box below and click 'Load'.`
    summonModal("Import Data", c , true, "Load")
  } else if (f == 1) {
    console.log(f, d);
    d2 = JSON.parse(Base64.decode(d))
    cs = genChecksum(d2)
    if (cs != Number(d2.cs)) {
      summonModal("Data import failed.", "The data file you attempted to upload was corrupted, and was not loaded. Please ensure all characters of the data code were copied correctly.")
    } else {
      localStorage.setItem("userData", d)
      summonModal("Data import complete!", "Your data has successfully been imported.")
      loadUserData()
      populateStockTable()
    }
  }
}
