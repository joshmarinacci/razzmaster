/**
 * Created by josh on 1/14/16.
 */
var common = require('./common');
var Client = require('ssh2').Client;
var args = common.splitArgs();

if(!common.checkArgs(args)) return printHelp();

function printHelp() {
    console.log("usage");
    console.log("razzmaster info --host  192.168.1.3");
    console.log("  --username pi");
    console.log("  --password mypass");
}



if(!args.port) args.port = 22;
if(!args.username) {
    console.log("using default username: 'pi'");
    args.username = 'pi';
}
if(!args.password) {
    console.log("using default password: 'raspberry'");
    args.password = 'raspberry';
}


var conn = new Client();


var get_model = 'cat /sys/firmware/devicetree/base/model; echo \n';
var get_version = 'cat /etc/os-release; echo \n'
var uname = 'uname -a; echo \n';

function execRemote(args) {
    return function() {
        return common.execRemote(conn,args);
    }
}


conn.on('ready', function() {
    common.chain([
        execRemote(get_model),
        execRemote(get_version),
        execRemote(uname)
    ]).done(function(){
        conn.end();
    });
}).connect(args);

conn.on('end',function(){
    process.exit();
});
