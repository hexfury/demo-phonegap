var HomeView = function(store) {
	
	this.findByName = function() {
		console.log("entered HomeView.findByName function");
		store.findByName($('.search-key').val(), function(employees) {
			$('.employee-list').html(HomeView.liTemplate(employees));
		});
	};

	this.initialize = function() {
		console.log("entered HomeView.initialize function");
		this.el = $('<div/>');
		this.el.on('keyup', '.search-key', this.findByName);
	};

	this.render = function() {
		console.log("entered HomeView.render function");
		this.el.html(HomeView.template());
		return this;
	};

	this.initialize();
}

HomeView.template = Handlebars.compile($("#home-tpl").html());
HomeView.liTemplate = Handlebars.compile($("#employee-li-tpl").html());