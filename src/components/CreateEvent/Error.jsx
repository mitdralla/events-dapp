
import React, { Component } from 'react';
import { Link } from 'react-router-dom';



class Error extends Component {

createNewEvent=()=>{
	this.props.createNewEvent()
	this.props.createNewEvent2()
}
render(){
	return (
		<div className="mt-5 text-center">
			<h3 className="mt-5">Ooops, we have an error!</h3>
			<p className="emoji"><span role="img" aria-label="swearing">🤬</span></p>
			<p>Something went wrong! <Link to="/createevent" onClick={this.createNewEvent}>Please try Again.</Link></p>
			<code>{this.props.message}</code>
		</div>
	);
}
}
export default Error;
