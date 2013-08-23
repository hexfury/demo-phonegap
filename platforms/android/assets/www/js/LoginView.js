var LoginView = function() {

	this.handleLogin = function() {
		console.log("entered LoginView.handleLogin function");
		var form = $("#loginForm");
		$("#submitButton", form).attr("disabled", "disabled");
		var user = $("#username", form).val();
		var pass = $("#password", form).val();
		console.log("Login Attempt - Submit Clicked");
		if(user != '' && pass != '') {
			$.post("192.168.0.29:8083/events/create", {"user": user, "type": "login", "pass": pass}, function(result){
					console.log(result);
					var obj = $('.result').json(result);
					if(obj.status == "partial" || "success") {
						window.localStorage["username"] = user;
						window.localStorage["password"] = pass;
						this.el = $('<div/>');
						this.el.html(HomeView.template());
				} else {
					app.showAlert("Your login failed, you suck!", "Failed Login");
				}
				$("#submitButton").removeAttr("disabled");
			}, "json");
		} else {
			app.showAlert("You must enter a username and password", "Failed Login");
			$("submitButton").removeAttr*("disabled");
		}
		return false;
	};

	this.initialize = function() {
		console.log("entered LoginView.initialize function");
		this.el = $('<div/>');
		this.el.on('keyup', '.submit', this.handleLogin);
	};

	this.render = function() {
		console.log("entered LoginView.render function");
		this.el.html(LoginView.template());
		return this;
	};

	this.initialize();
}

LoginView.template = Handlebars.compile($("#login-tpl").html());