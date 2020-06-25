import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';

// import { Link } from 'react-router-dom';
// import ReactTooltip from 'react-tooltip'
import eventTypes from '../../config/types.json';
import eventTopics from '../../config/topics.json';

let numeral = require('numeral');

class Form extends Component {
	constructor(props) {
		super(props);

		this.form = {};

		this.state = {
			title: '',
			title_length: 0,
			description_length: 0,
			organizer: '',
			organizer_length: 0,
			price:'',
			location: '',
			time: 0,
			timeForHumans: null,
			currency: 'phnx',
			type: 'auto-boat-and-air',
			topic: 'appearance-or-signing',
			limited: false,
			seatsForHumans: 0,
			wrong_file: false,
			file_name: null,
			file: null,
			blockie: "/images/hydro.png",
			fileImg: "/images/event-placeholder.jpg",
			form_validation: [],

			PhoenixDAO_market:'',
			dateDisplay:new Date(parseInt('1577952000', 10) * 1000)
		}
	}


	getPhoenixDAOMarketValue = () => {

		fetch('https://api.coingecko.com/api/v3/simple/price?ids=PHNX&vs_currencies=usd&include_market_cap=true&include_24hr_change=ture&include_last_updated_at=ture')
			  .then(res => res.json())
			  .then((data) => {
				this.setState({PhoenixDAO_market: data.PhoenixDAO})})
			  .catch(console.log)
	  }

	handleDate = (date) => {
		if (typeof date === 'object' && date.isValid()) {
			this.setState({
				timeForHumans: date.time,
				time: date.unix(),
			},()=>this.setState({dateDisplay: new Date(parseInt(this.state.time, 10) * 1000)}));
			console.log(date)
		}
	}

	handleCurrency = (event) => {
		this.setState({
			currency: event.target.value,
			price: '0'
		},()=>console.log('currency',this.state.currency, this.state.price));

	}

	handleLimited = () => {
		this.setState({
			limited: !this.state.limited
		});
	}

	handleFile = (event) => {
		let file = event.target.files[0];

		if (
			file.size > 1024 * 1024 ||
			(file.type !== 'image/jpeg' && file.type !== 'image/png')
		) {
			this.setState({
				wrong_file: true,
				file: null
			});
		} else {
			this.setState({
				wrong_file: false,
				file_name: file.name,
				file: file,
				fileImg: URL.createObjectURL(event.target.files[0])
			});
		}
	}

	titleChange = (event) => {
		let title = event.target.value;
		if (title.length > 80) {
			title = title.slice(0, 80);
		}
		this.setState({
			title: title,
			title_length: title.length
		});
	}

	descriptionChange = (event) => {
		let description = event.target.value;
		if (description.length > 500) {
			description = description.slice(0, 500);
		}
		this.setState({
			description: description,
			description_length: description.length
		});
	}

	organizerChange = (event) => {
		let organizer = event.target.value;
		if (organizer.length > 100) {
			organizer = organizer.slice(0, 100);
		}
		this.setState({
			organizer: organizer,
			organizer_length: organizer.length
		});
	}

	locationChange = (event) => {
		let location = event.target.value;

		this.setState({
			location: location
		});
	}

	typeChange = (event) => {
		let topic = event.target.value;

		this.setState({
			topic: topic
		},()=>(console.log()));
	}

	categoryChange = (event) => {
		let type = event.target.value;

		this.setState({
			type: type
		},()=>(console.log()));
	}

	priceChange = (event) => {
		if(this.state.currency === 'phnx'){
		let price = this.form.price.value;

		this.setState({
			price: price
		},()=>console.log('price', this.state.price));}
		else{
		let price = '0';
		this.setState({
			price: price
		},()=>console.log('price', this.state.price))
		}
	}

	ticketsChange = (event) => {
		let seats = this.form.seats.value;

		this.setState({
			seats: seats
		});
	}

	handleForm = (event) => {
		event.preventDefault();

		let form_validation = [];
		if (this.state.title === '') form_validation.push('name');
		if (this.state.location === '') form_validation.push('location');
		if (this.state.organizer === '') form_validation.push('organizer');
		if (this.form.description.value === '') form_validation.push('description');
		if (this.state.wrong_file === true || this.state.file === null) form_validation.push('image');
		if (this.state.time === 0) form_validation.push('time');
		if (this.state.price === '') form_validation.push('price');
		if (this.state.limited === true && this.form.seats.value < 1) form_validation.push('seats');
		if (this.state.type === '') form_validation.push('type');

		this.setState({
			form_validation: form_validation
		});

		if (form_validation.length === 0) {
			this.props.createEvent(
				this.state.title,
				this.form.description.value,
				this.state.location,
				this.state.time,
				this.state.file,
				this.state.organizer,
				this.state.type,
				this.state.topic,
				this.state.currency,
				this.state.price,
				this.state.limited,
				this.form.seats.value
			);
		}
	}

	render() {

		let symbol = 'hydro.png';
		let currency = this.state.currency === 'eth' ? 'ETH' : 'PHNX';
		let	freeEvent = '';
			if( this.state.currency === 'eth'){
			freeEvent = <p className="free_event">Free Event</p>
			}

		let file_label = !this.state.wrong_file && this.state.file_name !== '' ? this.state.file_name : 'Select file';

		let warning = {
			name: this.state.form_validation.indexOf('name') === -1 ? '' : 'is-invalid',
			location: this.state.form_validation.indexOf('location') === -1 ? '' : 'is-invalid',
			organizer: this.state.form_validation.indexOf('organizer') === -1 ? '' : 'is-invalid',
			type: this.state.form_validation.indexOf('type') === -1 ? '' : 'is-invalid',
			topic: this.state.form_validation.indexOf('topic') === -1 ? '' : 'is-invalid',
			description: this.state.form_validation.indexOf('description') === -1 ? '' : 'is-invalid',
			image: this.state.form_validation.indexOf('image') === -1 && !this.state.wrong_file ? '' : 'is-invalid',
			time: this.state.form_validation.indexOf('time') === -1 ? '' : 'is-invalid',
			price: this.state.form_validation.indexOf('price') === -1 ? '' : 'is-invalid',
			seats: this.state.form_validation.indexOf('seats') === -1 ? '' : 'is-invalid',
		};

		let alert;

		if (this.state.form_validation.length > 0) {
			alert = <div className="alert alert-dark mt-2" role="alert">Required fields are missed.</div>
		}
		let seatsForHumans = '';
		let organizerForHumans = '';

		if (this.state.limited === true) {
			if (this.state.seats === undefined) {
				seatsForHumans = "0/∞";
			} else {
				seatsForHumans = "0/"+ this.state.seats;
			}
		} else {
			seatsForHumans = "0/∞";
		}

		if (this.state.organizer === '') {
			organizerForHumans = "";
		} else {
			organizerForHumans = "Organizer: " + this.state.organizer;

		}
		let date = new Date(parseInt(this.state.date, 10) * 1000);

		let disabled = false;
		if(this.props.account.length == 0){
			disabled = true;
		}

		return (
			<React.Fragment>
			<div className="row">
			<div className="col col-xl-8 col-lg-8 col-md-12 col-sm-12">
			<form>

				<div className="form-group">
					<label htmlFor="name">Event Name:</label>
					<input type="text" className={"form-control " + warning.name} id="name" title="Event Name" value={this.state.title} onChange={this.titleChange} autoComplete="off" />
					<small className="form-text text-muted">{this.state.title_length}/80 characters available.</small>
				</div>
				<div className="form-group">
					<label htmlFor="description">Event Description:</label>
					<textarea className={"form-control " + warning.description} id="description" title="Event Description" rows="5" ref={(input) => this.form.description = input} onChange={this.descriptionChange} autoComplete="off"></textarea>
					<small className="form-text text-muted">{this.state.description_length}/500 characters available.</small>
				</div>
				<div className="form-group">
					<label htmlFor="location">Event Location:</label>
					<input type="text" className={"form-control " + warning.location} id="location" title="Event Location" onChange={this.locationChange} autoComplete="off" />
				</div>
				<div className="form-group">
					<label htmlFor="description">Event Date and Time:</label>
					<Datetime closeOnSelect={true} onChange={this.handleDate} inputProps={{className : "form-control " + warning.time, title: "Event Date and Time"}} autoComplete="off" />
				</div>
				<div className="form-group">
					<p>Event Cover Image:</p>
					<div className="custom-file">
						<input type="file" className={"custom-file-input " + warning.image} id="customFile" title="Event Cover Image" onChange={this.handleFile} autoComplete="off" />
						<label className="custom-file-label" htmlFor="customFile">{file_label}</label>
					</div>
					<small className="form-text text-muted">Image format: jpg, png. Max file size 1mb.</small>
				</div>
				<div className="form-group">
					<label htmlFor="organizer">Organizer Name:</label>
					<input type="text" className={"form-control " + warning.organizer} id="organizer" title="Organizer Name" value={this.state.organizer} onChange={this.organizerChange} autoComplete="off" />
					<small className="form-text text-muted">{this.state.organizer_length}/100 characters available.</small>
				</div>
				<div className="form-group">
					<label htmlFor="description">Event Type:</label>
					<select className="form-control" id="type" title="Event Type" onChange={this.typeChange}>
					<option value="" disabled="disabled">Select the type of the event</option>
					{eventTypes.map((Type, index) => (
						<option value={Type.slug} key={Type.name}>{Type.name}</option>
					))}
					</select>
				</div>
				<div className="form-group">
					<label htmlFor="description">Event Topic:</label>
					<select className="form-control" id="topic" title="Event Topic" onChange={this.categoryChange}>
					<option value="" disabled="disabled">Select the topic of the event</option>
					{eventTopics.map((Topic, index) => (
						<option value={Topic.slug} key={Topic.name}>{Topic.name}</option>
					))}
					</select>
				</div>
				<br />
				<hr />
				<br />
				<div className="form-group">
					<p>Event Options:</p>
					<div className="custom-control custom-radio custom-control-inline">
						<input type="radio" id="payment2" name="payment" className="custom-control-input" defaultChecked="true" value="phnx" title="PHNX" onChange={this.handleCurrency} autoComplete="off" />
						<label className="custom-control-label" htmlFor="payment2">Paid Event</label>
					</div>
					<div className="custom-control custom-radio custom-control-inline">
						<input type="radio" id="payment1" name="payment" className="custom-control-input" value="eth" title="Ethereum" onChange={this.handleCurrency} autoComplete="off" />
						<label className="custom-control-label" htmlFor="payment1">Free Event</label>
					</div>
				</div>
				<div className="form-group row">
					<div className="col-lg-6">
						<label htmlFor="price">Ticket Price:</label>
						<div className="input-group mb-3">
							<div className="input-group-prepend">
								<span className="input-group-text"><img src={'/images/'+symbol} className="event_price-image" alt="" /></span>
							</div>
							{this.state.currency === 'phnx' &&<input type="number" min="0.00000001" className={"form-control " + warning.price} id="price" title={"Price in PHNX"} ref={(input) => this.form.price = input} autoComplete="off" onChange={this.priceChange} />}
							{this.state.currency === 'eth' &&<input type="number" min="0.00000001" className={"form-control " + warning.price} id="price" title={"Price in PHNX"} value = {this.state.price} autoComplete="off" onChange={this.priceChange} />}

						</div>
						{this.state.currency === 'phnx' &&<div className="input-group mb-3">
							<div className="input-group-prepend">
								<span className="input-group-text"><img src={'/images/dollarsign.png'} className="event_price-image" alt="" /></span>
							</div>
							 <div className={"form-control " + warning.price} title="Price in USD">{numeral(this.state.price * this.state.PhoenixDAO_market.usd).format('0,0.00')} </div>
						</div>}

						{this.state.currency === 'eth' &&<div className="input-group mb-3">
							<div className="input-group-prepend">
								<span className="input-group-text"><img src={'/images/dollarsign.png'} className="event_price-image" alt="" /></span>
							</div>
							 <div className={"form-control " + warning.price} title="Price in USD">0.00 </div>
						</div>}
					</div>
				</div>
				<div className="form-group">
					<p>Ticket Options:</p>
					<div className="custom-control custom-checkbox">
						<input type="checkbox" className="custom-control-input" id="limited" title="Limited tickets" value="true" onChange={this.handleLimited} autoComplete="off" />
						<label className="custom-control-label" htmlFor="limited">Limited tickets</label>
					</div>
					<div className="row mt-3">
						<div className="col-lg-6">
							<label htmlFor="seats">Tickets available:</label>
							<input type="number" className={"form-control " + warning.seats} id="seats" title="Tickets available" disabled={!this.state.limited}  ref={(input) => this.form.seats = input} autoComplete="off" onChange ={this.ticketsChange} />
						</div>
					</div>
				</div>
				{alert}
				<br />
				<button type="submit" className="btn btn-outline-dark" title="Make Your Event Live" onClick={this.handleForm} disabled={disabled}>Make Your Event Live</button>
			</form>
			</div>

<div className="col col-xl-4 col-lg-4 col-md-12 col-sm-12 create-event">
<label>Event Preview:</label>
<div className="card">
<div className="image_wrapper">
	<Link to={"/event/"}>
		<img className="card-img-top event-image" src={this.state.fileImg} alt="Placeholder Event" />
	</Link>
	{freeEvent}
	</div>
	<div className="card-header text-muted event-header">
		<img className="float-left" src={this.state.blockie} alt="" />
		<p className="small text-truncate mb-0">{organizerForHumans}</p>
	</div>
	<div className="card-body">
		<h5 className="card-title event-title">
		{this.state.title}
		</h5>
		{this.state.description}
	</div>
	<ul className="list-group list-group-flush">

		{this.state.currency == 'phnx' &&<li className="list-group-item"><strong>Price:</strong> <img src={'/images/'+symbol} className="event_price-image" alt="" /> {numeral(this.state.price).format('0,0.00')} or <img src={'/images/dollarsign.png'} className="event_price-image"  alt="Event Price" />
		{numeral(this.state.price * this.state.PhoenixDAO_market.usd).format('0,0.00')}</li>}
		{this.state.currency == 'eth' &&<li className="list-group-item"><strong>Price:</strong> <img src={'/images/'+symbol} className="event_price-image" alt="" /> {this.state.price}</li>}
		<li className="list-group-item"><strong>Date: {this.state.dateDisplay.toLocaleDateString()} at {this.state.dateDisplay.toLocaleTimeString()}</strong>  </li>
		<li className="list-group-item"><strong>Location:</strong> {this.state.location} </li>
		<li className="list-group-item"><strong>Tickets Sold:</strong> {seatsForHumans}</li>

	</ul>
	<div className="card-footer text-muted text-center">
		<button className="btn btn-dark" disabled=""><i className="fas fa-ticket-alt"></i> Buy Now</button>
	</div>
</div>
</div>
</div>
</React.Fragment>
		);
	}

	componentDidMount(){
		this.getPhoenixDAOMarketValue()
	}
}

export default Form;
