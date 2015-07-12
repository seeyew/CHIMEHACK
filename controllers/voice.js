var path = require('path');

exports.joinconference = function(request, response) {
	response.header('Content-type', 'text/xml');
	response.sendFile(path.join(__dirname, '../public', 'conference.xml'));
};