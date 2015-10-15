var fs = require('fs');
var Q = require('q');
var Client = require('ssh2').Client;
var common = require('./common');
var args = common.splitArgs();

if(!common.checkArgs(args)) return printHelp();

function printHelp() {
    console.log("usage");
    console.log("razzmaster install --config  configfile.json --host  192.168.1.3");
    console.log("  --username pi");
    console.log("  --password mypass");
}

if(!args.config) return console.log("missing --config option");
if(!args.port) args.port = 22;
if(!args.username) {
    console.log("using default username: 'pi'");
    args.username = 'pi';
}
if(!args.password) {
    console.log("using default password: 'raspberry'");
    args.password = 'raspberry';
}


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

function processInstalls(config) {
//update apt
    funcs.push(execRemote(conn, 'sudo apt-get -y update'));
    funcs.push(execRemote(conn, 'sudo apt-get -y upgrade'));

// install packages
    if(config.packages) {
        config.packages.forEach(function (pak) {
            if (pak == 'nodejs') {
                //install node
                funcs.push(execRemote(conn, 'curl -sL https://deb.nodesource.com/setup | sudo bash -'))
                funcs.push(execRemote(conn, 'sudo apt-get install -y nodejs'));
                funcs.push(execRemote(conn, 'node --version'));
                funcs.push(execRemote(conn, 'npm --version'));
            } else {
                funcs.push(execRemote(conn, 'sudo apt-get install -y ' + pak));
            }
        });
    }

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
}

function processWifi(config) {
    if(!config.wifi) return;
    if(!config.wifi.ssid) return console.log("ssid missing!");
    if(!config.wifi.password) return console.log("password missing!");
    var ssid = config.wifi.ssid;
    var pass = config.wifi.password;
    var line1 = 'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev';
    var line2 = 'update_config=1';
    var line3 = 'network={\n    ssid="'+ssid+'"\n    psk="'+pass+'" \n}';
    var str = [line1,line2,line3].join("\n");
    str = str.replace(/\"/g,"\\\"");
    //console.log('string is ',str);

    var filename = '/etc/wpa_supplicant/wpa_supplicant.conf';
    funcs.push(execRemote(conn,'sudo echo "'+str+'" > tmp.txt'));
    funcs.push(execRemote(conn,'sudo cp tmp.txt '+filename));
    funcs.push(execRemote(conn,'sudo ifdown wlan0'));
    funcs.push(execRemote(conn,'sudo ifup wlan0'));

}
processWifi(config);
processInstalls(config);
conn.on('ready', function() {
    common.chain(funcs).done(function(){
        conn.end();
    });
}).connect(args);



