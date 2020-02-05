import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import makeBlockie from 'ethereum-blockies-base64';
import {Hydro_Testnet_Token_ABI, Hydro_Testnet_Token_Address} from '../config/hydrocontract_testnet.js';

import ipfs from '../utils/ipfs';

import Loading from './Loading';

class Event extends Component {
    constructor(props, context) {
		try {
			var contractConfig = {
			  contractName: 'Hydro',
			  web3Contract: new context.drizzle.web3.eth.Contract(
				Hydro_Testnet_Token_ABI,
				Hydro_Testnet_Token_Address,	
			  ),
			  
			};
			context.drizzle.addContract(contractConfig);
			//Importing Hydro contracts
			// **** ENDS UP HERE, SO THIS WORKS
			/*console.log(
			  "SUCCESS",
			  Hydro_Testnet_Token_Address,
			  context.drizzle.contracts
			);*/
		  } catch (e) {
			//console.log("ERROR", Hydro_Testnet_Token_Address, e);
		  }

        super(props);
		this.contracts = context.drizzle.contracts;
		this.event = this.contracts['OpenEvents'].methods.getEvent.cacheCall(this.props.id);
		this.account = this.props.accounts[0];
		this.state = {
			loading: false,
			loaded: false,
			description: null,
			image: null,
			ipfs_problem: false,
			locations:'',
			
			fee:'',
			token:'',
			openEvents_address:'',
			buyticket:'',
			approve:'',
		};
		this.isCancelled = false;
	}
	

	updateIPFS = () => {

		if (this.state.loaded === false && this.state.loading === false && typeof this.props.contracts['OpenEvents'].getEvent[this.event] !== 'undefined') {
			this.setState({
				loading: true
			}, () => {
				 ipfs.get(this.props.ipfs).then((file) => {
					let data = JSON.parse(file[0].content.toString());
					if (!this.isCancelled) {
						this.setState({
							loading: false,
							loaded: true,
							description: data.text,
							image: data.image,
							locations:data.location
						});
					}
				}).catch(() => {
					if (!this.isCancelled) {
						this.setState({
							loading: false,
							loaded: true,
							ipfs_problem: true
						});
					}
				});
			});
			
		}	
		
	}

	
	getImage = () => {
		let image = '/images/loading_ipfs.png';
		if (this.state.ipfs_problem) image = '/images/problem_ipfs.png';
		if (this.state.image !== null) image = this.state.image;
		return image;
	}

	getDescription = () => {
		let description = <Loading />;
		if (this.state.ipfs_problem) description = <p className="text-center mb-0 event-description"><span role="img" aria-label="monkey">🙊</span>We can not load description</p>;
		if (this.state.description !== null) {
			let text = this.state.description.length > 30 ? this.state.description.slice(0, 60) + '...' : this.state.description;
			description = <p className="card-text event-description">{text}</p>;
		}
		return description;
	}
	//get the location of Events on IPFS
	getLocation = () => {
		let locations = []
		if (this.state.ipfs_problem) locations = <p className="text-center mb-0 event-description"><span role="img" aria-label="monkey">🙊</span>We can not load location</p>;
		if (this.state.locations !== null) {
			let place= this.state.locations
			locations = <strong>Location: {place}</strong>;
		}
		return locations;
	}


	inquire = () =>{
		this.setState({
			fee:this.props.contracts['OpenEvents'].getEvent[this.event].value[2],
			token:this.props.contracts['OpenEvents'].getEvent[this.event].value[3],
			openEvents_address:this.contracts['OpenEvents'].address,
			buyticket:this.contracts['OpenEvents'].methods.buyTicket(this.props.id),
			approve:this.contracts['Hydro'].methods.approve(this.contracts['OpenEvents'].address, this.props.contracts['OpenEvents'].getEvent[this.event].value[2])
			},()=>{
				  this.props.inquire(
					  this.props.id,
					  this.state.fee,
					  this.state.token,
					  this.state.openEvents_address,
					  this.state.buyticket,
					  this.state.approve)
				})
			}


	 render() {
		let body = <div className="card"><div className="card-body"><Loading /></div></div>;

		if (typeof this.props.contracts['OpenEvents'].getEvent[this.event] !== 'undefined' && this.props.contracts['OpenEvents'].getEvent[this.event].value) {
		
			
			let event_data = this.props.contracts['OpenEvents'].getEvent[this.event].value;
		
			
			let image = this.getImage();
			let description = this.getDescription();
			let locations = this.getLocation();

     		let buttonText = "Buy Ticket";
			
			if (event_data[3] !=='undefined'){
			let symbol = event_data[3] ? 'hydro.png' : 'ethereum.png';
			 
			let price = this.context.drizzle.web3.utils.fromWei(event_data[2]);
			let date = new Date(parseInt(event_data[1], 10) * 1000);

			let max_seats = event_data[4] ? event_data[5] : '∞';

			let disabled = false;

			if (event_data[4] && (Number(event_data[6]) >= Number(event_data[5]))) {

        let disabledStatus = '';
				disabled = true;
				disabledStatus = <span><span role="img" aria-label="alert">⚠️</span> No tickets available.</span>;
			}

			if (date.getTime() < new Date().getTime()) {
				disabled = true;
        buttonText = "This event has ended.";
			}

      let badge = "";

      if (event_data[6] >= 2) {
        badge = <img src="/images/fire.png" className="event_badge-hot" alt="Hot Icon" />;
      }
	
			body =
				<div className="card">
					<Link to={"/event/" + this.props.id}>
            <img className="card-img-top event-image" src={image} alt={event_data[0]} />
          </Link>
					<div className="card-header text-muted event-header ">
						<img className="float-left" src={makeBlockie(event_data[9])} alt={event_data[9]} />
						<p className="small text-truncate mb-0">
							Creator: <a href={"https://rinkeby.etherscan.io/address/" + event_data[9]} target="_blank" className="event_creator-link">
								{event_data[9]}
							</a>
						</p>
					</div>
					
					<div className="card-body">
						<h5 className="card-title event-title">
							<Link to={"/event/" + this.props.id} >{badge}{event_data[0]}</Link>
						</h5>
						{description}
						</div>
					
					
					<ul className="list-group list-group-flush">
						<li className="list-group-item ">{locations}</li>
						<li className="list-group-item"><strong>Category:</strong> {event_data[8]}</li>
						<li className="list-group-item"><strong>Price:</strong> <img src={'/images/'+symbol} className="event_price-image" alt="Event Price Icon" /> {price}</li>
						<li className="list-group-item"><strong>Date:</strong> {date.toLocaleDateString()} at {date.toLocaleTimeString()}</li>
						<li className="list-group-item"><strong>Tickets Sold:</strong> {event_data[6]}/{max_seats}</li>
					</ul>
				
					<div className="card-footer text-muted text-center">
						<button className="btn btn-dark" onClick={this.inquire} disabled={disabled}><i className="fas fa-ticket-alt"></i> {buttonText}</button>
					</div>
				</div>
			;
		}}

		return (
			<div className="col-lg-4 pb-4 d-flex align-items-stretch">
				{body}
			</div>
		);
	}

	componentDidMount() {
		this.updateIPFS()
	
	}

	componentDidUpdate() {
		this.updateIPFS()
		//this.afterApprove();
	}

	componentWillUnmount() {
		this.isCancelled = true;
	}
}

Event.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		accounts: state.accounts,
		transactionStack: state.transactionStack
    };
};

const AppContainer = drizzleConnect(Event, mapStateToProps);
export default AppContainer;