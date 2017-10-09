angular
    .module('bit.vault')

    .controller('vaultShareLoginController', function ($scope, $state, $stateParams, loginService, folderService,
                                                       cryptoService, $q, toastr, SweetAlert, utilsService, $analytics, i18nService, constantsService) {
      $scope.i18n = i18nService;
      $scope.constants = constantsService;
      $scope.showAttachments = !utilsService.isEdge();
      $scope.addFieldType = constantsService.fieldType.text.toString();
      var loginId = $stateParams.loginId;
      var fromView = $stateParams.fromView;
      var from = $stateParams.from;

      $scope.login = {
        folderId: null
      };

      $('#name').focus();

      if ($stateParams.login) {
        angular.extend($scope.login, $stateParams.login);
      }
      else {
        loginService.get(loginId, function (login) {
          $q.when(login.decrypt()).then(function (model) {
            $scope.login = model;
          });
        });
      }

      // @todo: get profile so we can get orgs from it.
      var profile = [];

      if (profile && profile.organizations) {
        var orgs = [],
            setFirstOrg = false;
        var organizationCollectionCounts = [];
        for (var i in profile.organizations) {
          if (profile.organizations.hasOwnProperty(i) && profile.organizations[i].enabled) {
            orgs.push({
              id: profile.organizations[i].id,
              name: profile.organizations[i].name
            });

            organizationCollectionCounts[profile.organizations[i].id] = 0;

            if (!setFirstOrg) {
              setFirstOrg = true;
              $scope.model.organizationId = profile.organizations[i].id;
            }
          }
        }

        $scope.organizations = orgs;
      }

      apiService.listCollections(function (response) {
        var collections = [];
        for (var i = 0; i < response.Data.length; i++) {
          // @todo: decrypt the collections data.
          var decCollection = [];
          decCollection.organizationId = response.Data[i].OrganizationId;
          collections.push(decCollection);
          organizationCollectionCounts[decCollection.organizationId]++;
        }

        $scope.collections = collections;
        $scope.loadingCollections = false;
      });

      $scope.toggleCollectionSelectionAll = function ($event) {
        var collections = {};
        if ($event.target.checked) {
          for (var i = 0; i < $scope.collections.length; i++) {
            if ($scope.model.organizationId && $scope.collections[i].organizationId === $scope.model.organizationId) {
              collections[$scope.collections[i].id] = true;
            }
          }
        }

        $scope.selectedCollections = collections;
      };

      $scope.toggleCollectionSelection = function (id) {
        if (id in $scope.selectedCollections) {
          delete $scope.selectedCollections[id];
        }
        else {
          $scope.selectedCollections[id] = true;
        }
      };

      $scope.collectionSelected = function (collection) {
        return collection.id in $scope.selectedCollections;
      };

      $scope.allSelected = function () {
        if (!$scope.model.organizationId) {
          return false;
        }

        return Object.keys($scope.selectedCollections).length === organizationCollectionCounts[$scope.model.organizationId];
      };

      $scope.submitPromise = null;
      $scope.submit = function (model) {
        var orgKey = cryptoService.getOrgKey(model.organizationId);

        var errorOnUpload = false;
        var attachmentSharePromises = [];
        if ($scope.login.attachments) {
          for (var i = 0; i < $scope.login.attachments.length; i++) {
            (function (attachment) {
              // @todo: share attachments.
            })($scope.login.attachments[i]);
          }
        }

        $scope.submitPromise = $q.all(attachmentSharePromises).then(function () {
          if (errorOnUpload) {
            return;
          }

          $scope.login.organizationId = model.organizationId;

          var request = new ShareRequest({
            collectionIds: [],
            cipher: cipherService.encryptLogin($scope.login, null, true)
          });

          for (var id in $scope.selectedCollections) {
            if ($scope.selectedCollections.hasOwnProperty(id)) {
              request.collectionIds.push(id);
            }
          }

          return apiService.shareCipher({ id: loginId }, request).$promise;
        }).then(function (response) {
          $analytics.eventTrack('Shared Login');
          toastr.success('Login has been shared.');
          $uibModalInstance.close(model.organizationId);
        });
      };

      $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
      };

      $scope.createOrg = function () {
        $state.go('backend.user.settingsCreateOrg').then(function () {
          $uibModalInstance.dismiss('cancel');
        });
      };
    });
