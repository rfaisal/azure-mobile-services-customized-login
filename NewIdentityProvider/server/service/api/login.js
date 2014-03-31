var async = require('async'), 
	https=require('https'), 
	querystring=require('querystring'),
	jwt=require('../shared/jwt'),
	crypto = require('crypto'),
	app_secret = 'your-foursquare-app-secret';
exports.register = function (api) {
	api.post('facebook', facebook);
	api.post('foursquare', foursquare);
};
function foursquare(request, response) {
	if(request.body.access_token){
		var decipher = crypto.createDecipher('aes256', app_secret);
		var access_token = null;
		try{
			access_token = decipher.update(request.body.access_token, 'hex', 'utf8') + decipher.final('utf8');
		}
		catch(err){
			response.send(statusCodes.UNAUTHORIZED, { code : 401, error: "Cannot verify the access token." });
		}
		if(access_token){
			var params = {
				oauth_token : access_token,
				v:"20140331"
		    };
			https.get('https://api.foursquare.com/v2/users/self?'+querystring.stringify(params), function(res) {
		    	var msg = '';
		    	res.on('data', function(chunk) {
		    		msg+=chunk;
		    	});
		    	res.on('end', function() {
		    		var _user = JSON.parse(msg);
		    		if(_user && _user.response && _user.response.user && _user.response.user.id){
		    			response.send(statusCodes.OK,{
		    				"user": {
		    			        "userId": 'Foursquare:'+_user.response.user.id
		    			    },
		    			    "authenticationToken": jwt.createZumoJwt(request.service.config.masterKey, 4, 'Foursquare', 'Foursquare:'+_user.response.user.id,
		    			    		{
		            					userId: "Foursquare:"+_user.response.user.id,
		            					accessToken: access_token
		    	    				})
		    			});
		    		}
		    		else{
		    			response.send(statusCodes.UNAUTHORIZED, { code : 401, error: "Cannot verify the access token." });
		    		}
		    	});
		    }).on('error', function(e) {
		    	response.send(statusCodes.UNAUTHORIZED, { code : 401, error: "Cannot verify the access token." });
		    });
		}
	}
	else{
		response.send(statusCodes.UNAUTHORIZED, { code : 401, error: "An access_token must be provided" });
	}
}
function facebook(request, response) {
	var params = {
		fields : "id",
        access_token: request.body.access_token
    };
	async.parallel({
        app: function(callback){
		    https.get('https://graph.facebook.com/app?'+querystring.stringify(params), function(res) {
		    	var msg = '';
		    	res.on('data', function(chunk) {
		    		msg+=chunk;
		    	});
		    	res.on('end', function() {
		    		callback(null,JSON.parse(msg));
		    	});
		    }).on('error', function(e) {
		    	callback("Cannot get facebook app id from the access_token.",null);
		    });
        },
        user: function(callback){
		    https.get('https://graph.facebook.com/me?'+querystring.stringify(params), function(res) {
		    	var msg = '';
		    	res.on('data', function(chunk) {
		    		msg+=chunk;
		    	});
		    	res.on('end', function() {
		    		callback(null,JSON.parse(msg));
		    	});
		    }).on('error', function(e) {
		    	callback("Cannot get user from the access_token.",null);
		    });
        }
    },
    function(err, results) {
    	if(err){
    		response.send(statusCodes.UNAUTHORIZED, { code : 401, error: err });
    	}	
    	else{
    		if(results.app.id != request.service.config.facebookAppID){
    			response.send(statusCodes.UNAUTHORIZED, { code : 401, error: "Cannot verify the facebook app id." });
    		}
    		else{ //everything is ok
    			var role = 'admin'; //look it up the database by "Facebook:"+results.user.id
    			response.send(statusCodes.OK,{
    				"user": {
    			        "userId": 'Facebook:'+results.user.id
    			    },
    			    "authenticationToken": jwt.createZumoJwt(request.service.config.masterKey, 4, 'Facebook', 'Facebook:'+results.user.id,
    			    		{
	        					userId: "Facebook:"+results.user.id,
	        					accessToken: request.body.access_token,
	        					device : request.body.device,
	        					role : role	
		    				})
    			});
    		}
    	}
    });
}
