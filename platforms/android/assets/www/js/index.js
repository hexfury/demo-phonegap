var app = {

    initialize: function() {
        var self = this;
        console.log("entered initialize");
        this.detailsURL = /^#employees\/(\d{1,})/;
        this.bindEvents();
        console.log("back from bindEvents");
        this.loginPage = new LoginView().render();
        this.slidePage(this.loginPage);
    },

    bindEvents: function() {
        console.log("binding events");
        $('#loginForm').submit(function() {
            app.handleLogin();
            return false;
        })
        $(window).on('hashchange', $.proxy(this.route, this));
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

    handleLogin: function() {
        console.log("entered handleLogin");
        var form = $("#loginForm");
        $("#submitButton", form).attr("disabled", "disabled");
        var user = $("#username", form).val();
        var pass = $("#password", form).val();
        console.log("Username: " + user + ", Password: " + pass);
        window.localStorage.setItem("user", user);
        window.localStorage.setItem("pass", pass);
        if(user != '' && pass != '') {
            console.log("sending event to amazon...");
            app.sendEvent("login");
            this.store = new LocalStorageStore(function() {
                this.page = new HomeView(this.store).render().el;
                app.route(this.page);
            });
        } else {
            console.log("Login Failed: - Send alert");
            app.showAlert("You must enter a username and password", "Failed Login");
            $("#submitButton").removeAttr("disabled");
        }
        return false;
    },

    onDeviceReady: function() {
        var push = window.plugins.pushNotification;
        var handleIncomingPush = function(incoming) {
            if(incoming.message) {
                console.log("Incoming push: " + incoming.message);
            } else {
                console.log("No incoming message");
            }
        };
        var onRegistration = function(error, pushID) {
            if (!error) {
                console.log("Registration Success: " + pushID);
                $('#id').text(pushID);
            } else {
                console.log(error);
            }
        };
        var onPush = function(data) {
            console.log("Received push: " + data.message);
        };
        push.registerEvent('registration', onRegistration);
        push.registerEvent('push', onPush);
        document.addEventListener("resume", function() {
            push.resetBadge();
            push.getIncoming(handleIncomingPush);
        });
        push.registerForNotificationTypes(push.notificationType.badge | push.notificationType.sound | push.notificationType.alert);
        push.getIncoming(handleIncomingPush);
    },

    onPause: function () {
        console.log("entered onPause function");
        app.sendEvent("logout");
    },

    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        console.log('Received Event: ' + id);
    },

    route: function() {
        console.log("entered route function");
        var hash = window.location.hash;
        if(!hash) {
            console.log("entered route, not hash");
            this.homePage = new HomeView(this.store).render();
            this.slidePage(this.homePage);
            return;
        }
        var match = hash.match(app.detailsURL);
        if (match) {
            this.store.findById(Number(match[1]), function(employee) {
                self.slidePage(new EmployeeView(employee).render());
            });
        }
    },

    sendEvent: function(type) {
        var user = window.localStorage.getItem("user");
        var pass = window.localStorage.getItem("pass");
        var reqData = JSON.stringify({
            "username": user,
            "pass": pass,
            "type": type,
            "origin": "demoApp"
        });
        console.log("data json string includes: " + reqData);
        var dest = "https://events.cxengage.net"
        $.ajax({ url: dest, data: reqData, type: "POST", contentType: "application/json", dataType: "json", done: function (res) {
            console.log("Status: " + res.status + ", " + res.statusText);
        }, fail: function (res) {
            console.log("something Bjork'ed");
        }});        
        return false;
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