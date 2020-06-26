import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import makeBlockie from 'ethereum-blockies-base64';
import {PhoenixDAO_Testnet_Token_ABI, PhoenixDAO_Testnet_Token_Address} from '../config/phoenixDAOcontract_testnet.js';

import ipfs from '../utils/ipfs';

import Loading from './Loading';
import eventTopics from '../config/topics.json';

let numeral = require('numeral');

class Event extends Component {
    constructor(props, context) {
		try {
			var contractConfig = {
			  contractName: 'PHNX',
			  web3Contract: new context.drizzle.web3.eth.Contract(
				PhoenixDAO_Testnet_Token_ABI,
				PhoenixDAO_Testnet_Token_Address,
			  ),

			};
			context.drizzle.addContract(contractConfig);
			//Importing PhoenixDAO contracts
			// **** ENDS UP HERE, SO THIS WORKS
			/*console.log(
			  "SUCCESS",
			  PhoenixDAO_Testnet_Token_Address,
			  context.drizzle.contracts
			);*/
		  } catch (e) {
			//console.log("ERROR", PhoenixDAO_Testnet_Token_Address, e);
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
			locations:null,
			PhoenixDAO_market:[],

			fee:'',
			token:'',
			openEvents_address:'',
			buyticket:'',
			approve:'',
		};
		this.isCancelled = false;
	}

	//get market cap & dollar value of PHNX
	async getPhoenixDAOMarketValue(){

		fetch('https://api.coingecko.com/api/v3/simple/price?ids=phoenixdao&vs_currencies=usd&include_market_cap=true&include_24hr_change=ture&include_last_updated_at=ture')
			  .then(res => res.json())
			  .then((data) => {
				if (this._isMounted){
				this.setState({PhoenixDAO_market: data.phoenixdao })}
			  })
			  .catch(console.log)
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
			approve:this.contracts['PHNX'].methods.approve(this.contracts['OpenEvents'].address, this.props.contracts['OpenEvents'].getEvent[this.event].value[2])
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


    // getPrettyCategory(rawCategory) {
    //   let prettyCategory = "";
    //
    //   {eventTopics.map((Topic, index) => (
    //     if(Topic.slug == rawCategory) {
    //       prettyCategory = Topic.slug;
    //     }
    //
    //   ))}
    //
    //   return prettyCategory;
    // }


	 render() {
		let body = <div className="card"><div className="card-body"><Loading /></div></div>;

		if (typeof this.props.contracts['OpenEvents'].getEvent[this.event] !== 'undefined' && this.props.contracts['OpenEvents'].getEvent[this.event].value) {


			let event_data = this.props.contracts['OpenEvents'].getEvent[this.event].value;


			let image = this.getImage();
			let description = this.getDescription();
			let locations = this.getLocation();

			let buttonText = event_data[3]? "Buy Ticket": "Get Ticket";

			let	freeEvent = '';
			if(!event_data[3]){
			freeEvent = <p className="free_event">Free Event</p>
			}

			if (event_data[3] !=='undefined'){
			let symbol = 'PhoenixDAO.png';

			let price = event_data[3]? this.context.drizzle.web3.utils.fromWei(event_data[2]) : 'Free Event';
			let date = new Date(parseInt(event_data[1], 10) * 1000);

			let max_seats = event_data[4] ? event_data[5] : '∞';

			let disabled = false;
			let soldOut = " ";
			let sold = false;

			if (event_data[4] && (Number(event_data[6]) >= Number(event_data[5]))) {

			let disabledStatus = '';
				sold = true
				disabled = true;
				buttonText = <span><span role="img" aria-label="alert"> </span> Sold Out</span>;
				soldOut = <p className="sold_out">Sold Out</p>;
			}

			if (date.getTime() < new Date().getTime()) {
				disabled = true;
        buttonText = "Event has ended";
			}

      let badge = "";

      if (event_data[6] >= 2) {
        badge = <img src="/images/fire.png" className="event_badge-hot" alt="Hot Icon" />;
	  }

      let rawCategory = event_data[8];

      var categoryRemovedDashes = rawCategory;
      categoryRemovedDashes = categoryRemovedDashes.replace(/-/g, ' ');

      var category = categoryRemovedDashes.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');

      let topicURL = "/topic/"+event_data[8]+"/1";

	  //console.log(event_data);
	  //Friendly URL Title
	  let rawTitle = event_data[0];
      var titleRemovedSpaces = rawTitle;
	  titleRemovedSpaces = titleRemovedSpaces.replace(/ /g, '-');

      var pagetitle = titleRemovedSpaces.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');

	  let titleURL = "/event/"+pagetitle+"/" + this.props.id;
	  let myEventStatURL = "/event-stat/"+pagetitle+"/" + this.props.id;

			body =
				<div className="card">
					<div className="image_wrapper">
					<Link to={titleURL}>
            <img className="card-img-top event-image" src={image} alt={event_data[0]} />
          </Link>
		  {soldOut}
		  {!sold && freeEvent}
		  </div>
					<div className="card-header text-muted event-header ">
						<img className="float-left" src={makeBlockie(event_data[9])} alt={event_data[9]} />
						{this.props.myEvents?<Link to={myEventStatURL}><p className="myEventStat small text-truncate mb-0">View Event Stats</p></Link>:''}
					</div>

					<div className="card-body">
						<h5 className="card-title event-title" title={event_data[0]} >
							<Link to={titleURL} >{badge}{event_data[0]}</Link>
						</h5>
						{description}
					</div>


					<ul className="list-group list-group-flush">
						<li className="list-group-item ">{locations}</li>
						<li className="list-group-item"><strong>Category:</strong> <a href={topicURL}>{category}</a></li>
						<li className="list-group-item"><strong>Price:</strong> <img src={'/images/'+symbol} className="event_price-image" alt="Event Price Icon" /> {event_data[3] ? '' + numeral(price).format('0,0'): '' + price}
						{event_data[3] ? ' or ':''}
						{event_data[3]? <img src={'/images/dollarsign.png'} className="event_price-image"  alt="Event Price" />:''}
						{event_data[3]?numeral(price * this.state.PhoenixDAO_market.usd).format('0,0.00'):''}</li>
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
			<div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 pb-4 d-flex align-items-stretch">
				{body}
			</div>
		);
	}

	componentDidMount() {
		this._isMounted = true;
		this.updateIPFS();
		this.getPhoenixDAOMarketValue();

	}

	componentDidUpdate() {
		this.updateIPFS();
		//this.afterApprove();
	}

	componentWillUnmount() {
		this.isCancelled = true;
		this._isMounted = false;
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
