/*PRE REQ:
install npm and nodejs
npm install --save-dev electron-rebuild
npm install in repository
*/
const electron = require('electron')

const fetch = require('electron-fetch');
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

var ipcMain = require('electron').ipcMain;

/*var getJSON = function(url) {
    console.log("Querying weather:"+url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        //callback(null, xhr.response);
        console.log("200 "+xhr.response.coord);
        return xhr.response;
      } else {
        //callback(status);
        console.log(status);
      }
    };
    xhr.send();
};*/
//http://meow.noopkat.com/using-node-serialport-in-an-electron-app/
var sp = require('serialport');
sp.list(function(err, ports) {
  //console.log(ports);
});
var osc = require('node-osc');

var client = new osc.Client('127.0.0.1', 7000);
//var sendSerial=function(){};
var processWeatherData = function(lat,lon){

  var url = "http://api.openweathermap.org/data/2.5/weather?lat=LAT_DATA&lon=LON_DATA&units=metric&APPID=f6320214da324e22945dc3567f97be03";
  var url = url.replace("LAT_DATA", lat);
  var url = url.replace("LON_DATA", lon);
  fetch(url)
  .then(res => res.json())
  .then((out) => {
    console.log('Checkout this JSON! ', out);
    console.log('Wind speed: ', out.wind.speed);
    console.log('clouds:',out.clouds.all);
    console.log('weather:',out.weather[0].main);
    console.log('Temperature:',out.main.temp);

    client.send('/composition/video/effect1/opacity/values', 0.5, function () {
      //client.kill();
    });
    switch (out.weather[0].main)
    {
      case "Clear":
        client.send('/layer1/clip2/connect',1);
      break;
      case "Rain":
       client.send('/layer1/clip3/connect',1);
       console.log('Rain:', out.rain["3h"]);
      // client.send('/layer1/clip3/connect',1);
      break;
      case "Clouds":
      //for clouds intensity

      break;
      default:
    }

  }).catch(err => console.error(err));
}
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width:1000,height:800})
  //mainWindow = new BrowserWindow({fullscreen:true})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    app.quit();
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})
 //api.openweathermap.org/data/2.5/forecast?id=524901&APPID=1111111111
app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
ipcMain.on('user-data', function(event, arg) {
  console.log('Latitude:'+arg['lat']+', longitude:'+arg['lng']);
  processWeatherData(arg['lat'],arg['lng']);
  //console.log("wind speed:"+weather_json.wind.speed);
  //do child process or other data manipulation and name it manData
  //event.sender.send(‘manipulatedData’, manData);
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//miscelaneous functions
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
