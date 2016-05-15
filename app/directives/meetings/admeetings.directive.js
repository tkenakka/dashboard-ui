/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc directive
* @name dashboard.directive:adMeetingsDirective
* @description
* # adMeetingsDirective
*/
angular.module('dashboard')
    .constant('MTGD', {
        'VISIBLE': {
            OPEN: 4,
            CLOSED: 5
        }
    })
    .directive('adMeetings', [function() {

        var controller = ['$log', '$scope', 'ENV', 'AhjoMeetingsSrv', '$translate', '$rootScope', 'MTGD', 'CONST', function($log, $scope, ENV, AhjoMeetingsSrv, $translate, $rootScope, MTGD, CONST) {
            $log.log("adMeetings: CONTROLLER");
            var self = this;
            self.mtgErr = null;
            self.loading = true;
            self.responseData = {};
            self.data = [];
            self.isMobile = $rootScope.isMobile;

            self.agencyData = [];
            self.roleData = [];

            self.aF = null;
            self.rF = null;
            self.agencyTitle = null;

            function setTitle() {
                if (!self.aF) {
                    $translate('STR_AGENCY').then(function(agency) {
                        self.agencyTitle = agency;
                    });
                }
                else {
                    self.agencyTitle = self.aF;
                }
            }

            function setData() {
                self.data = [];
                if (self.responseData instanceof Object && self.responseData.objects instanceof Array) {
                    for (var i = 0; i < self.responseData.objects.length; i++) {
                        var item = self.responseData.objects[i];
                        var aVisible = self.aF ? (self.aF === item.agencyName) : true;
                        var fVisible = false;

                        if ($scope.visibleMeetings === MTGD.VISIBLE.OPEN && item.state) {
                            fVisible = item.state <= MTGD.VISIBLE.OPEN;
                        }
                        else if ($scope.visibleMeetings === MTGD.VISIBLE.CLOSED && item.state) {
                            fVisible = item.state >= MTGD.VISIBLE.CLOSED;
                        }

                        for (var j = 0; j < item.roleIDs.length; j++) {
                            var role = item.roleIDs[j].RoleName;
                            var roleId = item.roleIDs[j].RoleID;

                            var rVisible = (roleId === 2);
                            self.data.push({
                                'meeting': item,
                                'role': role,
                                'visible': aVisible && rVisible && fVisible
                            });
                        }
                    }
                }
            }

            function parseRoleDropdown() {
                self.roleData = [];
                for (var i = 0; i < self.data.length; i++) {
                    var item = self.data[i].meeting;
                    var visible = self.data[i].visible;
                    for (var j = 0; j < item.roleIDs.length && visible; j++) {
                        var role = item.roleIDs[j].RoleName;
                        if (role && self.roleData.indexOf(role) === -1) {
                            self.roleData.push(role);
                        }
                    }
                }
            }

            function parseAgencyDropdown() {
                self.agencyData = [];
                for (var i = 0; i < self.data.length; i++) {
                    var agency = self.data[i].meeting.agencyName;
                    var visible = self.data[i].visible;
                    if (agency && self.agencyData.indexOf(agency) === -1 && visible) {
                        self.agencyData.push(agency);
                    }
                }
            }

            function FakeMtg(title, date, status, type) {
                return {
                    "agencyHandlerLanguage": "fi",
                    "updatedDateTime": "0001-01-01T00:00:00",
                    "meetingNumber": 12,
                    "meetingGuid": "dfe01535-cd69-4228-9dfb-5831e0060e43",
                    "name": title,
                    "meetingID": null,
                    "meetingDate": date,
                    "meetingTime": date,
                    "meetingType_ID": 1,
                    "state": status,
                    "startDateTime": date,//"2016-03-30T09:00:00.0",
                    "endDateTime": null,
                    "agencyGuid": "02900",
                    "agencyName": type,
                    "agencyNameSV": "Stadsfullmäktige",
                    "agendaGuid": null,
                    "agendaGuidSwe": null,
                    "articleNumber": null,
                    "language": "fi",
                    "isSaliEnabled": true,
                    "isSaliSynced": false,
                    "isMultiLanguage": true,
                    "currentSecretaryGuid": null,
                    "location": null,
                    "roleIDs": [
                        {
                            "IsDeputy": true,
                            "IsPresent": false,
                            "RoleID": 2,
                            "RoleName": "Päätösvaltainen osallistuja"
                        }
                    ],
                    "isDeputy": null,
                    "isPresent": false
                };
            }

            function getFakeMtgs() {
                return {
                    "meta": {},
                    "objects": [

                        new FakeMtg('Kaupunginvaltuusto 09 / 11.05.2016', "2016-04-13T09:00:00.0", 1, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 08 / 27.04.2016', "2016-04-13T09:00:00.0", 1, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 07 / 13.04.2016', "2016-04-13T09:00:00.0", 3, "Kaupunginvaltuusto"),

                        new FakeMtg('Kaupunginvaltuusto 06 / 30.03.2016', "2016-03-30T09:00:00.0", 7, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 05 / 16.03.2016', "2016-03-16T09:00:00.0", 7, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 04 / 02.03.2016', "2016-03-02T09:00:00.0", 7, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 03 / 17.02.2016', "2016-02-17T09:00:00.0", 7, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 02 / 03.02.2016', "2016-02-03T09:00:00.0", 7, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 01 / 20.01.2016', "2016-01-20T09:00:00.0", 7, "Kaupunginvaltuusto"),

                        new FakeMtg('Kaupunginvaltuusto 21 / 09.12.2015', "2016-01-20T09:00:00.0", 7, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 20 / 02.12.2015', "2016-01-20T09:00:00.0", 7, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 19 / 25.11.2015', "2016-01-20T09:00:00.0", 7, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 18 / 11.11.2015', "2016-01-20T09:00:00.0", 7, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 17 / 04.11.2015', "2016-01-20T09:00:00.0", 7, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 16 / 21.10.2015', "2016-01-20T09:00:00.0", 7, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 15 / 07.10.2015', "2016-01-20T09:00:00.0", 7, "Kaupunginvaltuusto"),
                        new FakeMtg('Kaupunginvaltuusto 14 / 23.09.2015', "2016-01-20T09:00:00.0", 7, "Kaupunginvaltuusto"),


                        new FakeMtg('Asuntolautakunta 03 / 31.03.2016', "2016-03-31T09:00:00.0", 1, "Asuntolautakunta"),
                        new FakeMtg('Asuntolautakunta 02 / 18.02.2016', "2016-02-18T09:00:00.0", 1, "Asuntolautakunta"),
                        new FakeMtg('Asuntolautakunta 01 / 21.01.2016', "2016-01-21T09:00:00.0", 7, "Asuntolautakunta"),
                        new FakeMtg('Eläintarhan johtokunta 01 / 21.01.2016', "2016-01-21T09:00:00.0", 1, "Eläintarhan johtokunta"),
                        new FakeMtg('Eläintarhan johtokunta 01 / 07.01.2016', "2016-01-07:00:00.0", 5, "Eläintarhan johtokunta")

                    ]
                };

            }

            AhjoMeetingsSrv.getMeetings().then(function(response) {
                self.responseData1 = response;
                self.responseData = getFakeMtgs();
                if ("objects" in self.responseData) {
                    $log.debug("adMeetings: getMeetings done: " + self.responseData.objects.length);
                }
            }, function(error) {
                $log.error("adMeetings: getMeetings error: " + JSON.stringify(error));
                self.mtgErr = error;
            }).finally(function() {
                setData();
                parseAgencyDropdown();
                parseRoleDropdown();
                self.loading = false;
            });

            $scope.$watch(function() {
                return {
                    visibleMeetings: $scope.visibleMeetings
                };
            }, function(data) {
                $log.debug("adMeetings: WATCH " + JSON.stringify(data));
                setData();
                parseAgencyDropdown();
                parseRoleDropdown();
            }, true);

            self.setAgencyFilter = function(agency) {
                $log.debug("adMeetings: setAgencyFilter: " + agency);
                self.aF = agency;
                setData();
                parseRoleDropdown();
                if (!agency) {
                    parseAgencyDropdown();
                }
                setTitle();
                $scope.agencyIsOpen = false;
            };

            self.setRoleFilter = function(role) {
                $log.debug("adMeetings: setRoleFilter: " + role);
                self.rF = role;
                setData();
                parseAgencyDropdown();
                if (!role) {
                    parseRoleDropdown();
                }
                setTitle();
                $scope.roleIsOpen = false;
            };

            self.statusStringId = function (arg) {
                if (angular.isObject(arg) && angular.isDefined(arg.meeting) && angular.isDefined(arg.meeting.state)) {
                    for (var item in CONST.MTGSTATUS) {
                        if (CONST.MTGSTATUS.hasOwnProperty(item)) {
                            if (arg.meeting.state === CONST.MTGSTATUS[item].value) {
                                return CONST.MTGSTATUS[item].stringId;
                            }
                        }
                    }
                }
                return 'STR_TOPIC_UNKNOWN';
            };

            self.mtgStatusClass = function (arg) {
                if (angular.isObject(arg) && angular.isDefined(arg.meeting.state) && angular.isDefined(arg.meeting.state)) {
                    var s = $rootScope.objWithVal(CONST.MTGSTATUS, 'value', arg.meeting.state);
                    return s ? s.badgeClass : 'db-badge-red';
                }
                return 'db-badge-red';
            };

            setTitle();
        }];

        return {
            scope: {
                visibleMeetings: '=',
                selected: '&onSelected'
            },
            templateUrl: 'directives/meetings/adMeetings.Directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'ctrl',
            replace: 'true'
        };
    }]);
