const monk = require('monk')
require('../settings')

var url = keymongodb;
try {
    if (url == '') throw console.log('Check database configuration, var url has not been filled for shortlink db');
} catch (e) {
    return;
}
var db = monk(url);

db.then(() => {
        //console.log('Connected correctly to shortlink db')
    })
    .catch((e) => {
        console.log("Failed to connect to database, \ncheck database configuration whether Connection URL is correct")
    })

module.exports = db