var HomeView = function(store) {
	
	this.findByName = function() {
		console.log("entered HomeView.findByName function");
		LocalStorageStore.findByName($('.search-key').val(), function(employees) {
			$('.employee-list').html(HomeView.liTemplate(employees));
		});
	};

	this.initialize = function() {
		console.log("entered HomeView.initialize function");
		this.el = $('<div/>');
		this.el.on('keyup', '.search-key', function(e) {
			debugger;
			HomeView.findByName();
		});
	};

	this.render = function() {
		console.log("entered HomeView.render function");
		this.el.html(HomeView.template());
		return this;
	};
	this.store = store;
	debugger;
	this.initialize();
}

HomeView.template = Handlebars.compile($("#home-tpl").html());
HomeView.liTemplate = Handlebars.compile($("#employee-li-tpl").html());