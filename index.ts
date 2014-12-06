

/// <reference path="typings/tsd.d.ts"/>

import fs = require('fs');
import xml2js = require('xml2js');
var Iconv = require('iconv').Iconv;
var euckr2utf8 = new Iconv('EUC-KR', 'UTF-8');

console.log('Hi');

var file = process.argv[2];

console.log(file);

var data = fs.readFileSync(file);
var content = euckr2utf8.convert(data);

interface TArrayType {
    $: {
        align: string;
        id: string;
        max: string;
        min: string;
        size: string;
        type: string;
    }
}

interface TConstructor {
    $: {
        access: string;
        artificial: string;
        context: string;
        demangled: string;
        endline: string;
        file: string;
        id: string;
        inline: string;
        line: string;
        location: string;
        mangled: string;
        name: string;
        throw: string;
    }
    Argument: TArgument[];
}

interface TCvQualifiedType {
    $: {
        'const': string;
        id: string;
        type: string;
    }
}

interface TDestructor {
    $: {
        access: string;
        artificial: string; //boolean
        context: string;
        demangled: string;
        endline: string;
        file: string;
        id: string;
        inline: string;
        line: string;
        location: string;
        mangled: string;
        name: string;
        'throw': string; // boolean
    }
}

interface TEnumValue {
    $: {
        init: string;
        name: string;
    }
}

interface TEnumeration {
    $: {
        align: string;
        context: string;
        file: string;
        id: string;
        line: string;
        location: string;
        name: string;
        size: string;
    }
    EnumValue: TEnumValue[];
}

interface TField {
    $: {
        access: string;
        context: string;
        file: string;
        id: string;
        line: string;
        location: string;
        name: string;
        offset: string;
        type: string;
    }
}

interface TFile {
    $: {
        id: string;
        name: string;
    }
}

interface TFunction {
    $: {
        attributes: string;
        demangled: string;
        context: string;
        extern: string;
        file: string;
        id: string;
        line: string;
        location: string;
        mangled: string;
        name: string;
        returns: string;
    };
    Argument: TArgument[];
}

interface TFunctionType {
    $: {
        id: string;
        returns: string;
    }
}

interface TFundamentalType {
    $: {
        align: string;
        id: string;
        name: string;
        size: string;
    }
}

interface TNamespace {
    $: {
        demangled: string;
        id: string;
        mangled: string;
        members: string;
        name: string;
    }
}

interface TOperatorMethod {
    $: {
        access: string;
        artificial: string;
        context: string;
        demangled: string;
        endline: string;
        file: string;
        id: string;
        inline: string;
        line: string;
        location: string;
        mangled: string;
        name: string;
        returns: string;
        throw: string;
    }
}

interface TPointerType {
    $: {
        align: string;
        id: string;
        size: string;
        type: string;
    }
}

interface TReferenceType {
    $: {
        align: string;
        id: string;
        size: string;
        type: string;
    }
}

interface TStruct {
    $: {
        align: string;
        bases: string;
        context: string;
        demangled: string;
        file: string;
        id: string;
        line: string;
        location: string;
        mangled: string;
        members: string;
        name: string;
        size: string;
    }
}

interface TTypedef {
    $: {
        context: string;
        file: string;
        id: string;
        line: string;
        location: string;
        name: string;
        type: string;
    }
}

interface TUnion {
    $: {
        access: string;
        align: string;
        artificial: string;
        bases: string;
        context: string;
        demangled: string;
        file: string;
        id: string;
        line: string;
        location: string;
        mangled: string;
        members: string;
        size: string;
    }
}

interface TArgument {
    $: {
        file: string;
        line: string;
        location: string;
        name: string;
        type: string;
    }
}

interface TGccXml {
    $: {
        cvs_revision: string;
    }
    ArrayType: TArrayType[];
    Constructor: TConstructor[];
    CvQualifiedType: TCvQualifiedType[];
    Destructor: TDestructor[];
    Enumeration: TEnumeration[];
    Field: TField[];
    File: TFile[];
    Function: TFunction[];
    FundamentalType: TFundamentalType[];
    Namespace: TNamespace[];
    OperatorMethod: TOperatorMethod[];
    PointerType: TPointerType[];
    ReferenceType: TReferenceType[];
    Struct: TStruct[];
    Typedef: TTypedef[];
    Union: TUnion[];
}

xml2js.parseString(content, function(err, json) {

    var gcc_xml: TGccXml = json.GCC_XML;

    var lookup_table = {};
    for (var key in gcc_xml) {
        if (gcc_xml[key].length) {
            gcc_xml[key].forEach(function(item) {
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

    gcc_xml.Function.forEach(function(f) {
        if (f.$.demangled) {
            console.log(f.$.name);
            if (f.Argument) {
                f.Argument.forEach(function(a) {
                    var type = findFundamentalType(a.$.type);
                    console.log(' - ' + a.$.name + ':' + type.$.name);
                    if (type.$.members) {
                        var members = type.$.members.split(' ');
                        members.forEach(function(m) {
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