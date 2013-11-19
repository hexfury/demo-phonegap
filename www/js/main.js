var app = {

    eventChain: function(type) {
        console.log("entered eventChain start...");
        var cid = "w2+cgjeZUEIOR114ATERnXb78qdPdV0UWb8avLdAfUkX";
        var cs = "s8nWVjq6+bAYDZ87TyiwKIXIb3LIquNkZMm3NtXBZpAQ";
        var auth = app.getAuth(cid, cs, type);
        auth.then(function success (token) {
            var pushid = app.getPushID();
            $.ajaxSetup({
                headers: {'Authorization': "Bearer " + token}
            }); 
            pushid.then(function success (pushid) {
                var reqData = JSON.stringify({
                    "username": window.localStorage.getItem("user"),
                    "pass": window.localStorage.getItem("pass"),
                    "id": pushid,
                    "type": type,
                    "alert": "Open the app again!",
                    "origin": "demoApp"
                });
                console.log("Request sent as: " + reqData);
                var sendEvent = $.ajax({
                    url: "https://events.cxengage.net/1.0/tenants/qa/event",
                    data: reqData,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json"
                });
                sendEvent.done(app.showAlert("Event Sent Successfully!", "Hurray!"));
            }, function fail () {
                app.showAlert("Failed to get push ID", "boo!");
            });
        }, function fail () {
            app.showAlert("Failed to get bearer token", "boo!");
        });
    },

    getAuth: function(cid, cs, type) {
        var d = $.Deferred();
        $.ajaxSetup({
            headers: {
                'Authorization': "Basic " + btoa(cid + ':' + cs)
            }
        });
        console.log("sending event to auth for bearer");
        var req = $.ajax({ 
            url: "https://auth.cxengage.net/1.0/token", 
            data: "grant_type=client_credentials", 
            type: "POST"
        });
        req.done(function (result) {
            console.log("Bearer: " + result["access_token"]);
            var token = result["access_token"];
            d.resolve(token);
        });
        req.fail(d.reject);
        return d;
    },

    getPushID: function() {
        var push = window.plugins.pushNotification;
        var d = $.Deferred();
        console.log("Retrieving pushID")
        var req = push.getPushID(function (id) {
            if(id) {
                console.log("Got push ID: " + id);
                $('#id').text(id);
            }
            var pushid = id;
            d.resolve(pushid);
        });
        return d;
    },

    handleIncomingPush: function(incoming) {
        if(incoming.message) {
            console.log("Incoming push: " + incoming.message);
        } else {
            console.log("No incoming message");
        };
    },

    handleLogin: function() {
        console.log("entered handleLogin");
        var form = $("#loginForm");
        $("#submitButton", form).attr("disabled", "disabled");
        var user = $("#username", form).val();
        var pass = $("#username", form).val();
        console.log("Username: " + user + ", Password: " + pass);
        window.localStorage.setItem("user", user);
        window.localStorage.setItem("pass", pass);
        if (user != null && pass != null) {
            console.log("send an event to rest");
            app.eventChain("login");
            app.route();
        } else {
            console.log("Login Failed: - Send alert");
            app.showAlert("You must enter a username and password", "Failed Login");
            $("#submitButton").removeAttr("disabled");
        };
        return false;
    },

    onDeviceReady: function() {
        var push = window.plugins.pushNotification;
        push.registerEvent('registration', app.onRegistration);
        push.registerEvent('push', app.onPush);
        document.addEventListener("resume", function() {
            push.resetBadge();
            push.getIncoming(app.handleIncomingPush);
        });
        push.registerForNotificationTypes(push.notificationType.badge | push.notificationType.sound | push.notificationType.alert);
        push.getIncoming(app.handleIncomingPush);
    },

    onPause: function () {
        console.log("entered onPause function");
        //app.eventChain("logout");
        window.localStorage.clear();
    },

    onRegistration: function(error, pushID) {
        if (!error) {
            console.log("Registration Success: " + pushID);
            $('#id').text(pushID);
        } else {
            console.log(error);
        }
    },

    registerEvents: function() {
        $(window).on('hashchange', $.proxy(this.route, this));
        document.addEventListener("pause", app.onPause, false);
        $('body').on('mousedown', 'a', function(event) {
            $(event.target).addClass('tappable-active');
        });
        $('body').on('mouseup', 'a', function(event) {
            $(event.target).removeClass('tappable-active');
        });
    },

    route: function() {
        var self = this;
        var hash = window.location.hash;
        if (!hash) {
            if (window.localStorage.getItem("user") == null) {
                if (this.loginPage) {
                    this.slidePage(this.loginPage);
                } else {
                    this.loginPage = new LoginView().render();
                    this.slidePage(this.loginPage);
                }
            } else {
                if (this.homePage) {
                    this.slidePage(this.homePage);
                } else {
                    this.homePage = new HomeView(this.store).render();
                    this.slidePage(this.homePage);
                }
            }
            return;
        }
        var match = hash.match(this.detailsURL);
        if (match) {
            this.store.findById(Number(match[1]), function(employee) {
                self.slidePage(new EmployeeView(employee).render());
            });
        }
    },

    showAlert: function (message, title) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    },

    slidePage: function(page) {
        var currentPageDest,
        self = this;
        if (!this.currentPage) {
            $(page.el).attr('class', 'page stage-center');
            $('body').append(page.el);
            this.currentPage = page;
            return;
        }
        $('.stage-right, .stage-left').not('.homePage').remove();
        if (page === app.homePage) {
            $(page.el).attr('class', 'page stage-left');
            currentPageDest = "stage-right";
        } else {
            $(page.el).attr('class', 'page stage-right');
            currentPageDest = "stage-left";
        }
        $('body').append(page.el);
        setTimeout(function() {
            $(self.currentPage.el).attr('class', 'page transition ' + currentPageDest);
            $(page.el).attr('class', 'page stage-center transition');
            self.currentPage = page;
        });
    },

    initialize: function() {
        window.localStorage.clear();
        var self = this;
        this.detailsURL = /^#employees\/(\d{1,})/;
        this.registerEvents();
        this.store = new LocalStorageStore(function () {
            self.route();
        });
    }
};
app.initialize();