import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';

import ipfs from '../../utils/ipfs';

import Form from './Form';
import Loader from './Loader';
import Error from './Error';
import Done from './Done';

class CreateEvent extends Component {
	constructor(props, context) {
		super(props);

		this.state = {
			done: false,
			upload: false,
			stage: 0,
			title: null,
			error: false,
			error_text: null,
			ipfs: null,
			data: {
				name: null,
				description: null,
				time: 0,
				currency: null,
				price: 0,
				organizer: null,
				limited: false,
				seats: 0
			}
		};

		this.contracts = context.drizzle.contracts;
	}

	createEvent = (name, description, location, time, file, organizer, type, topic, currency, price, limited, seats) => {

		this.setState({
			upload: true,
			stage: 25,
			title: 'Uploading event image...',
			data: {
				name: name,
				description: description,
				time: time,
				currency: currency,
				price: this.context.drizzle.web3.utils.toWei(price),
				organizer: organizer,
				limited: limited,
				seats: seats === '' ? 0 : parseInt(seats, 10)
			}
		}, () => {
			this.stageUpdater(90);
			this.readFile(file);
		});
	}

	readFile = (file) => {
		let reader = new window.FileReader();
		console.log(file);
		reader.readAsDataURL(file);
		reader.onloadend = () => this.convertAndUpload(reader);
	}

    convertAndUpload = (reader) => {
		let pinit = process.env.NODE_ENV === 'production';

		let data = JSON.stringify({
			image: reader.result,
			text: this.state.data.description
		});

		let buffer = Buffer.from(data);

		ipfs.add(buffer, {pin: pinit}).then((hash) => {
			this.setState({
				stage: 95,
				title: 'Creating transaction...',
				ipfs: hash[0].hash
			});
			this.uploadTransaction();
		}).catch((error) => {
			this.setState({
				error: true,
				error_text: 'IPFS Error'
			});
		});
	};

	uploadTransaction = () => {
		let id = this.contracts['OpenEvents'].methods.createEvent.cacheSend(
			this.state.data.name,
			this.state.data.time,
			this.state.data.price,
			this.state.data.currency === 'eth' ? false : true,
			this.state.data.limited,
			this.state.data.seats,
			this.state.ipfs
		);

		this.transactionChecker(id);
	}

	transactionChecker = (id) => {
		let tx_checker = setInterval(() => {
			let tx = this.props.transactionStack[id];
			if (typeof tx !== 'undefined') {
				this.setState({
					upload: false,
					done: true
				});
				clearInterval(tx_checker);
			}
		}, 100);
	}

	stageUpdater = (max) => {
		let updater = setInterval(() => {
			if (this.state.stage < max) {
				this.setState({
					stage: this.state.stage + 1
				});
			} else {
				clearInterval(updater);
			}
		}, 500);
	}

	render() {
		if (this.state.error) {
			return <Error message={this.state.error_text} />;
		}

		if (this.state.done) {
			return <Done />;
		}

		let body =
			this.state.upload ?
				<Loader progress={this.state.stage} text={this.state.title} /> :
				<React.Fragment>
					<div className="row">
						<div className="col col-xl-8 col-lg-8 col-md-12 col-sm-12">
							<Form createEvent={this.createEvent} />
						</div>

						<div className="col col-xl-4 col-lg-4 col-md-12 col-sm-12">
							<label>Event Preview:</label>
							<div className="card">
								<Link to={"/event/"}>
									<img className="card-img-top event-image" src="/images/topics/parties.jpg" alt="Placeholder Event" />
								</Link>
								<div className="card-header text-muted event-header">
									<img className="float-left" src="" alt="" />
									<p className="small text-truncate mb-0">
										Creator: <a href={"https://rinkeby.etherscan.io/address/"} target="_blank" className="event_creator-link">

										</a>
									</p>
								</div>
								<div className="card-body">
									<h5 className="card-title event-title">
									Hydro Party Event
									</h5>
									Description goes here.
								</div>
								<ul className="list-group list-group-flush">
									<li className="list-group-item"><strong>Price:</strong> 100 Hydro</li>
									<li className="list-group-item"><strong>Date:</strong> 01/01/2020</li>
									<li className="list-group-item"><strong>Tickets Sold:</strong> 0/50</li>
								</ul>
								<div className="card-footer text-muted text-center">
									<button className="btn btn-dark" disabled=""><i className="fas fa-ticket-alt"></i> Buy Now</button>
								</div>
							</div>
						</div>
					</div>
				</React.Fragment>
		;

		return (
			<div>
				<h2><i className="fa fa-edit"></i> Create Event</h2>
				<hr />
				{body}
			</div>
		);
	}
}

CreateEvent.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		transactionStack: state.transactionStack
    };
};

const AppContainer = drizzleConnect(CreateEvent, mapStateToProps);
export default AppContainer;
