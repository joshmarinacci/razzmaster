/**
 * Created by josh on 7/2/15.
 */

var Q = require('q');

exports.splitArgs = function() {
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


exports.checkArgs = function(args) {
    if (!args.host) return missingArg('--host');
    //if (!args.username) return missingArg('--username');
    //if (!args.password) return missingArg('--password');
    return true;
}

function missingArg(name) {
    console.log("missing argument ",name);
    return false;
}

exports.chain = function(funcs) {
    var result = Q(null);
    funcs.forEach(function(f){
        result = result.then(f);
    });
    return result;
};

exports.delay = function(dur) {
    return Q.promise(function(res,rej,not) {
        setTimeout(function(){
            res();
        },dur);
    });
};

exports.execRemote = function(conn, command) {
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
};
