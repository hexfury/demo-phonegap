var EmployeeView = function(employee) {

	this.addLocation = function(event) {
		event.preventDefault();
		console.log('addLocation');
		navigator.geolocation.getCurrentPosition(
			function(position) {
				$('.location', this.el).html(position.coords.latitude + ',' + position.coords.longitude);
			},
			function() {
				alert('Error getting location');
			});
		return false;
	};

	this.addToContacts = function(event) {
		event.preventDefault();
		console.log('addToContacts');
		if (!navigator.contacts) {
			app.showAlert("Contacts API not supported", "Error");
			return;
		}
		var contact = navigator.contacts.create();
		contact.name = {givenName: employee.firstName, familyName: employee.lastName};
		var phoneNumbers = [];
		phoneNumbers[0] = new ContactField('work', employee.officePhone, false);
		phoneNumbers[1] = new ContactField('mobile', employee.cellPhone, true);
		contact.phoneNumbers = phoneNumbers;
		var photos = [];
		var photo = new ContactField();
		photo.value = "img/" + employee.firstName + "_" + employee.lastName + ".jpg";
		photos.push(photo);
		contact.photos = photos;
		console.log(contact);
		contact.save();
		app.showAlert("Contact Saved!", "Info");
		return false;
	}

	this.changePicture = function(event) {
		event.preventDefault();
		console.log('changePicture');
		if (!navigator.camera) {
			app.showAlert("Camera API not supported", "Error");
			return;
		}
		var options = 	{	quality: 50,
							destinationType:Camera.DestinationType.DATA_URL,
							sourceType: 1, //0: Photo Library, 1=Camera, 2=Saved Photo Album
							encodingType: 0 //0=JPG, 1=PNG
						};
		navigator.camera.getPicture(
			function(imageData) {
				$('.employee-image', this.el).attr('src', "data:image/jpeg;base64," + imageData);
			},
			function() {
				app.showAlert("Error taking picture", "Error");
			},
			options);
		return false;
	};

	this.initialize = function() {
		this.el = $('<div/>');
		this.el.on('click', '.add-location-btn', this.addLocation);
		this.el.on('click', '.add-contact-btn', this.addToContacts);
		this.el.on('click', '.change-pic-btn', this.changePicture);
	};

	this.render = function() {
		this.el.html(EmployeeView.template(employee));
		return this;
	};

	this.initialize();
}

EmployeeView.template = Handlebars.compile($("#employee-tpl").html());