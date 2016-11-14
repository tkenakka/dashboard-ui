/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.pdf:pdfDirective
 * @description
 * # pdfDirective
 */
angular.module('dashboard')
    .directive('dbPdf', ['$rootScope', 'CONST', '$log', '$compile', function ($rootScope, CONST, $log, $compile) {
        var noContentUri = 'no.content.html';
        var params = "secondary=false&amp;mixed=false#view=FitH&amp;toolbar=0&amp;statusbar=0&amp;messages=0&amp;navpanes=0";

        function paramSeparator(uri) {
            return angular.isString(uri) && (CONST.NOTFOUND !== uri.indexOf('?')) ? '&' : '?';
        }

        // var ctrl = ['$log', '$scope', '$sce', function ($log, $scope, $sce) {
        //     $log.log("dbPdf.CONTROLLER");
        //     var self = this;


        //     function composeUrl(aUrl) {
        //         var res = noContentUri;
        //         if (angular.isString(aUrl.uri) && aUrl.uri.length) {
        //             res = aUrl.uri + paramSeparator(aUrl.uri) + params;
        //         }
        //         $log.debug("dbPdf.composeUrl: " + res);
        //         return res;
        //     }

        //     $scope.$watch(
        //         function () {
        //             return { uri: $scope.uri };
        //         },
        //         function (aNew) {
        //             self.uri = $sce.trustAsResourceUrl(composeUrl(aNew));
        //             // $log.debug("dbPdf.watch: new resolved uri:" + self.uri);
        //         },
        //         true
        //     );
        // }];

        return {
            scope: {
                uri: '='
            },
            // controller: ctrl,
            // controllerAs: 'c',
            template: '<div></div>',
            // template: '<iframe ng-attr-src="{{c.uri}}"></iframe>',
            restrict: 'AE',
            replace: 'true',
            link: function (scope, element/*, attrs*/) {

                element.addClass('db-directive');

                function hide() {
                    element.removeClass('db-visible-pdf');
                    element.addClass('db-hidden-pdf');
                }

                function show() {
                    element.removeClass('db-hidden-pdf');
                    element.addClass('db-visible-pdf');
                }

                function composeContent(data) {
                    element.empty();
                    var content = '<iframe src="' + noContentUri + '"></iframe>';
                    if (angular.isObject(data) && angular.isString(data.uri) && data.uri.length) {
                        content = '<iframe src="' + data.uri + paramSeparator(data.uri) + params + '"></iframe>';
                    }
                    element.append($compile(content)(scope));
                    if ($rootScope.isModalActive()) {
                        hide();
                    }
                    else {
                        show();
                    }
                }

                scope.$watch(
                    function () {
                        return { uri: scope.uri };
                    },
                    composeContent,
                    true
                );

                scope.$watch(
                    function () {
                        return { modalActive: $rootScope.isModalActive() };
                    },
                    function (data) {
                        if (angular.isObject(data)) {
                            if (data.modalActive) {
                                hide();
                            }
                            else {
                                show();
                            }
                        }
                    },
                    true
                );

                scope.$on('$destroy', function () {
                    $log.debug("pdfDirective: DESTROY");
                });

                if (angular.isString(scope.uri) && scope.uri.length) {
                    composeContent({ uri: scope.uri });
                }
                else {
                    hide();
                }
            }
        };
    }]);
