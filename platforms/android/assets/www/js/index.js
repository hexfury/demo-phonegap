var app = {

    initialize: function() {
        var self = this;
        console.log("entered initialize");
        this.detailsURL = /^#employees\/(\d{1,})/;
        this.bindEvents();
        console.log("back from bindEvents");
        this.setupPush();
        this.loginPage = new LoginView().render();
        this.slidePage(this.loginPage);
    },

    bindEvents: function() {
        console.log("binding events");
        if(navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
            document.addEventListener('deviceready', app.onDeviceReady, false);
            document.addEventListener('pause', app.onPause, false);
        } else {
            app.onDeviceReady();
        }
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
        console.log("entered deviceready");
        app.receivedEvent('deviceready');
    },

    onNotificationAPN: function(event) {
        var pushNotification = window.plugins.pushNotification;
        console.log("Received a notification! " + event.alert);
        console.log("event sound " + event.sound);
        console.log("event badge " + event.badge);
        console.log("event " + event);
        if(event.alert) {
            navigator.notification.alert(event.alert);
        }
        if(event.badge) {
            console.log("Set badge on " + pushNotification);
            pushNotification.setApplicationIconBadgeNumber(this.successHandler, event.badge);
        }
        if (event.sound) {
            var snd = new Media(event.sound);
            snd.play();
        }
    },

    onNotificationGCM: function(event) {
        switch(e.event) {
            case 'registered':
                if(e.regid.length > 0) {
                    alert("registration id = " + e.regid);
                }
            break;

            case 'message':
                alert('message = ' + e.message + ' msgcnt = ' + e.msgcnt);
            break;

            case 'error':
                alert('GCM error = ' + e.msg);
            break

            default:
                alert('An unkown GCM event has occurred');
            break;
        }
    },

    onPause: function () {
        console.log("entered onPause function");
        app.sendEvent("logout");
    },

    receivedEvent: function(id) {
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

    setupPush: function(){
        var push = window.plugins.pushNotification;
        push.registerEvent('registration', function(error, id) {
            if(error) {
                console.log("there was an error registering for push notifications");
            } else {
                console.log("Registered with ID: " + id);
            }
        });
        push.registerEvent('push', function(push) {
            console.log("Got push: " + push.message);
        });
        push.setTags(["loves_demos", "wants_to_be_pushed"], function() {
            push.getTags(function(obj) {
                obj.tags.forEach(function(tag) {
                    console.log("Tag: " + tag);
                });
            });
        });
        push.isPushEnabled(function(enabled) {
            if(enabled) {
                console.log("Push is enabled! Fire away!");
            }
        });
    },

    sendEvent: function(type) {
        var user = window.localStorage.getItem("user");
        var pass = window.localStorage.getItem("pass");
        var reqData = JSON.stringify({
            "user": user,
            "pass": pass,
            "type": type,
            "origin": "demoApp"
        });
        console.log("data json string includes: " + reqData);
        if(device.platform == 'android' || device.platform == 'Android') {
            var dest = "http://ec2-50-19-162-216.compute-1.amazonaws.com:8086"
        } else {
            var dest = "/events/create"
        }
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