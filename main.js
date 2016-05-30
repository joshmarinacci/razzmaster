#!/usr/bin/env node

/**
 * Created by josh on 10/14/15.
 */

var path = require('path');
var fs   = require('fs');

function main() {
    if(process.argv.length < 3) return printHelp();

    var command = process.argv[2];
    if(command == 'scan')    return startScan();
    if(command == 'blink')   return startBlink();
    if(command == 'install') return startInstall();
    if(command == 'version') return startVersion();
    if(command == 'info')    return startInfo();

    console.log("unknown command '"+command+"'");
    return printHelp();
}
main();


function printHelp() {
    console.log("RazzMaster: find and control Raspberry Pis on the network");
    console.log("  scan for pis on the network");
    console.log("       razzmaster scan");
    console.log("  blink LED of a pi");
    console.log("       razzmaster blink --host 192.168.1.3");
    console.log("  install using config file");
    console.log("       razzmaster install --host 192.168.1.3 --config config.json");
    console.log("  print info about pi");
    console.log("       razzmaster info --host 192.168.1.3");
    console.log("  print info about razzmaster");
    console.log("       razzmaster version");
    console.log("");
    console.log("most commands take optional username and password arguments ");
    console.log("    --username myusername  ");
    console.log("    --password mypass");
    console.log("");
    console.log("for detailed instructions see");
    console.log("https://github.com/joshmarinacci/razzmaster");
}

function startScan() {
    require('./find.js');
}

function startBlink() {
    require('./blink.js');
}


function startInstall() {
    require('./install');
}

function startVersion() {
    var package_json = JSON.parse(fs.readFileSync(path.join(__dirname,'package.json')).toString());
    console.log(package_json.name + ' version ' + package_json.version);
    console.log("created by:",package_json.author.name, ",", package_json.author.email);
    console.log("file bugs:", package_json.bugs.url);
}

function startInfo() {
    require('./info.js');
}