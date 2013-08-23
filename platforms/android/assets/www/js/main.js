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
        if(user != '' && pass != '') {
            console.log("attempting post to amazonaws");
            $.ajaxSetup({
                cache: false,
                contentType: "application/json",
                dataType: "json"
            });

            var posting = $.ajax({
                url: "http://ec2-50-19-162-216.compute-1.amazonaws.com:8086/events/create", 
                data: { "user": user, "type": "login", "pass": pass, "origin": "demoApp" },
                type: "POST"
            })
            .done(function(res) {
                console.log(res.status);
                console.log(res.contributed);
                console.log(res.matched);
            })
            .fail(function(posting) {
                console.error("The following error occured: " + status, textStatus, responseText);
            });

  /*           $.ajax({
                url: "http://ec2-50-19-162-216.compute-1.amazonaws.com:8086/events/create",
                type: "POST",
                data: { "user": user, "type": "login", "pass": pass, "origin": "demoApp" },
                contentType: "application/json; charset=utf-8"    
            }).done(function(data) {
                console.log(data.status);
                console.log(data.contributed);
                console.log(data.matched);
            }).fail(function(data) {
                console.log(data.status);
                console.log(data.contributed);
                console.log(data.matched);
            }); 
            console.log("exited post function");

           $.post("http://ec2-50-19-162-216.compute-1.amazonaws.com:8086/events/create", {"user": user, "type": "login", "pass": pass}, function(result) {
                console.log("the post actually happened, some result should be here");
                var obj = $('.result').json(result);
                if(obj.status =="partial" || "success") {
                    this.store = new LocalStorageStore(function() {
                        self.route();
                    });
                } else {
                    app.showAlert("Your login failed", "Failed Login");
                }
                $("#submitButton").removeAttr("disabled");
            }, "json"); */
        } else {
            console.log("sending to showAlert for failed login");
            app.showAlert("You must enter a username and password", "Failed Login");
            $("#submitButton").removeAttr("disabled");
        }
        return false;
    },

    initialize: function() {
        console.log("entered initialize function");
        var self = this;
        this.detailsURL = /^#employees\/(\d{1,})/;
        console.log("goto registerEvents");
        this.registerEvents();
        console.log("back from registerEvents");
        this.homePage = new LoginView().render();
        this.slidePage(this.homePage);
    },

    registerEvents: function() {
        console.log("entered registerEvents function");
        var self = this;
        $(window).on('hashchange', $.proxy(this.route, this));
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
            if (this.homePage) {
                console.log("entered this.homepage");
                this.slidePage(this.homePage);
            } else {
                console.log("entered not this.homepage");
                this.homePage = new LoginView(this.store).render();
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

app.initialize();