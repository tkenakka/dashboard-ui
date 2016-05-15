/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc function
* @name dashboard.controller:meetingStatusCtrl
* @description
* # meetingStatusCtrl
* Controller of the dashboard
*/
angular.module('dashboard')
    .controller('meetingStatusCtrl', ['$log', '$scope', '$rootScope', '$stateParams', '$state', 'CONST', 'StorageSrv', 'ENV', 'AhjoMeetingSrv', '$timeout', function ($log, $scope, $rootScope, $stateParams, $state, CONST, StorageSrv, ENV, AhjoMeetingSrv, $timeout) {
        $log.debug("meetingStatusCtrl: CONTROLLER");
        var self = this;
        $rootScope.menu = $stateParams.menu;
        self.title = 'MOBILE TITLE';
        self.meeting = null;
        self.chairman = false;
        self.loading = true;
        self.hasUnsavedProposal = false;
        self.remarkIsUnsaved = false;
        self.unsavedConfig = { title: 'STR_CONFIRM', text: 'STR_WARNING_UNSAVED', yes: 'STR_CONTINUE' };
        var meetingItem = StorageSrv.getKey(CONST.KEY.MEETING_ITEM);
        self.isMobile = $rootScope.isMobile;
        var pollingTimer = null;
        var lastEventId = null;
        var selectedTopicGuid = null;

        for (var i = 0; i < ENV.SupportedRoles.length; i++) {
            if (ENV.SupportedRoles[i].RoleID === CONST.MTGROLE.CHAIRMAN) {
                self.chairman = true;
            }
        }
/*
        function meetingStatusChanged(event) {
            $log.debug("meetingStatusCtrl: meetingStatusChanged");
            if (angular.isObject(event) && angular.isObject(self.meeting)) {
                self.meeting.meetingStatus = event.meetingStateType;
            }
        }

        function topicStatusChanged(event) {
            $log.debug("meetingStatusCtrl: topicStatusChanged");
            if (angular.isObject(event) && angular.isObject(self.meeting) && angular.isArray(self.meeting.topicList)) {
                for (var i = 0; i < self.meeting.topicList.length; i++) {
                    var topic = self.meeting.topicList[i];
                    if (angular.isObject(topic) && angular.equals(topic.topicGuid, event.topicID)) {
                        topic.topicStatus = event.topicStateType;
                    }
                }
            }
        }
*/
        function proposalsStatusChanged(events) {
            $log.debug("meetingStatusCtrl: proposalsStatusChanged");
            if (angular.isArray(events) && angular.isObject(self.meeting) && angular.isArray(self.meeting.topicList)) {

                var changedTopicGuidArray = [];
                angular.forEach(events, function (topic) {
                    if (angular.isObject(topic) && angular.isObject(topic.proposal) && angular.isString(topic.proposal.topicGuid)) {
                        changedTopicGuidArray.push(topic.proposal.topicGuid);
                    }
                }, changedTopicGuidArray);

                for (var j = 0; j < self.meeting.topicList.length; j++) {
                    var topic = self.meeting.topicList[j];
                    if (angular.isObject(topic)) {
                        topic.isModified = (changedTopicGuidArray.indexOf(topic.topicGuid) > CONST.NOTFOUND);
                        if (!self.isMobile && angular.equals(topic.topicGuid, selectedTopicGuid)) {
                            StorageSrv.setKey(CONST.KEY.TOPIC, angular.copy(topic));
                        }
                    }
                }
            }
        }
/*
        function getEvents() {
            if (lastEventId && meetingItem.meetingGuid) {
                var proposalEvents = [];
                var deleteEvents = [];
                AhjoMeetingSrv.getEvents(lastEventId, meetingItem.meetingGuid).then(function (response) {
                    if (angular.isArray(response)) {
                        response.forEach(function (event) {
                            $log.debug("meetingStatusCtrl: getEvents then: " + event.typeName);
                            console.log(event);
                            switch (event.typeName) {
                                case CONST.MTGEVENT.LASTEVENTID:
                                    lastEventId = event.lastEventId;
                                    break;
                                case CONST.MTGEVENT.REMARKPUBLISHED:
                                case CONST.MTGEVENT.REMARKUPDATED:
                                    if (angular.isObject(event) && angular.isObject(event.proposal) && event.proposal.isOwnProposal !== true) {
                                        proposalEvents.push(event);
                                    }
                                    break;
                                case CONST.MTGEVENT.REMARKDELETED:
                                    if (angular.isObject(event) && angular.isString(event.deletedProposal)) {
                                        deleteEvents.push(event);
                                    }
                                    break;
                                case CONST.MTGEVENT.MEETINGSTATECHANGED:
                                    meetingStatusChanged(event);
                                    break;
                                case CONST.MTGEVENT.TOPICSTATECHANGED:
                                    topicStatusChanged(event);
                                    break;
                                default:
                                    $log.error("meetingStatusCtrl: unsupported typeName: " + event.typeName);
                                    break;
                            }
                        }, this);
                    }
                }, function (error) {
                    $log.error("meetingStatusCtrl: getEvents error: " + JSON.stringify(error));
                }).finally(function () {
                    $timeout.cancel(pollingTimer);
                    pollingTimer = $timeout(function () {
                        getEvents();
                    }, CONST.POLLINGTIMEOUT);

                    if (proposalEvents.length) {
                        var events = angular.copy(StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY));
                        if (angular.isArray(events)) {
                            var concated = events.concat(proposalEvents);
                            StorageSrv.setKey(CONST.KEY.PROPOSAL_EVENT_ARRAY, concated);
                        }
                    }
                    if (deleteEvents.length) {
                        $rootScope.$emit(CONST.PROPOSALDELETED, { deleted: deleteEvents });
                    }
                });
            }
            else {
                $log.error("meetingStatusCtrl: getEvents invalid parameter:");
            }
        }
*/
        var fakeTopicGuid = 1;
        function FakeTopic(ref, title, status, pub, remarks) {
            var essi = "http://www.hel.fi/static/public/hela/Kaupunginvaltuusto/Suomi/Esitys/2016/Kanslia_2016-04-13_Kvsto_7_El/D2BA2366-B816-4051-8FD6-BDD17F2AC1AA/Kunnan_asukkaan_aloite_taloudellisten_resurssien_o.pdf";
            return {
                "topicreference": ref,
                "presenterName": null,
                "presenterabbr": "Sj",
                "introducerId": "Kvsto",
                "topicNumber": 1,
                "topicGuid": "" + fakeTopicGuid++,
                "sequencenumber": 1,
                "publicity": pub,
                "moment": 0,
                "topicStatus": status,
                "topicStatusText": "Käsittelyssä",
                "title": title,
                "includePublishedRemark": angular.isDefined(remarks) ? remarks : true,
                "confidentiallityreason": "",
                "confidentiallityreasonTranslatation": "",
                "topicTitle": title,
                "topicTitleTranslation": "title",
                "isCreatedInMeeting": null,
                "attachment": [
                    {
                        "attachmentGuid": "ac7c2906-1d36-468b-a884-2f7b994b8f75",
                        "topicGuid": "6ea83676-5a70-4e4d-851d-b8f3494f61c4",
                        "publicity": 1,
                        "language": "fi-FI",
                        "link": "http://www.hel.fi/static/public/hela/Kaupunginvaltuusto/Suomi/Paatos/2016/Kanslia_2016-04-13_Kvsto_7_Pk/47C0456F-F043-47BD-AADE-2E9A1CDC8262/Liite.pdf",
                        "number": 1,
                        "title": "Helsingin seuraparlamentin kuntalaisaloite",
                        "attachmentTitle": "Helsingin seuraparlamentin kuntalaisaloite",
                        "mimeType": null,
                        "publicDocumentExists": true
                    },
                    {
                        "attachmentGuid": "ac7c2906-1d36-468b-a884-2f7b994b8f75",
                        "topicGuid": "6ea83676-5a70-4e4d-851d-b8f3494f61c4",
                        "publicity": 1,
                        "language": "fi-FI",
                        "link": "http://www.hel.fi/static/public/hela/Kaupunginvaltuusto/Suomi/Paatos/2016/Kanslia_2016-04-13_Kvsto_7_Pk/47C0456F-F043-47BD-AADE-2E9A1CDC8262/Liite.pdf",
                        "number": 2,
                        "title": "Helsingin seuraparlamentin kuntalaisaloite",
                        "attachmentTitle": "Oltkn lausunto.pdf",
                        "mimeType": null,
                        "publicDocumentExists": true
                    },
                    {
                        "attachmentGuid": "ac7c2906-1d36-468b-a884-2f7b994b8f75",
                        "topicGuid": "6ea83676-5a70-4e4d-851d-b8f3494f61c4",
                        "publicity": 1,
                        "language": "fi-FI",
                        "link": "http://www.hel.fi/static/public/hela/Kaupunginvaltuusto/Suomi/Esitys/2016/Kanslia_2016-04-13_Kvsto_7_El/D2BA2366-B816-4051-8FD6-BDD17F2AC1AA/Kunnan_asukkaan_aloite_taloudellisten_resurssien_o.pdf",
                        "number": 3,
                        "title": "Helsingin seuraparlamentin kuntalaisaloite",
                        "attachmentTitle": "Lltkn lausunto.pdf",
                        "mimeType": null,
                        "publicDocumentExists": true
                    }
                ],
                "esitykset": [
                    {
                        "number": null,
                        "documentTitle": null,
                        "documentGuid": "87adfc2a-326d-49a7-903f-c3a4180eb775",
                        "topicGuid": "6ea83676-5a70-4e4d-851d-b8f3494f61c4",
                        "publicity": 1,
                        "language": "fi-FI",
                        "type": "application/pdf",
                        "link": essi
                    }
                ],
                "decision": [
                    {
                        "dokutyypit": 3,
                        "decisionTitle": "Kaupunginhallitus 29.03.2016 § 268",
                        "number": 1,
                        "title": "Kaupunginhallitus 29.03.2016 § 268",
                        "decisionGuid": "879b0dbf-bc44-4a4e-91c8-2663d23cd673",
                        "topicGuid": "6ea83676-5a70-4e4d-851d-b8f3494f61c4",
                        "publicity": 1,
                        "language": "fi-FI",
                        "link": essi,
                        "type": "application/pdf"
                    },
                    {
                        "dokutyypit": 3,
                        "decisionTitle": "Liikuntalautakunta 28.05.2015 § 114",
                        "number": 2,
                        "title": "Liikuntalautakunta 02.06.2011 58",
                        "decisionGuid": "a86b4cec-580a-42d9-b1c2-3f657b1d535c",
                        "topicGuid": "6ea83676-5a70-4e4d-851d-b8f3494f61c4",
                        "publicity": 1,
                        "language": "fi-FI",
                        "link": "http://wv0001121/Kokoussovellus/Meeting/DecisionHistory/a86b4cec-580a-42d9-b1c2-3f657b1d535c",
                        "type": "application/pdf"
                    },
                    {
                        "dokutyypit": 3,
                        "decisionTitle": "Opetuslautakunta 26.05.2015 § 91",
                        "number": 3,
                        "title": "Liikuntalautakunta 01.06.2011 55",
                        "decisionGuid": "5a92054a-0154-4bf4-b834-a51cfbe837da",
                        "topicGuid": "6ea83676-5a70-4e4d-851d-b8f3494f61c4",
                        "publicity": 1,
                        "language": "fi-FI",
                        "link": "http://wv0001121/Kokoussovellus/Meeting/DecisionHistory/5a92054a-0154-4bf4-b834-a51cfbe837da",
                        "type": "application/pdf"
                    }
                ],
                "additionalMaterial": [
                    {
                        "dokutyypit": null,
                        "additionalMaterialTitle": "oheismateriaali.pdf",
                        "number": 1,
                        "title": "oheism j.pdf",
                        "additionalMaterialGuid": "14b951ae-c102-4da3-8b81-65cda8fc575a",
                        "topicGuid": "6ea83676-5a70-4e4d-851d-b8f3494f61c4",
                        "publicity": 1,
                        "language": "fi-FI",
                        "mimeType": null,
                        "publicDocumentExists": true,
                        "link": "http://wv0001121/Kokoussovellus/Meeting/AdditionalMaterial/14b951ae-c102-4da3-8b81-65cda8fc575a"
                    },
                    {
                        "dokutyypit": null,
                        "additionalMaterialTitle": "Materiaali salassa pidettävä (JulkL 24 1 mom 4 k.)",
                        "number": 2,
                        "title": "oheism sp.pdf",
                        "additionalMaterialGuid": "f7be8774-104f-46a2-aa32-ddf3e9b083bc",
                        "topicGuid": "6ea83676-5a70-4e4d-851d-b8f3494f61c4",
                        "publicity": 2,
                        "language": "fi-FI",
                        "mimeType": null,
                        "publicDocumentExists": false,
                        "link": null
                    }
                ],
                "presenterGuid": "38ba9817-5da5-4294-b088-bab42d215e48",
                "titleTranslation": "SV V2 dokujen testi 1.1 MaE",
                "chairmanGuid": null,
                "secretaryGuid": null,
                "chairmanName": " ",
                "secretaryName": " ",
                "language": "fi-FI",
                "mixedLanguage": false
            };
        }

        function FakeMtg(status) {
            var res =
                // {
                //     "meta": {},
                //     "objects": [
                {
                    "currentSecretary": null,
                    "userPersonGuid": "926eee0b-8e94-4a14-beec-d9b60590547f",
                    "meetingStatus": status,
                    "topicStatus": 0,
                    "lastEventId": 20208,
                    "userRoleId": 2,
                    "presentationPublicity": 0,
                    "meetingStatusText": "Käynnissä",
                    "meetingTitle": "Kaupunginvaltuusto 07 / 13.04.2016",
                    "userPersonName": "Aaltio Elina",
                    "selectedTopicGuid": null,
                    "redirectContentName": null,
                    "redirectContentData": null,
                    "agencyHandlerLanguage": "fi",
                    "topicList": [
                        new FakeTopic("92 Pj/1", "Nimenhuuto, laillisuus ja päätösvaltaisuus", 4, 1, false),
                        new FakeTopic("93 Pj/2", "Pöytäkirjan tarkastajien valinta ", 4, 1, false),
                        new FakeTopic("93 Pj/3", "Kyselytunti", 4, 1, false),
                        new FakeTopic("95 Sj/8", "Yhtenäisten peruskoulujen muodostaminen Vuosaaren alueelle", 3, 1),
                        new FakeTopic("96 Kj/4", "Kunnan asukkaan aloite taloudellisten resurssien osoittamisesta koululiikunnan lisäämiseen", 2, 1),
                        new FakeTopic("97 Stj/5", "Kunnan  asukkaan aloite vaikeavammaisten ihmisten aseman paranta-miseksi", 1, 1),
                        new FakeTopic("97 Stj/6", "Kunnan asukkaan aloite veneiden talvisäilytyspaikoista", 1, 1),
                        new FakeTopic("99 Sj/7", "Kunnan asukkaan aloite sotaorpojen maksuttomista uintilipuista", 1, 1),
                        new FakeTopic("100 Kaj/9", "Kunnan asukkaan aloite asunnoista ja liiketiloista Puotilan ostoskeskuksen paikalle", 1, 1, false),
                        new FakeTopic("101 Kaj/10", "Kunnan asukkaan aloite suomalaisen muotoilun edistämisestä maankäytön suunnittelun, kaavoituksen sekä rakennushankkeiden luvituksen ja toteutuksen yhteydessä ", 1, 1),
                        new FakeTopic("102 Kaj/11", "Kunnan asukkaan aloite alueellisten poikkeamisten menetelmien kehittämiseksi korjausrakentamisen helpottamiseksi", 1, 1, false),
                        new FakeTopic("", "-/12 Kokouksessa jätetyt aloitteet ", 1, 1, false)



                    ]
                };
                //     ]
                // };
            return res;
        }

        if (meetingItem) {
            self.meeting = null;
            selectedTopicGuid = null;
            StorageSrv.deleteKey(CONST.KEY.TOPIC);
            AhjoMeetingSrv.getMeeting(meetingItem.meetingGuid).then(function (response) {
                if (angular.isObject(response) && angular.isArray(response.objects) && response.objects.length) {
                    self.meeting1 = response.objects[0];
                    self.meeting = new FakeMtg(3);
                    if (angular.isObject(self.meeting) && angular.isArray(self.meeting.topicList)) {

                        angular.forEach(self.meeting.topicList, function (topic) {
                            if (angular.isObject(topic)) {
                                topic.userPersonGuid = self.meeting.userPersonGuid;
                                topic.isCityCouncil = self.meeting.isCityCouncil;

                                if (!selectedTopicGuid && topic.topicGuid) {
                                    selectedTopicGuid = topic.topicGuid;
                                    if (!self.isMobile) {
                                        StorageSrv.setKey(CONST.KEY.TOPIC, topic);
                                    }
                                }
                            }
                        }, this);

                        lastEventId = self.meeting.lastEventId; // 19734, 20281;
                        // $timeout.cancel(pollingTimer);
                        // pollingTimer = $timeout(function() {
                        //     getEvents();
                        // }, CONST.POLLINGTIMEOUT);
                    }
                }
            }, function (error) {
                $log.error("meetingStatusCtrl: getMeeting error: " + JSON.stringify(error));
                self.error = error;
            }).finally(function () {
                self.loading = false;
            });
        }
        else {
            $state.go(CONST.APPSTATE.HOME, { menu: CONST.MENU.CLOSED });
        }

        self.goHome = function () {
            $state.go(CONST.APPSTATE.HOME, { menu: CONST.MENU.CLOSED });
        };

        self.topicSelected = function (topic) {
            if (angular.isObject(topic)) {
                $log.debug("meetingStatusCtrl.topicSelected: publicity=" + topic.publicity);
                topic.userPersonGuid = self.meeting.userPersonGuid;
                topic.isCityCouncil = self.meeting.isCityCouncil;
                selectedTopicGuid = topic.topicGuid;
                StorageSrv.setKey(CONST.KEY.TOPIC, angular.copy(topic));
                if (self.isMobile) {
                    $state.go(CONST.APPSTATE.MEETINGDETAILS, {});
                }
                self.hasUnsavedProposal = false;
                self.remarkIsUnsaved = false;
            }
            else {
                $log.error("meetingStatusCtrl: topicSelected: invalid parameter");
            }
        };

        self.isSelected = function (topic) {
            return (angular.isObject(topic) && topic.topicGuid === selectedTopicGuid);
        };

        self.isTopicPublic = function (topic) {
            return (angular.isObject(topic) && topic.publicity === CONST.PUBLICITY.PUBLIC);
        };

        self.statusIcon = function (topic) {
            if (angular.isObject(topic) && topic.topicStatus) {
                for (var item in CONST.TOPICSTATUS) {
                    if (CONST.TOPICSTATUS.hasOwnProperty(item) && topic.topicStatus === CONST.TOPICSTATUS[item].value) {
                        return CONST.TOPICSTATUS[item].iconPath;
                    }
                }
            }
            return null;
        };

        self.topicStatusText = function (topic) {
            if (angular.isObject(topic) && topic.topicStatus) {
                for (var item in CONST.TOPICSTATUS) {
                    if (CONST.TOPICSTATUS.hasOwnProperty(item) && topic.topicStatus === CONST.TOPICSTATUS[item].value) {
                        return CONST.TOPICSTATUS[item].stringId;
                    }
                }
            }
            return null;
        };


        self.stringId = function (meeting) {
            var tmp;
            tmp = 1;
            for (var item in CONST.MTGSTATUS) {
                if (CONST.MTGSTATUS.hasOwnProperty(item)) {
                    if (angular.isObject(meeting) && meeting.meetingStatus === CONST.MTGSTATUS[item].value) {
                        return CONST.MTGSTATUS[item].stringId;
                    }
                }
            }
            return 'STR_TOPIC_UNKNOWN';
        };

        self.mtgStatusClass = function (meeting) {
            if (angular.isObject(meeting)) {
                var s = $rootScope.objWithVal(CONST.MTGSTATUS, CONST.KEY.VALUE, meeting.meetingStatus);
                return s ? s.badgeClass : 'db-badge-red';
            }
            return 'db-badge-red';
        };

        $scope.$watch(function () {
            return StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY);
        }, function (events, oldEvents) {
            if (!angular.equals(events, oldEvents)) {
                proposalsStatusChanged(events);
            }
        });

        var unsavedProposalWatcher = $rootScope.$on(CONST.PROPOSALSHASUNSAVED, function (event, hasUnsaved) {
            self.hasUnsavedProposal = hasUnsaved ? true : false;
        });

        var unsavedRemarkWatcher = $rootScope.$on(CONST.REMARKISUNSAVED, function (event, isUnsaved) {
            self.remarkIsUnsaved = isUnsaved ? true : false;
        });

        $scope.$on('$destroy', unsavedRemarkWatcher);
        $scope.$on('$destroy', unsavedProposalWatcher);

        $scope.$on('$destroy', function () {
            $log.debug("meetingStatusCtrl: DESTROY");
            $timeout.cancel(pollingTimer);
        });

    }]);
