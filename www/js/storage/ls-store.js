var LocalStorageStore = function(successCallback, errorCallback) {

    this.findByName = function(searchKey, callback) {
        var employees = JSON.parse(window.localStorage.getItem("employees"));
        var results = employees.filter(function(element) {
            var fullName = element.firstName + " " + element.lastName;
            return fullName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
        });
        callLater(callback, results);
    }

    this.findById = function(id, callback) {
        var employees = JSON.parse(window.localStorage.getItem("employees"));
        var employee = null;
        var l = employees.length;
        for (var i=0; i < l; i++) {
            if (employees[i].id === id) {
                employee = employees[i];
                break;
            }
        }
        callLater(callback, employee);
    }

    // Used to simulate async calls. This is done to provide a consistent interface with stores (like WebSqlStore)
    // that use async data access APIs
    var callLater = function(callback, data) {
        if (callback) {
            setTimeout(function() {
                callback(data);
            });
        }
    }

    var employees = [
            {"id": 1, "firstName": "Jeff", "lastName": "Thompson", "title":"Chief Executive Officer", "comment": "I do everything but code!", "managerId": 0, "city":"Fredericton, NB", "cellPhone":"212-999-8888", "officePhone":"212-999-8887", "email":"jeff.thompson@userevents.com"},
            {"id": 2, "firstName": "Ryan", "lastName": "Brideau", "title":"VP Sales & Marketing", "comment": "Everything else.", "managerId": 1, "city":"Fredericton, NB", "cellPhone":"570-865-2536", "officePhone":"570-123-4567", "email":"ryan.brideau@userevents.com"},
            {"id": 3, "firstName": "Trevor", "lastName": "Bernard", "title":"Chief Technical Officer", "comment": "Freelance Whiteboard Artist", "managerId": 2, "city":"Fredericton, NB", "cellPhone":"570-865-1158", "officePhone":"570-843-8963", "email":"trevor@userevents.com"},
            {"id": 4, "firstName": "Suhaim", "lastName": "Abdussamad", "title":"Project Manager/Quality Assurance", "comment": "Product Owner", "managerId": 2, "city":"Fredericton, NB", "cellPhone":"570-865-8989", "officePhone":"570-968-5741", "email":"suhaim@userevents.com"},
            {"id": 5, "firstName": "Josh", "lastName": "Comer", "title":"Lead Senior Distinguished Fellow Director", "comment": "of Software Engineering and Development", "managerId": 2, "city":"Fredericton, NB", "cellPhone":"570-999-5555", "officePhone":"570-999-7474", "email":"josh@userevents.com"},
            {"id": 6, "firstName": "Ian", "lastName": "Bishop", "title":"Senior Software Developer", "comment": "True Facts!", "managerId": 2, "city":"Fredericton, NB", "cellPhone":"570-555-9696", "officePhone":"570-999-3232", "email":"ian@userevents.com"},
            {"id": 7, "firstName": "Matthew", "lastName": "Morgan", "title":"Co-Op Software Engineer - Automation", "comment": "", "managerId": 6, "city":"Fredericton, NB", "cellPhone":"506-454-2073", "officePhone":"506-206-8300", "email":"matthew.morgan@userevents.com"}
        ];

    window.localStorage.setItem("employees", JSON.stringify(employees));

    callLater(successCallback);

}