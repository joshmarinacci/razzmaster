var fs = require('fs');
var Q = require('q');
var Client = require('ssh2').Client;

var args = splitArgs();

if(!args.config) return missingArg('--config');
if(!args.host) return missingArg('--host');
if(!args.username) return missingArg('--username');
if(!args.password) return missingArg('--password');
if(!args.port) args.port = 22;


var config = JSON.parse(fs.readFileSync(args.config));


console.log("args = ", args);
console.log("config",config);


function missingArg(name) {
    console.log("missing argument ",name);
    console.log("usage");
    console.log("node install.js");
    console.log("  --config  configfile.json")
    console.log("  --host  192.168.1.3");
    console.log("  --username pi");
    console.log("  --password mypass");
}

function splitArgs() {
    var argv = process.argv.slice(2);
    //console.log('argv = ', argv);
    var obj = {};
    for(var i=0; i<argv.length; i++) {
        var arg = argv[i];
        if(arg.indexOf('--')==0) {
            obj[arg.substring(2)] = argv[i+1];
            i++;
        }
    }
    return obj;
}

/*

check that it's a pi.

    ssh pi@192.168.1.23 "uname -a"

    should return something with the string raspberry pi in it
    ex:
 Linux raspberrypi 3.18.11-v7+ #781 SMP PREEMPT Tue Apr 21 18:07:59 BST 2015 armv7l GNU/Linux



apt-get update
    ssh pi@192.168.1.23 "sudo apt-get update"
apt-get install

*/


/*var config = {
    'packages':['git','curl','bluez','bluez-hcidump']
};
*/
/*
var host = '192.168.1.23';
var port = '22';
var username = 'pi';
var password = 'satans';
*/

function execRemote(conn, command) {
    return function() {
        return Q.Promise(function (resolve, reject, notify) {
            //console.log("start",command);
            console.log("===== STARTED  " + command);
            conn.exec(command, function (err, stream) {
                if (err) {
                    console.log('error');
                    throw err;
                }
                /*stream.on('data', function (data) {
                    console.log("data",data.toString());
                });*/
                stream.pipe(process.stdout);
                stream.stderr.pipe(process.stdout);

                stream.on('close', function (code, signal) {
                    //console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                    console.log('===== FINISHED ' + command);
                    resolve(null);
                });
            });
        });
    }
}


function chain(funcs) {
    var result = Q(null);
    funcs.forEach(function(f){
        result = result.then(f);
    })
    return result;
}
var conn = new Client();


var funcs = [];

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
    chain(funcs).done(function(){
        conn.end();
    });
}).connect(args);//{host: args.host, port: args.port, username: args.username, password: args.password});