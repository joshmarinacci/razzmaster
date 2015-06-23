/**
 * Created by josh on 6/22/15.
 */
console.log("finding a raspberry pi");

var ip = require('ip'),
    os = require('os'),
    ping= require('./ping'),
    arp = require('./arp'),
    Q   = require('q');
    ;
/*
var addr = ip.address();
// grab the first three octects of the IP
var subnet = addr.substr(0, addr.lastIndexOf('.')) || false;
console.log("my ip = ", ip);
console.log("my subnet = ", subnet);
*/

function setupPoly() {
    if (![].includes) {
        Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
            'use strict';
            var O = Object(this);
            var len = parseInt(O.length) || 0;
            if (len === 0) {
                return false;
            }
            var n = parseInt(arguments[1]) || 0;
            var k;
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) {k = 0;}
            }
            var currentElement;
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement ||
                    (searchElement !== searchElement && currentElement !== currentElement)) {
                    return true;
                }
                k++;
            }
            return false;
        };
    }

}

setupPoly();
/*
var whitelist = [
    /b8:27:eb/, // rasberry pi ethernet
    /00:e0:4c/, // realtek
    /00:14:78/, // tp-link
    /00:0c:43/  // ralink
];
*/
var whitelist = [
    'b8:27:eb', // rasberry pi ethernet
    '00:e0:4c', // realtek
    '00:14:78', // tp-link
    '00:0c:43'  // ralink
];

var interfaces = os.networkInterfaces();
var subnets = [];

for(var name in interfaces) {
    var ifc = interfaces[name];
    for(var i=0; i<ifc.length; i++) {
        if(ifc[i].family == 'IPv4') {
            subnets.push(ifc[i].address);
        }
    }
}
//filter out loopback
subnets = subnets.filter(function(n) { return n !== '127.0.0.1'; });

console.log("subnets = ", subnets);

var addr = subnets[0];
var subnet = addr.substr(0, addr.lastIndexOf('.')) || false;
console.log("my ip first = ", addr);
console.log("my subnet first = ", subnet);

function testHost(host) {
    return Q.Promise(function(resolve,reject,notify) {
        //send out a ping packet
        ping(host, function () {
            //console.log('called back');
        });
        //listen to arp responses
        arp(host, function (err, mac) {
            console.log("arp response = ", err, mac);
            resolve([host,mac]);
        });
    })
}

function range(start,end) {
    var arr = [];
    for(var i=start;i<=end;i++) {
        arr.push(i);
    }
    return arr;
}

var arr = range(0,10).map(function(i) {
    return testHost(subnet+'.'+i);
});
Q.all(arr).then(function(val){
    var valid = val.filter(function(vals) {  return vals[1] !== '(incomplete)';  });
    valid.forEach(function(val){
        console.log("mac address == ",val);
        console.log("contains = " + whitelist.includes(val[1].substring(0,8)));
    });
}).done();
