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
            {"id": 7, "firstName": "Matthew", "lastName": "Morgan", "title":"Co-Op Software Engineer - Automation", "comment": "Newbie", "managerId": 6, "city":"Fredericton, NB", "cellPhone":"506-454-2073", "officePhone":"506-206-8300", "email":"matthew.morgan@userevents.com"},
            {"id": 8, "firstName": "Oscar", "lastName": "Martinez", "title":"Accountant", "comment": "", "managerId": 6, "city":"Scranton, PA", "cellPhone":"570-321-9999", "officePhone":"570-585-3333", "email":"oscar@userevents.com"},
            {"id": 9, "firstName": "Creed", "lastName": "Bratton", "title":"Quality Assurance", "comment": "", "managerId": 2, "city":"Scranton, PA", "cellPhone":"570-222-6666", "officePhone":"570-333-8585", "email":"creed@userevents.com"},
            {"id": 10, "firstName": "Andy", "lastName": "Bernard", "title":"Sales Director", "comment": "", "managerId": 4, "city":"Scranton, PA", "cellPhone":"570-555-0000", "officePhone":"570-646-9999", "email":"andy@userevents.com"},
            {"id": 11, "firstName": "Phyllis", "lastName": "Lapin", "title":"Sales Representative", "comment": "", "managerId": 10, "city":"Scranton, PA", "cellPhone":"570-241-8585", "officePhone":"570-632-1919", "email":"phyllis@userevents.com"},
            {"id": 12, "firstName": "Stanley", "lastName": "Hudson", "title":"Sales Representative", "comment": "", "managerId": 10, "city":"Scranton, PA", "cellPhone":"570-700-6464", "officePhone":"570-787-9393", "email":"shudson@userevents.com"},
            {"id": 13, "firstName": "Meredith", "lastName": "Palmer", "title":"Supplier Relations", "comment": "", "managerId": 2, "city":"Scranton, PA", "cellPhone":"570-588-6567", "officePhone":"570-981-6167", "email":"meredith@userevents.com"},
            {"id": 14, "firstName": "Kelly", "lastName": "Kapoor", "title":"Customer Service Rep.", "comment": "", "managerId": 2, "city":"Scranton, PA", "cellPhone":"570-123-9654", "officePhone":"570-125-3666", "email":"kelly@userevents.com"},
            {"id": 15, "firstName": "Toby", "lastName": "Flenderson", "title":"Human Resources", "comment": "", "managerId": 1, "city":"Scranton, PA", "cellPhone":"570-485-8554", "officePhone":"570-699-5577", "email":"toby@userevents.com"}
        ];

    window.localStorage.setItem("employees", JSON.stringify(employees));

    callLater(successCallback);

}