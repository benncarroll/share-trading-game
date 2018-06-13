String.prototype.toProperCase = function() {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

function getFormattedDate(ts) {
  var date = new Date(ts);

  var year = date.getFullYear().toString().substr(2, 2);
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var min = date.getMinutes();
  var sec = date.getSeconds();

  month = (month < 10 ? "0" : "") + month;
  day = (day < 10 ? "0" : "") + day;
  hour = (hour < 10 ? "0" : "") + hour;
  min = (min < 10 ? "0" : "") + min;
  sec = (sec < 10 ? "0" : "") + sec;

  var str = day + "/" + month + "/" + year + " - " + hour + ":" + min + ":" + sec;

  /*alert(str);*/

  return str;
}

function numberFormat(n, sep, decimals) {
  n = Number(n) // to make sure dumb stuff doesnt happen
  sep = sep || "."; // Default to period as decimal separator
  decimals = decimals || 2; // Default to 2 decimals

  return n.toLocaleString().split(sep)[0] +
    sep +
    n.toFixed(decimals).split(sep)[1];
}

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

function getLogTimestamp() {
  var date = new Date(Date.now());

  var hour = date.getHours();
  var min = date.getMinutes();
  var sec = date.getSeconds();

  hour = (hour < 10 ? "0" : "") + hour;
  min = (min < 10 ? "0" : "") + min;
  sec = (sec < 10 ? "0" : "") + sec;

  var str = "[" + hour + ":" + min + ":" + sec + "] - ";

  /*alert(str);*/

  return str;
}

function doLog(toPrint) {
  console.log(getLogTimestamp() + toPrint);
}

function checkConnection() {
  var r = $.get("http://bencarroll.tech/connection.txt")
  console.log(r);
}

var bb;

function flashElements(elArray, color) {
  for (var i = 0; i < elArray.length; i++) {
    $(elArray[i]).addClass(("flash-" + color))
    // $(elArray[i]).addClass("flash")
    // console.log($(elArray[i]));
    // bb = $(elArray[i])
  }

  setTimeout(function() {

    for (var i = 0; i < elArray.length; i++) {
      $(elArray[i]).removeClass(("flash-" + color))
      // $(elArray[element]).removeClass("flash")
    }
  }, 1000)

}
