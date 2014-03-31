var crypto = require('crypto');
exports.createZumoJwt = function createZumoJwt(masterKey, lifeTimeHrs, aud, userId, claims) {
 	function base64(input) {
		return new Buffer(input, 'utf8').toString('base64');
	}
	function urlFriendly(b64) {
		return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(new RegExp("=", "g"), '');
	}
	function signature(input) {
		var key = crypto.createHash('sha256').update(masterKey + "JWTSig").digest('binary');
		var str = crypto.createHmac('sha256', key).update(input).digest('base64');
		return urlFriendly(str);
	}
	var s1 = '{"alg":"HS256","typ":"JWT","kid":0}';
	var j2 = {
		"exp": new Date(Date.now() + 60 * 60 * lifeTimeHrs * 1000),
		"iss":"urn:microsoft:windows-azure:zumo",
		"ver":2,
		"aud":aud,
		"uid":userId
	};
	if(claims){
		j2["urn:microsoft:credentials"]= claims;
	}
	var s2 = JSON.stringify(j2);
	var b1 = urlFriendly(base64(s1));
	var b2 = urlFriendly(base64(s2));
	var b3 = signature(b1 + "." + b2);
	return [b1,b2,b3].join(".");
}
