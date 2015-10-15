#!/usr/bin/env node

/**
 * Created by josh on 10/14/15.
 */

function main() {
    if(process.argv.length < 3) return printHelp();

    var command = process.argv[2];
    if(command == 'scan')    return startScan();
    if(command == 'blink')   return startBlink();
    if(command == 'install') return startInstall();

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
    console.log("       razzmaster install --host 192.168.1.3 --config config.json")
    console.log("");
    console.log("most commands take optional username and password arguments ");
    console.log("    --username myusername  ");
    console.log("    --password mypass");
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