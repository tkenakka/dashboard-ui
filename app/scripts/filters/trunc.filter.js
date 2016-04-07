"use strict";
angular.module('dashboard').
    filter('trunc', function() {
        return function(txt, len, suffix) {
            var res = txt;
            var suff = suffix ? suffix : "...";
            if (angular.isNumber(len) && angular.isString(txt) && angular.isString(suff)) {
                if (txt.length > len) {
                    res = txt.substring(0, len - suff.length) + suff;
                }
            }
            return res;
        };
    });