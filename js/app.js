app.controller('controller', function ($rootScope, $scope, $webSql, $routeParams) {

    $scope.userAgent = navigator.userAgent;

    $rootScope.$on('$routeChangeStart', function () {
        $rootScope.loading = true;
    });

    $rootScope.$on('$routeChangeSuccess', function () {
        $rootScope.loading = false;
    });

    $scope.drop_tables = function () {
        $scope.db.dropTable('users');
        $scope.db.dropTable('groups');
    };

    $scope.create_tables = function () {
        $scope.db.createTable('users', {
            "id": {
                "type": "INTEGER",
                "null": "NOT NULL",
                "primary": true,
                "auto_increment": true
            },
            "group_id": {
                "type": "INTEGER",
                "null": "NOT NULL",
                "index": true
            },
            "name": {
                "type": "TEXT"
            },
            "phone": {
                "type": "TEXT",
                "index": true
            }
        });
        $scope.db.createTable('groups', {
            "id": {
                "type": "INTEGER",
                "null": "NOT NULL",
                "primary": true,
                "auto_increment": true
            },
            "name": {
                "type": "TEXT"
            }
        });
    };

    $scope.insert_user = function (group_id, name, phone) {
        $scope.db.insert('users', {"group_id": group_id, "name": name, "phone": phone}).then(function (results) {
            $scope.insert_user_status = true;
        });
    };

    $scope.delete_user = function (id) {
        $scope.db.del('users', {"id": id}).then(function (results) {
            $scope.delete_user_status = true;
            $scope.select_users();
        });
    };

    $scope.select_users = function () {
        $scope.db.selectAll("users").then(function (results) {
            $scope.users = [];
            for (var i = 0; i < results.rows.length; i++) {
                $scope.users.push(results.rows.item(i));
            }
        });
    };

    $scope.select_group_users = function (group_id) {
        $scope.db.select("users", {"group_id": group_id}).then(function (results) {
            $scope.group_users = [];
            for (i = 0; i < results.rows.length; i++) {
                $scope.group_users.push(results.rows.item(i));
            }
        })
    };

    $scope.select_user = function (id) {
        $scope.db.select("users", {"id": id}).then(function (results) {
            $scope.user = [];
            for (i = 0; i < results.rows.length; i++) {
                $scope.user.push(results.rows.item(i));
            }
        })
    };

    $scope.select_user_by_param = function () {
        $scope.select_user($routeParams.user_id);
    };

    $scope.insert_group = function (name) {
        $scope.db.insert('groups', {"name": name}).then(function (results) {
            $scope.insert_group_status = true;
        });
    };

    $scope.delete_group = function (id) {
        $scope.db.del('groups', {"id": id}).then(function (results) {
            $scope.delete_group_status = true;
            $scope.select_groups();
        });
    };

    $scope.delete_group_by_param = function () {
        $scope.delete_group($routeParams.group_id);
    };

    $scope.select_groups = function () {
        $scope.db.selectAll("groups").then(function (results) {
            $scope.groups = [];
            for (var i = 0; i < results.rows.length; i++) {
                $scope.groups.push(results.rows.item(i));
            }
        });
    };

    $scope.select_group = function (id) {
        $scope.db.select("groups", {"id": id}).then(function (results) {
            $scope.group = [];
            for (i = 0; i < results.rows.length; i++) {
                $scope.group.push(results.rows.item(i));
            }
        })
    };

    $scope.select_group_by_param = function () {
        $scope.select_group($routeParams.group_id);
        $scope.select_group_users($routeParams.group_id);
    };

    $scope.delete_status = function () {
        $scope.insert_user_status = false;
        $scope.insert_group_status = false;
        $scope.insert_restore_status = false;
        $scope.insert_message_status = false;
    };

    $scope.backup_sql = function () {
        $scope.return = {};
        $scope.db.selectAll("users").then(function (results) {
            $scope.return.users = [];
            for (var i = 0; i < results.rows.length; i++) {
                $scope.return.users.push(results.rows.item(i));
            }
            $scope.db.selectAll("groups").then(function (results) {
                $scope.return.groups = [];
                for (var i = 0; i < results.rows.length; i++) {
                    $scope.return.groups.push(results.rows.item(i));
                }
                $scope.return = JSON.stringify($scope.return);
                window.plugins.socialsharing.share($scope.return);
            });
        });
    };

    $scope.restore_sql = function (restore) {
        try {
            restore = JSON.parse(restore);
            $scope.drop_tables();
            $scope.create_tables();
            restore.users.forEach(function (element) {
                $scope.db.insert('users', {
                    "id": element.id,
                    "group_id": element.group_id,
                    "name": element.name,
                    "phone": element.phone
                }).then(function (results) {
                });
            });
            restore.groups.forEach(function (element) {
                $scope.db.insert('groups', {"id": element.id, "name": element.name}).then(function (results) {
                });
            });
            $scope.insert_restore_status = true;
        }
        catch (e) {
            $scope.insert_restore_status = false;
        }
    };

    $scope.send_sms_to_group = function (group_id, message) {
        $scope.db.select("users", {"group_id": group_id}).then(function (results) {
            $scope.group_users = [];
            for (i = 0; i < results.rows.length; i++) {
                $scope.send_sms(results.rows.item(i).phone, message);
            }
        })
    };

    $scope.send_sms = function (number, message) {
        console.log("number=" + number + ", message= " + message);
        var options = {
            replaceLineBreaks: false,
            android: {
                intent: ''
            }
        };
        var success = function () {
            alert('Message sent successfully');
        };
        var error = function (e) {
            alert('Message Failed:' + e);
        };
        sms.send(number, message, options, success, error);
    };

    $scope.db = $webSql.openDatabase('mydb', '1.0', 'sms', 20 * 1024 * 1024);
    $scope.create_tables();
});
