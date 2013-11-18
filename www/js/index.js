"use strict";
var app = {

    initialize: function() {
        console.log("entered initialize");
        this.detailsURL = /^#employees\/(\d{1,})/;
        this.bindEvents();
        console.log("back from bindEvents");
        this.store = new LocalStorageStore();
        this.loginPage = new LoginView().render();
        this.slidePage(this.loginPage);
    },

    bindEvents: function() {
        console.log("binding events");
        document.addEventListener("deviceready", app.onDeviceReady);
        $(window).on('hashchange', $.proxy(app.route, this));
        if(document.documentElement.hasOwnProperty('ontouchstart')) {
            $('body').on('touchstart', 'a', function(event) {
                $(event.target).addClass('tappable-active');
            });
            $('body').on('touchend', 'a', function(event) {
                $(event.target).removeClass('tappable-active');
            });
        } else {
            $('body').on('mousedown', 'a', function(event) {
                $(event.target).addClass('tappable-active');
            });
            $('body').on('mouseup', 'a', function(event) {
                $(event.target).removeClass('tappable-active');
            });
        }
    },

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
            console.log("Bearer: " + result.text + ", " + result.status + ", " + result.statusText);
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
        var pass = $("#password", form).val();
        console.log("Username: " + user + ", Password: " + pass);
        window.localStorage.setItem("user", user)
        window.localStorage.setItem("pass", pass);
        if (user != '' && pass != '') {
            console.log("sending event to amazon...");
            app.eventChain("login");
            app.route(this.page);
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

    onRegistration: function(error, pushID) {
        if (!error) {
            console.log("Registration Success: " + pushID);
            $('#id').text(pushID);
        } else {
            console.log(error);
        }
    },

    onPause: function () {
        console.log("entered onPause function");
        app.eventChain("logout");
    },

    onPush: function(data) {
        console.log("Received push: " + data.message);
    },

    route: function() {
        console.log("entered route function");
        var hash = window.location.hash;
        var match = hash.match(app.detailsURL);
        if (match) {
            app.store.findById(Number(match[1]), function(employee) {
                self.slidePage(new EmployeeView(employee).render());
            });
            return;
        };
        if(!hash) {
            console.log("entered route, not hash");
            this.homePage = new HomeView(this).render();
            this.slidePage(this.homePage);
        };
    },

    showAlert: function (message, title) {
        console.log("entered showAlert function");
        if(navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title? (title + ": " + message) : message);
        }
    },

    slidePage: function(page) {
        console.log("entered slidePage function");
        var currentPageDest,
        self = this;
        if(!this.currentPage) {
            console.log("entered slidePage not currentPage");
            $(page.el).attr('class', 'page stage-center');
            $('body').append(page.el);
            this.currentPage = page;
            return;
        }
        $('.stage-right, .stage-left').not('.homePage').remove();
        if(page === app.homePage) {
            console.log("entered slidePage for app.homePage");
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
    }
};