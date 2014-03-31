var async = require('async'), 
	https=require('https'), 
	querystring=require('querystring'),
	jwt=require('../shared/jwt'),
	crypto = require('crypto'),
	app_db = [{app_id : "1415462058699647", app_secret : "can-be-used-for-additional-security"},
	          {app_id : "536422093082909", app_secret : "can-be-used-for-additional-security"}];

exports.register = function (api) {
	api.post('facebook', facebook);
	api.post('foursquare', foursquare);
	api.post('self', self);
};
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
    		//TODO: this logic will be replaced by a db operation
    		var found =false;
    		for(var i=0;i<app_db.length;i++){
    			if(app_db[i].app_id == results.app.id){
    				found = true;
    			}
    		}
    		//TODO: END
    		if(!found){
    			response.send(statusCodes.UNAUTHORIZED, { code : 401, error: "Your facebook app is not registered with us." });
    		}
    		else{ //everything is ok
    			response.send(statusCodes.OK,{
    				"user": {
    			        "userId": 'Facebook:'+results.user.id
    			    },
    			    "authenticationToken": jwt.createZumoJwt(request.service.config.masterKey, 4, 'Facebook', 'Facebook:'+results.user.id,
    			    		{
	        					userId: "Facebook:"+results.user.id,
	        					accessToken: request.body.access_token,
	        					appId : results.app.id
		    				})
    			});
    		}
    	}
    });	
}
