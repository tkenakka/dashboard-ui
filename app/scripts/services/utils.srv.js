/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.utils
* @description
* # utils
* Service in the dashboard.
*/
angular.module('dashboard')
    .factory('Utils', function ($log, $window, CONST, AttachmentData, $timeout, $http, $q, FileSaver, Blob) {
        var Utils = {};

        Utils.isResoXs = function (argUa) {
            var ua = ua ? argUa : $window.navigator.userAgent;
            var device = document.getElementById("device");
            var res = (device && window.getComputedStyle(device, null).getPropertyValue("min-width") === '320px');
            $log.debug("Utils.isResoXs: " + res);
            return res;
        };

        Utils.isUaIe = function (argUa) {
            var ua = ua ? argUa : $window.navigator.userAgent;
            var res = ua.match(/Trident/i) || ua.match(/MSIE/i);
            return null !== res;
        };

        Utils.isUAEdge = function (argUa) {
            var ua = ua ? argUa : $window.navigator.userAgent;
            var res = ua.match(/Edge/i);
            return null !== res;
        };

        Utils.isUaMobile = function (argUa) {
            var ua = ua ? argUa : $window.navigator.userAgent;
            var dev = {
                Android: function () {
                    return ua.match(/Android/i);
                },
                BlackBerry: function () {
                    return ua.match(/BlackBerry/i);
                },
                iOS: function () {
                    return ua.match(/iPhone|iPad|iPod/i);
                },
                Opera: function () {
                    return ua.match(/Opera Mini/i);
                },
                Windows: function () {
                    return ua.match(/IEMobile/i);
                },
                isMobile: function () {
                    return (dev.Android() || dev.BlackBerry() || dev.iOS() || dev.Opera() || dev.Windows()) !== null;
                }
            };
            var res = dev.isMobile();
            $log.debug("Utils.isUaMobile: " + res);
            return res;
        };

        Utils.isClientMobile = function () {
            var ua = $window.navigator.userAgent;
            //console.log("Utils.isClientMobile: UA=" + ua);
            // var res = Utils.isUaMobile(ua) || Utils.isResoXs(ua);
            var res = Utils.isResoXs(ua);
            // $$log.debug("Utils.isClientMobile: " + res);
            return res;
        };

        Utils.isAttConf = function (att) {
            return (att instanceof AttachmentData) && att.publicity === CONST.PUBLICITY.SECRET;
        };

        // Utility function for looping an object to find the first immediate child object with matching value
        // Returns the matching object on success, null on bad arguments or if no match.
        // Example: find an object from 'arr' whose property 'prop' has value 'val'
        Utils.objWithVal = function (arr, prop, val) {
            var res = null;
            if (!arr || !angular.isObject(arr) || !prop) {
                $log.error("Utils.objWithVal: bad arguments: arr:" + arr + " prop:" + prop + " val:" + val);
                return res;
            }

            var tmp;
            for (var p in arr) {
                tmp = arr[p];
                if (tmp && prop in tmp && angular.equals(tmp[prop], val)) {
                    res = tmp;
                    break;
                }
            }
            return res;
        };


        Utils.saveFile = function (aUrl, fn) {
            $log.debug("Utils.savePdf: " + aUrl);
            var navigator = $window.navigator;
            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(aUrl, fn);
            }
            else {
                // Try using other saveBlob implementations, if available
                var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
                if (saveBlob === undefined) {
                    console.log("Not supported");
                }
                saveBlob(aUrl, fn);

                // var element = document.createElement('a');
                // element.href = aUrl;
                // element.setAttribute('download', aFn);
                // document.body.appendChild(element); //Append the element to work in firefox
                // (element[0] || element).click();
            }
        };

            Utils.savePdf = function (aUrl) {
                $log.debug("Utils.savePdf: " + aUrl);
                var deferred = $q.defer();
                $timeout(function () {
                    deferred.notify({});
                    $http({
                        method: 'GET',
                        cache: false,
                        url: aUrl,
                        responseType: 'arraybuffer'
                    }).then(function (response) {

                        var blob = null;
                        if (response) {
                            blob = new Blob([response.data], { type: 'application/pdf' });
                            $log.debug("Utils.savePdf: FileSaver");
                            FileSaver.saveAs(blob, 'terve1.pdf');
                            // var blobUrl = URL.createObjectURL(blob);
                            // Utils.saveFile(blobUrl, "terve.pdf");
                        } else {
                            $log.error("Utils.savePdf: null blob");
                        }
                        deferred.resolve(blob);
                    }, function (error) {
                        $log.error("Utils.savePdf: " + error);
                        deferred.reject(error);
                    });
                }, 0);

                return deferred.promise;
            };

            Utils.openNewWin = function (aUrl) {
                Utils.savePdf(aUrl);
                // if (angular.isString(aUrl) && aUrl.length) {
                //     $log.debug("Utils.openNewWin: " + aUrl);
                //     $window.open(aUrl, '_blank');
                // }
                // else {
                //     $log.error("Utils.openNewWin: ignored due to bad url " + aUrl);
                // }
            };
            return Utils;
        });
