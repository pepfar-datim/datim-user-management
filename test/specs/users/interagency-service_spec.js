describe('Inter agency service', function () {
    var fixtures = window.fixtures;
    var service;

    beforeEach(module('PEPFAR.usermanagement'));
    beforeEach(inject(function ($injector) {
        service = $injector.get('interAgencyService');
    }));

    it('should be an object', function () {
        expect(service).toBeAnObject();
    });

    it('should have a method getUserGroups', function () {
        expect(service.getUserGroups).toBeDefined();
    });

    describe('getUserGroups', function () {
        var $httpBackend;
        var userGroupRequest;
        var errorHandler;

        beforeEach(inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            errorHandler = $injector.get('errorHandler');
            spyOn(errorHandler, 'errorFn');

            userGroupRequest = $httpBackend.expectGET('http://localhost:8080/dhis/api/userGroups?fields=id,name&filter=name:like:OU+Rwanda+Country+team&paging=false')
                .respond(200, fixtures.get('interAgencyGroupUsers'));
            $httpBackend.expectGET('http://localhost:8080/dhis/api/userGroups?fields=id,name&filter=name:like:OU+Rwanda+user+administrators&paging=false')
                .respond(200, fixtures.get('interAgencyGroupAdmin'));
            $httpBackend.expectGET('http://localhost:8080/dhis/api/userGroups?fields=id,name&filter=name:like:OU+Rwanda+all+mechanisms&paging=false')
                .respond(200, fixtures.get('interAgencyGroupMech'));
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should return the correct usergroups', function () {
            var userGroups;
            var expectedUserGroups = {
                userUserGroup: {
                    id: 'LqrnY1CgnCv',
                    name: 'OU Rwanda Country team'
                },
                userAdminUserGroup: {
                    id: 'sJSLgsi6KjY',
                    name: 'OU Rwanda User administrators'
                },
                mechUserGroup: {
                    id: 'OGAFubEVJK0',
                    name: 'OU Rwanda All mechanisms'
                }
            };

            service.getUserGroups({name: 'Rwanda'}).then(function (response) {
                userGroups = response;
            });
            $httpBackend.flush();

            expect(userGroups).toEqual(expectedUserGroups);
        });

        it('should log an error when one of the requests fail', function () {
            var catchFunction = jasmine.createSpy();

            userGroupRequest.respond(404);

            service.getUserGroups({name: 'Rwanda'}).catch(catchFunction);
            $httpBackend.flush();

            expect(catchFunction).toHaveBeenCalled();
        });

        it('should have called the error log', function () {
            var catchFunction = jasmine.createSpy();

            userGroupRequest.respond(404);

            service.getUserGroups({name: 'Rwanda'}).catch(catchFunction);
            $httpBackend.flush();

            expect(errorHandler.errorFn).toHaveBeenCalled();
        });

        it('should filter the userGroup with the correct name', function () {
            var expectedUserGroup = {name: 'OU Rwanda Country team'};
            var actualUserGroups;

            userGroupRequest.respond(200, {userGroups: [
                {name: 'OU Kenya Country team'},
                {name: 'OU Rwanda Country team'},
                {name: 'Some Group'}
            ]});

            service.getUserGroups({name: 'Rwanda'}).then(function (userGroups) {
                actualUserGroups = userGroups;
            });
            $httpBackend.flush();

            expect(actualUserGroups.userUserGroup).toEqual(expectedUserGroup);
        });

        it('should reject the promise if there is no org unit', inject(function ($rootScope) {
            var catchFunction = jasmine.createSpy();
            $httpBackend.resetExpectations();

            service.getUserGroups()
                .catch(catchFunction);

            $rootScope.$apply();

            expect(catchFunction).toHaveBeenCalledWith('No organisation unit found on the current user');
        }));
    });
});
