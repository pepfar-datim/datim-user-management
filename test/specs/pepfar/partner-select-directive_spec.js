describe('Agency select directive', function () {
    var fixtures = window.fixtures;
    var $scope;
    var element;
    var $rootScope;
    var partnersService;

    beforeEach(module('pepfar/agencypartner-select.html'));
    beforeEach(module('PEPFAR.usermanagement', function ($provide) {
        $provide.factory('partnersService', function ($q) {
            var success = $q.when(fixtures.get('partnerList').categoryOptionGroups);
            return {
                getPartners: jasmine.createSpy('getPartners')
                    .and.returnValue(success)
            };
        });
    }));

    beforeEach(inject(function ($injector) {
        var innerScope;
        var $compile = $injector.get('$compile');
        $rootScope = $injector.get('$rootScope');
        partnersService = $injector.get('partnersService');

        element = angular.element('<partner-select></partner-select>');

        $scope = $rootScope.$new();

        $compile(element)($scope);
        $rootScope.$digest();

        innerScope = element.find('.ui-select-bootstrap').scope();
        innerScope.$select.open = true;
        innerScope.$apply();
    }));

    it('should compile', function () {
        expect(element).toHaveClass('agency-partner-select');
    });

    it('should have all the elements in the list', function () {
        var elements = element[0].querySelectorAll('.ui-select-choices-row');

        expect(elements.length).toBe(fixtures.get('partnerList').categoryOptionGroups.length);
    });

    it('should have the correct place holder', function () {
        var inputBox = element[0].querySelector('input');

        expect(inputBox.attributes.placeholder.value).toBe('Select a partner');
    });

    it('should have an isolate scope', function () {
        var elements;

        $scope.selectbox = {};
        $scope.$apply();

        elements = element[0].querySelectorAll('.ui-select-choices-row');

        expect(elements.length).toBe(fixtures.get('partnerList').categoryOptionGroups.length);
    });

    it('should call getAgencies after an event is recieved', function () {
        partnersService.getPartners.calls.reset();
        $rootScope.$broadcast('ORGUNITCHANGED', {name: 'Rwanda'});

        expect(partnersService.getPartners).toHaveBeenCalled();
    });
});
