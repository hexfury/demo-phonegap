var LoginView = function () {

	this.initialize = function() {
		console.log("entered LoginView.initialize function");
		this.el = $('<div/>');
		this.el.on('submit', '#loginForm', app.handleLogin);
	};

	this.render = function() {
		console.log("entered LoginView.render function");
		this.el.html(LoginView.template());
		return this;
	};

	this.initialize();
}

LoginView.template = Handlebars.compile($("#login-tpl").html());