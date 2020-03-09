import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Done extends Component {

createNewEvent=()=>{
	this.props.createNewEvent()
	this.props.createNewEvent2()
}

render(){
	return (
		<div className="mt-5 text-center">
			<h3 className="mt-5">Done, your event has been uploaded!</h3>
			<p className="emoji"><span role="img" aria-label="sunglasses">😎🎸</span></p>
			<p>We will notify you as soon as the transaction has been confirmed. It will be available for users shortly.</p>
			<Link to="/createevent" onClick={this.createNewEvent}>Create another event.</Link>

		
		</div>
	);
}
}
export default Done;
