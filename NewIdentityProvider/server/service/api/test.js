exports.get = function(request, response) {
	request.user.getIdentities({
		 success: function (identities) {
			 response.send(statusCodes.OK, {user: request.user, identities: identities});
		 },
		 error: function (err) {
			 response.send(statusCodes.INTERNAL_SERVER_ERROR, err);
		 }
	 });
};
