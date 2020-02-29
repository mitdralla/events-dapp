import React from 'react';

function EventNotFound() {
	return (
		<div className="mt-5 text-center">
			<h3 className="mt-5">Event Not Found!</h3>
			<p className="emoji"><span role="img" aria-label="sweat">😓</span></p>
			<p>Please make sure you entered the correct url.</p>
		</div>
	);
}

export default EventNotFound;