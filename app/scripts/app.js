/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc overview
* @name dashboard
* @description
* # dashboard
*
* Main module of the application.
*/
angular.module('dashboard', [
    'ngAnimate',
    'ngTouch',
    'ui.router',
    'AhjoSigningService',
    'ui.bootstrap',
    'ngSanitize',
    'ngToast',
    'angularSpinner',
    'monospaced.elastic',
    'focus-if',
    'pascalprecht.translate',
    'ngFileSaver'
])
    .config(function ($urlRouterProvider, $stateProvider, ENV, G_APP, $logProvider, $provide, $compileProvider, $translateProvider, $httpProvider, $uibTooltipProvider) {
        // Startup logged always regardless of ENV config, so using console instead of $log
        console.log('dashboard.config: ver: ' + G_APP.app_version + ' env: ' + ENV.app_env + ' logging: ' + ENV.app_debuglogs);

        $compileProvider.debugInfoEnabled(false);

        /* Set application level logging. Affects $log, not console */
        var doDbg = false;
        if (ENV && ENV.app_debuglogs) {
            doDbg = ENV.app_debuglogs;
            $translateProvider.useMissingTranslationHandlerLog();
        }
        $logProvider.debugEnabled(doDbg);

        /* Override $log functions to respect app-level setting for logging */
        $provide.decorator('$log', function ($delegate) {
            var infoFn = $delegate.info;
            var logFn = $delegate.log;

            $delegate.info = function () {
                if ($logProvider.debugEnabled()) {
                    infoFn.apply(null, arguments);
                }
            };

            $delegate.log = function () {
                if ($logProvider.debugEnabled()) {
                    logFn.apply(null, arguments);
                }
            };
            return $delegate;
        });

        $translateProvider
            .useStaticFilesLoader({
                prefix: 'loc/lang-',
                suffix: '.json'
            })
            .preferredLanguage('fi')
            .fallbackLanguage('fi')
            .useSanitizeValueStrategy('escapeParameters')
            .use('fi');

        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|blob):/);

        $httpProvider.defaults.withCredentials = true;

        $uibTooltipProvider.options({
            popupDelay: 1700,
            appendToBody: true // Otherwise tooltip is under some elements
        });
    })
    .run(function ($rootScope, $log, $window, CONST, ENV, $state, $timeout, $translate, Utils, StorageSrv, ngToast) {

        $rootScope.$on('$stateChangeStart', function (event, next/*, toParams, fromParams*/) {
            $log.debug('app.stateChangeStart: ' + next.name);// +' toParams: ' +JSON.stringify(toParams) +' fromParams: ' +JSON.stringify(fromParams));
            if (next.name === CONST.APPSTATE.HOME) {
                StorageSrv.reset([CONST.KEY.SIGNING_RES, CONST.KEY.VISIBLE_MTGS]);
            }
        });

        $rootScope.$on('$stateChangeError', console.error.bind(console)); // $log.error.bind didn't work for .spec tests

        // GLOBAL VARIABLES
        // $rootScope.menu      FULL = 2, HALF = 1,  CLOSED = 0
        // $rootScope.isMobile
        // $rootScope.isTooltips
        // rootScope.env_dev

        $rootScope.env_dev = ENV.app_env !== 'prod';

        console.log("app.run: UA=" + $window.navigator.userAgent);
        $rootScope.isIe = Utils.isUaIe($window.navigator.userAgent);
        $rootScope.isEdge = Utils.isUAEdge($window.navigator.userAgent);
        $rootScope.isMobile = Utils.isClientMobile();
        $rootScope.isTablet = Utils.isUaMobile();
        $rootScope.isTooltips = !$rootScope.isMobile && !$rootScope.isTablet;
        console.log("app.run: IE=" + $rootScope.isIe + "  Edge=" + $rootScope.isEdge + " Mobile=" + $rootScope.isMobile + " Tooltips=" + $rootScope.isTooltips);
        $rootScope.parallelMode = false;

        // Confirmation for tab/browser closing
        $rootScope.txtConfirmCloseApp = '';
        $translate('STR_CONFIRM_CLOSE_APP').then(function (translation) {
            $rootScope.txtConfirmCloseApp = translation;
        });
        $window.onbeforeunload = function () {
            // onbeforeunload Confirmation will be displayed without the custom text by Safari and FF.
            return $state.is(CONST.APPSTATE.HOME) || $state.is(CONST.APPSTATE.LOGIN) ? undefined : $rootScope.txtConfirmCloseApp;
        };

        $rootScope.goHome = function () {
            $state.go(CONST.APPSTATE.HOME);
        };

        $rootScope.goBack = function () {
            $window.history.back();
        };

        $rootScope.goErrorLanding = function () {
            $state.go(CONST.APPSTATE.ERROR);
        };

        $rootScope.openMenu = function () {
            $timeout(function () {
                $rootScope.menu = CONST.MENU.FULL;
            }, 0);
        };

        $rootScope.closeMenu = function () {
            if ($rootScope.menu > CONST.MENU.CLOSED) {
                $timeout(function () {
                    $rootScope.menu = $rootScope.menu - 1;
                }, 0);
            }
        };

        $rootScope.menuClosed = function () {
            return $rootScope.menu === CONST.MENU.CLOSED;
        };

        $rootScope.menuHalf = function () {
            return $rootScope.menu === CONST.MENU.HALF;
        };

        $rootScope.menuFull = function () {
            return $rootScope.menu === CONST.MENU.FULL;
        };

        $rootScope.successInfo = function (info) {
            $translate(info).then(function (translatedValue) {
                ngToast.success(translatedValue);
            });
        };

        $rootScope.failedInfo = function (info) {
            $translate(info).then(function (translatedValue) {
                ngToast.danger(translatedValue);
            });
        };
    });

angular.module('dashboard')
    .config(function ($provide) {
        $provide.decorator("$exceptionHandler", ['$delegate', '$injector', function ($delegate, $injector) {
            return function (aException, aCause) {
                $delegate(aException, aCause);

                console.log('dashboard.exceptionHandler: redirecting state');
                var $rs = $injector.get("$rootScope");
                $rs.apperror = { exception: aException, cause: aCause };
                $rs.goErrorLanding();
            };
        }]);
    });
