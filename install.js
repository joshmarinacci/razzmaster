var fs = require('fs');
var Q = require('q');
var Client = require('ssh2').Client;
var common = require('./common');
var args = common.splitArgs();

if(!common.checkArgs(args)) return printHelp();

function printHelp() {
    console.log("usage");
    console.log("node install.js");
    console.log("  --config  configfile.json")
    console.log("  --host  192.168.1.3");
    console.log("  --username pi");
    console.log("  --password mypass");
}

if(!args.config) return console.log("missing --config option");
if(!args.port) args.port = 22;


var config = JSON.parse(fs.readFileSync(args.config));


console.log("args = ", args);
console.log("config",config);

var conn = new Client();
var funcs = [];


function execRemote(conn, args) {
    return function() {
        return common.execRemote(conn,args);
    }
}
//update apt
funcs.push(execRemote(conn, 'sudo apt-get -y update'));
funcs.push(execRemote(conn, 'sudo apt-get -y upgrade'));

// install packages
config.packages.forEach(function(pak){
    if(pak == 'nodejs') {
        //install node
        funcs.push(execRemote(conn, 'curl -sL https://deb.nodesource.com/setup | sudo bash -'))
        funcs.push(execRemote(conn, 'sudo apt-get install -y nodejs'));
        funcs.push(execRemote(conn, 'node --version'));
        funcs.push(execRemote(conn, 'npm --version'));
    } else {
        funcs.push(execRemote(conn, 'sudo apt-get install -y ' + pak));
    }
});

// install global npms
if(config.git) {
    config.git.forEach(function(repo){
        funcs.push(execRemote(conn,"cd $HOME"));
        funcs.push(execRemote(conn,'git clone '+repo));
    })
}

if(config.npm) {
    config.npm.forEach(function(mod){
        funcs.push(execRemote(conn, "npm install -g "+mod));
    });
}

conn.on('ready', function() {
    common.chain(funcs).done(function(){
        conn.end();
    });
}).connect(args);



