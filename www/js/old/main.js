var app = {

    handleLogin: function() {
        console.log("entered handleLogin");
        var form = $("#loginForm");
        $("#submitButton", form).attr("disabled", "disabled");
        var user = $("#username", form).val();
        var pass = $("#password", form).val();
        console.log("username: " + user);
        console.log("password: " + pass);
        console.log("Login Attempt - Submit Clicked");
        window.localStorage.setItem("user", user);
        window.localStorage.setItem("pass", pass);
        if(user != '' && pass != '') {
            console.log("attempting post to amazonaws");
            app.sendEvent("login");
            console.log("ajax fired...")
            this.store = new LocalStorageStore(function() {
            this.page = new HomeView(this.store).render().el;
            app.route(this.page);
            });
        } else {
            console.log("sending to showAlert for failed login");
            app.showAlert("You must enter a username and password", "Failed Login");
            $("#submitButton").removeAttr("disabled");
        }
        return false;
    },

    sendEvent: function(type) {
        var user = window.localStorage.getItem("user");
        var pass = window.localStorage.getItem("pass");
        var reqData = JSON.stringify({
            "user": user,
            "type": type,
            "pass": pass,
            "origin": "demoApp"
        });
        console.log("data json string includes: " + reqData);
        var reqest = $.ajax({ url: "http://ec2-50-19-162-216.compute-1.amazonaws.com:8086/events/create", data: reqData, type: "POST", contentType: "application/json", dataType: "json", done: function(res) {
            console.log(res.status);
            console.log(res.statusText);
            console.log(res.responseText);
        }, fail: function() {
            console.log("something didn't work");
        }});
        var reqest2 = $.ajax({ url: "/events/create", data: reqData, type: "POST", contentType: "application/json", dataType: "json", done: function(res) {
            console.log(res.status);
            console.log(res.statusText);
            console.log(res.responseText);
        }, fail: function() {
            console.log("something didn't work");
        }});
        return false;
    },

    onPause: function() {
        console.log("entered onPause function");
        var user = window.localStorage.getItem("user");
        var pass = window.localStorage.getItem("pass");
        app.sendEvent("logout");
    },

    initialize: function() {
        console.log("entered initialize function");
        var self = this;
        this.detailsURL = /^#employees\/(\d{1,})/;
        console.log("goto registerEvents");
        this.registerEvents();
        console.log("back from registerEvents");
        this.loginPage = new LoginView().render();
        this.slidePage(this.loginPage);
        $('#loginForm').submit(function() {
            app.handleLogin();
            return false;
        });
    },

    registerEvents: function() {
        console.log("entered registerEvents function");
        var self = this;
        $(window).on('hashchange', $.proxy(this.route, this));
        document.addEventListener("pause", app.onPause, false);
        if (document.documentElement.hasOwnProperty('ontouchstart')) {
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

    route: function() {
        console.log("entered route function");
        var self = this;
        var hash = window.location.hash;
        if (!hash) {
            console.log("entered route, not hash");
            if (this.loginPage) {
                console.log("entered this.loginPage");
                this.homePage = new HomeView(this.store).render();
                this.slidePage(this.homePage);
            } else {
                console.log("entered not this.loginpage");
                this.homePage = new HomeView(this.store).render();
                this.slidePage(this.homePage);
            }
            return;
        }
        var match = hash.match(app.detailsURL);
        if (match) {
            this.store.findById(Number(match[1]), function(employee) {
                self.slidePage(new EmployeeView(employee).render());
            });
        }
    },

    showAlert: function(message, title) {
        console.log("entered showAlert function");
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    },

    slidePage: function (page) {
        console.log("entered slidePage function");
        var currentPageDest,
            self = this;
        if (!this.currentPage) {
            console.log("entered slidePage not currentPage");
            $(page.el).attr('class', 'page stage-center');
            $('body').append(page.el);
            this.currentPage = page;
            return;
        }
        $('.stage-right, .stage-left').not('.homePage').remove();
        if (page === app.homePage) {
            console.log("entered slidePage ");
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