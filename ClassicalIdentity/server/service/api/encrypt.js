var crypto = require('crypto');
exports.get = function(request, response) {
	if(request.query.access_token && request.query.app_secret){
		var cipher = crypto.createCipher('aes256', request.query.app_secret);  
		var encrypted = cipher.update(request.query.access_token, 'utf8', 'hex') + cipher.final('hex');
		response.send(statusCodes.OK,{"encrypted_access_token":encrypted});
	}
	else{
		response.send(statusCodes.INTERNAL_SERVER_ERROR,{"error":"both app_secret and access_token is required."});
	}
};