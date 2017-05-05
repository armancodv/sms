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
        $scope.db.createTable('messages', {
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
            "message": {
                "type": "TEXT"
            }
        });
    };

    $scope.insert_user = function (group_id, name, phone) {
        if (group_id) {
            $scope.db.insert('users', {"group_id": group_id, "name": name, "phone": phone}).then(function (results) {
                $scope.insert_user_status = true;
            });
        }
    };

    $scope.delete_user = function (id) {
        $scope.db.del('users', {"id": id}).then(function (results) {
            $scope.delete_user_status = true;
            $scope.select_group_users($routeParams.group_id);
        });
    };

    $scope.delete_user_ofgroup = function (group_id) {
        $scope.db.del('users', {"group_id": group_id}).then(function (results) {
            $scope.delete_user_status = true;
        });
    };

    $scope.changegroup_user = function (id, group_id) {
        $scope.db.update("users", {"group_id": group_id}, {'id': id});
    };

    $scope.copy_user = function (id, group_id) {
        $scope.db.select("users", {"id": id}).then(function (results) {
            $scope.insert_user(group_id, results.rows.item(0).name, results.rows.item(0).phone);
        })
    };

    $scope.delete_user_by_param = function () {
        $scope.delete_user($routeParams.user_id);
    };

    $scope.select_users = function () {
        $scope.users_loading = true;
        $scope.db.selectAll("users").then(function (results) {
            $scope.users_loading = false;
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

    $scope.insert_group_byid = function (id, name) {
        $scope.db.insert('groups', {"id": id, "name": name}).then(function (results) {
            $scope.insert_group_status = true;
        });
    };

    $scope.delete_group = function (id) {
        $scope.db.del('groups', {"id": id}).then(function (results) {
            $scope.delete_group_status = true;
            $scope.select_groups();
            $scope.delete_user_ofgroup(id);
        });
    };

    $scope.delete_group_by_param = function () {
        $scope.delete_group($routeParams.group_id);
    };

    $scope.select_groups = function () {
        $scope.db.selectAll("groups").then(function (results) {
            $scope.groups = [];
            $scope.show_groups = [];
            for (var i = 0; i < results.rows.length; i++) {
                $scope.groups.push(results.rows.item(i));
                $scope.show_groups[results.rows.item(i).id] = results.rows.item(i).name;
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

    $scope.insert_message = function (group_id, message) {
        if (group_id) {
            $scope.db.insert('messages', {"group_id": group_id, "message": message}).then(function (results) {
            });
        }
    };

    $scope.select_group_messages = function (group_id) {
        $scope.db.select("messages", {"group_id": group_id}).then(function (results) {
            $scope.group_messages = [];
            for (i = 0; i < results.rows.length; i++) {
                $scope.group_messages.push(results.rows.item(i));
            }
        })
    };

    $scope.select_group_messages_by_param = function () {
        $scope.select_group_messages($routeParams.group_id);
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
        $scope.number_message_sent = 0;
        $scope.number_message_not_sent = 0;
        if (group_id) {

            $scope.db.select("users", {"group_id": group_id}).then(function (results) {
                $scope.group_users = [];
                for (i = 0; i < results.rows.length; i++) {
                    $scope.send_sms(results.rows.item(i).phone, message);
                }
            });
            $scope.insert_message(group_id,message);
            $scope.insert_message_status = true;
        }
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
            $scope.number_message_sent++;
        };
        var error = function (e) {
            $scope.number_message_not_sent++;
        };
        sms.send(number, message, options, success, error);
    };

    $scope.sms_counter = function (length) {
        if (length <= 70) return 1;
        else if (length <= 134) return 2;
        else return Math.ceil((length - 134) / 67) + 2;
    };

    $scope.select_contacts = function () {
        $scope.contacts_loading = true;
        $scope.contacts_added = false;
        var options = new ContactFindOptions();
        options.filter = "";
        false
        options.multiple = true;
        var fields = ["displayName", "name"];
        navigator.contacts.find(fields, function (contacts) {
            $scope.contacts_loading = false;
            $scope.delete_user_ofgroup(10000);
            $scope.insert_group_byid(10000, 'مخاطبان');
            for (i = 0; i < contacts.length; i++) {
                console.log(i);
                try {
                    $scope.insert_user(10000, contacts[i].name.formatted, contacts[i].phoneNumbers[0].value);
                }
                catch (e) {
                    console.log(e);
                }
            }
            $scope.contacts_added = true;
        }, function (contactError) {
            $scope.contacts_loading = false;
            alert('Error!');
        }, options);
    };

    $scope.db = $webSql.openDatabase('mydb', '1.0', 'sms', 20 * 1024 * 1024);
    $scope.create_tables();
});
