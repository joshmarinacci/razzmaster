/**
 * Created by josh on 7/2/15.
 */
var common = require('./common');
var Client = require('ssh2').Client;
var args = common.splitArgs();

if(!common.checkArgs(args)) return printHelp();
if(!args.port) args.port = 22;
if(!args.username) {
    console.log("using default username: 'pi'");
    args.username = 'pi';
}
if(!args.password) {
    console.log("using default password: 'raspberry'");
    args.password = 'raspberry';
}

function printHelp() {
    console.log("usage");
    console.log("razzmaster blink --host  192.168.1.3");
    console.log("  --username myusername");
    console.log("  --password mypass");
}



var conn = new Client();

process.on( 'SIGINT', function() {
    console.log( "stopping the green blinking" );
    common.execRemote(conn, 'echo "echo none > /sys/devices/platform/soc/soc\:leds/leds/led0/trigger" | sudo sh').then(function(){
        conn.end();
    });
});

conn.on('ready', function() {
    common.execRemote(conn, 'echo "echo heartbeat > /sys/devices/platform/soc/soc\:leds/leds/led0/trigger" | sudo sh')
        .then(function() {
            console.log("Your raspberry pi should be blinking green.\n"
                +"press control C to stop blinking and quit");
        });
}).connect(args);

conn.on('end',function(){
    process.exit();
});
