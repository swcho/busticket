/// <reference path="typings/tsd.d.ts"/>
var fs = require('fs');
var xml2js = require('xml2js');
var Iconv = require('iconv').Iconv;
var euckr2utf8 = new Iconv('EUC-KR', 'UTF-8');

console.log('Hi');

var file = process.argv[2];

console.log(file);

var data = fs.readFileSync(file);
var content = euckr2utf8.convert(data);

xml2js.parseString(content, function (err, json) {
    var gcc_xml = json.GCC_XML;

    var lookup_table = {};
    for (var key in gcc_xml) {
        if (gcc_xml[key].length) {
            gcc_xml[key].forEach(function (item) {
                if (item.$.id) {
                    lookup_table[item.$.id] = item;
                }
            });
        }
    }

    function findFundamentalType(id) {
        var item = lookup_table[id];
        if (item && item.$.type) {
            return findFundamentalType(item.$.type);
        }
        return item;
    }

    gcc_xml.Function.forEach(function (f) {
        if (f.$.demangled) {
            console.log(f.$.name);
            if (f.Argument) {
                f.Argument.forEach(function (a) {
                    var type = findFundamentalType(a.$.type);
                    console.log(' - ' + a.$.name + ':' + type.$.name);
                    if (type.$.members) {
                        var members = type.$.members.split(' ');
                        members.forEach(function (m) {
                            var mem = findFundamentalType(m);
                            if (mem && mem.$ && !mem.$.artificial) {
                                console.log('   - ' + JSON.stringify(mem));
                            }
                        });
                    } else {
                        console.log('   - ' + JSON.stringify(type));
                    }
                });
            }
        }
    });
});
//# sourceMappingURL=index.js.map
