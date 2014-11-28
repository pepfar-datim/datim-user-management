describe('Userlist controller', function () {
    var controller;
    var getListSpy;
    var userStatusServiceMockFactory;
    var userStatusService;
    var errorHandler;
    var $rootScope;

    beforeEach(module('PEPFAR.usermanagement', function ($provide) {
        getListSpy = jasmine.createSpy().and.returnValue({
            then: function (callback) {
                callback(window.fixtures.get('usersPage1').users);
            }
        });

        userStatusServiceMockFactory = function ($q) {
            var success = $q.when(window.fixtures.get('userPutSuccess'));
            var failure = $q.reject('Failed');

            return {
                enable: jasmine.createSpy().and.returnValue(success),
                disable: jasmine.createSpy().and.returnValue(success),
                SETTOFAIL: function () {
                    this.enable = jasmine.createSpy().and.returnValue(failure);
                    this.disable = jasmine.createSpy().and.returnValue(failure);
                }
            };
        };

        $provide.value('userFilter', [
            {name: 'Name'},
            {name: 'Username'},
            {name: 'E-Mail'},
            {name: 'Roles'},
            {name: 'User Groups'},
            {name: 'Organisation Unit'},
            {name: 'Types'}
        ]);
        $provide.value('userTypes', {

        });
        $provide.value('dataGroups', {

        });
        $provide.factory('userListService', function (paginationService) {
            return {
                getList: getListSpy,
                pagination: paginationService
            };
        });
        $provide.factory('userStatusService', userStatusServiceMockFactory);
        $provide.factory('errorHandler', function () {
            return {
                error: jasmine.createSpy()
            };
        });
    }));

    beforeEach(inject(function ($injector) {
        var $controller = $injector.get('$controller');

        userStatusService = $injector.get('userStatusService');
        errorHandler = $injector.get('errorHandler');
        $rootScope = $injector.get('$rootScope');

        controller = $controller('userListController', {});
    }));

    it('should be an object', function () {
        expect(controller).toBeAnObject();
    });

    it('should have a property for the userList', function () {
        expect(controller.users).toBeDefined();
    });

    it('should call getlist on the userservice', function () {
        expect(getListSpy).toHaveBeenCalled();
    });

    it('should set the initial userlist onto the controller', function () {
        expect(controller.users).toBeAnArray();
        expect(controller.users.length).toBe(50);
    });

    it('should have a pagination object', function () {
        expect(controller.pagination).toBeAnObject();
    });

    it('should have a currentPage property', function () {
        expect(controller.currentPage).toBe(1);
    });

    it('should have a pageChanged function', function () {
        expect(controller.pageChanged).toBeAFunction();
    });

    it('should have a processing property', function () {
        expect(controller.processing).toBeAnObject();
    });

    it('should have a showDetails method', function () {
        expect(controller.showDetails).toBeAFunction();
    });

    it('should have a detailsOpen property', function () {
        expect(controller.detailsOpen).toBe(false);
    });

    describe('deactivateUser', function () {
        it('should be a method', function () {
            expect(controller.deactivateUser).toBeAFunction();
        });

        it('should add the user id to processing and set it to true', function () {
            controller.deactivateUser({id: 'njG5yURaHwX'});

            expect(controller.processing.njG5yURaHwX).toBe(true);
        });

        it('should call disable on the userstatus service', function () {
            controller.deactivateUser({id: 'njG5yURaHwX'});

            expect(userStatusService.disable).toHaveBeenCalledWith('njG5yURaHwX');
        });

        it('should set the user to disabled', function () {
            var user = {id: 'njG5yURaHwX', userCredentials: {}};
            controller.deactivateUser(user);
            $rootScope.$apply();

            expect(user.userCredentials.disabled).toBe(true);
        });

        it('should set processing to false when request is completed', function () {
            controller.deactivateUser({id: 'njG5yURaHwX', userCredentials: {}});
            $rootScope.$apply();

            expect(controller.processing.njG5yURaHwX).toBe(false);
        });

        it('should set processing to false when the request fails', function () {
            var user = {id: 'njG5yURaHwX', userCredentials: {}};
            var expectedUser = angular.copy(user);
            userStatusService.SETTOFAIL(true);

            controller.deactivateUser(user);
            $rootScope.$apply();

            expect(user).toEqual(expectedUser);
            expect(controller.processing.njG5yURaHwX).toBe(false);
        });

        it('should call notify when user disable failed', function () {
            var user = {id: 'njG5yURaHwX', userCredentials: {}};
            userStatusService.SETTOFAIL(true);

            controller.deactivateUser(user);
            $rootScope.$apply();

            expect(errorHandler.error).toHaveBeenCalled();
        });
    });

    describe('activateUser', function () {
        it('should be a method', function () {
            expect(controller.activateUser).toBeAFunction();
        });

        it('should add the user id to processing and set it to true', function () {
            controller.activateUser({id: 'njG5yURaHwX'});

            expect(controller.processing.njG5yURaHwX).toBe(true);
        });

        it('should call enable on the userstatus service', function () {
            controller.activateUser({id: 'njG5yURaHwX'});

            expect(userStatusService.enable).toHaveBeenCalledWith('njG5yURaHwX');
        });

        it('should set the user to enabled', function () {
            var user = {id: 'njG5yURaHwX', userCredentials: {}};
            controller.activateUser(user);
            $rootScope.$apply();

            expect(user.userCredentials.disabled).toBe(false);
        });

        it('should set processing to false when request is completed', function () {
            controller.activateUser({id: 'njG5yURaHwX', userCredentials: {}});
            $rootScope.$apply();

            expect(controller.processing.njG5yURaHwX).toBe(false);
        });

        it('should set processing to false when the request fails', function () {
            var user = {id: 'njG5yURaHwX', userCredentials: {}};
            var expectedUser = angular.copy(user);
            userStatusService.SETTOFAIL(true);

            controller.activateUser(user);
            $rootScope.$apply();

            expect(user).toEqual(expectedUser);
            expect(controller.processing.njG5yURaHwX).toBe(false);
        });

        it('should call notify when user enable failed', function () {
            var user = {id: 'njG5yURaHwX', userCredentials: {}};
            userStatusService.SETTOFAIL(true);

            controller.activateUser(user);
            $rootScope.$apply();

            expect(errorHandler.error).toHaveBeenCalled();
        });
    });

    describe('showDetails', function () {
        var user;

        beforeEach(function () {
            user = window.fixtures.get('usersPage1').users[0];
        });

        it('should set the user to be used for details into the detailsUser', function () {
            controller.showDetails(user);

            expect(controller.detailsUser).toBe(user);
        });

        it('should set detailsOpen to true', function () {
            controller.showDetails(user);

            expect(controller.detailsOpen).toBe(true);
        });

        it('should set detailsOpen to false when the user is the same', function () {
            controller.showDetails(user);
            controller.showDetails(user);

            expect(controller.detailsOpen).toBe(false);
        });

        it('should not set detailsOpen to false if the user is different', function () {
            controller.showDetails(user);
            controller.showDetails({});

            expect(controller.detailsOpen).toBe(true);
        });

        it('should set detailsUser to undefined if the user is the same', function () {
            controller.showDetails(user);
            controller.showDetails(user);

            expect(controller.detailsUser).not.toBeDefined();
        });
    });

    describe('isDetailsUser', function () {
        var user;
        beforeEach(function () {
            user = window.fixtures.get('usersPage1').users[0];
            controller.showDetails(user);
        });

        it('should return true if the passed user is the details user', function () {
            expect(controller.isDetailsUser(user)).toBe(true);
        });

        it('should return false if the passed user is not the details user', function () {
            var user = window.fixtures.get('usersPage1').users[1];

            expect(controller.isDetailsUser(user)).toBe(false);
        });

        it('should return false if the detailsUser is undefined', function () {
            controller.showDetails(user);

            expect(controller.isDetailsUser(user)).toBe(false);
        });
    });
});
