import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';

import Loading from './Loading';
import Event from './Event';
import Web3 from 'web3';
import {Open_events_ABI, Open_events_Address} from '../config/OpenEvents';


class MyEvents extends Component {
    constructor(props, context) {
		super(props)
		this.state = {
			openEvents : '',
			blocks : 5000000,
			latestblocks : [],
			loading : false,
			Events_Blockchain : [],
			active_length : '',
			isOldestFirst:false,
			isActive:true,
			account:[],
			openEvents:'',
			dateNow:''
		  };

		this.contracts = context.drizzle.contracts;
		this.events = this.contracts['OpenEvents'].methods.eventsOf.cacheCall(this.props.accounts[0]);
		this.perPage = 6;
		this.account = this.props.accounts[0];
		this.ActiveEvent = this.ActiveEvent.bind(this)
		this.PastEvent = this.PastEvent.bind(this)
		this.updateSearch = this.updateSearch.bind(this)
	}

	async loadBlockchain(){
		const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/72e114745bbf4822b987489c119f858b'));
		const openEvents =  new web3.eth.Contract(Open_events_ABI, Open_events_Address);
		
		if (this._isMounted){
		this.setState({openEvents:openEvents});
		this.setState({Events_Blockchain:[]});

		const dateTime = Date.now();
		const dateNow = Math.floor(dateTime / 1000);
		const blockNumber = await web3.eth.getBlockNumber();
		this.setState({dateNow})
		this.setState({blocks:blockNumber - 50000});
		this.setState({latestblocks:blockNumber});
		this.loadActiveEvents()

		this.state.openEvents.events.CreatedEvent({filter:{owner:this.account},fromBlock: this.state.latestblocks, toBlock:'latest'})
		.on('data', (log) => {
		this.setState({loading:true});
	   
		this.setState({Events_Blockchain:[...this.state.Events_Blockchain,log]});
		var newest = this.state.Events_Blockchain
		var newsort= newest.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
		
		if (this._isMounted){
		this.setState({Events_Blockchain:newsort});
		this.setState({active_length:this.state.Events_Blockchain.length})
		this.setState({loading:false})};
		
		})
		}
	}


	async loadActiveEvents(){
		
		if (this._isMounted){
		this.setState({Events_Blockchain:[]}); }
	  
		this.state.openEvents.getPastEvents("CreatedEvent",{filter:{owner:this.account},fromBlock: this.state.blocks, toBlock:'latest'})
		.then(events=>{
		this.setState({loading:true})
		var newest = events.filter((activeEvents)=>activeEvents.returnValues.time >=(this.state.dateNow));
		var newsort= newest.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
		
		if (this._isMounted){
		this.setState({Events_Blockchain:newsort,check:newsort});
		this.setState({loading:false})
		this.setState({active_length:this.state.Events_Blockchain.length}); }
		 
		}).catch((err)=>console.error(err))
	
		
	  }

	async loadPastEvents(){
    
		if (this._isMounted){
		this.setState({Events_Blockchain:[]});}
		this.state.openEvents.getPastEvents("CreatedEvent",{filter:{owner:this.account},fromBlock: this.state.blocks, toBlock:'latest'})
		.then(events=>{
		this.setState({loading:true})
		var newest = events.filter((activeEvents)=>activeEvents.returnValues.time <=(this.state.dateNow));
		var newsort= newest.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
		
		if (this._isMounted){
		this.setState({Events_Blockchain:newsort,check:newsort});
		this.setState({loading:false})
		this.setState({active_length:this.state.Events_Blockchain.length}); }
		 
		}).catch((err)=>console.error(err))
	
	  }

	  //Display my Close Events
	  PastEvent=(e)=>{
		this.setState({
			isActive: false,
		},()=>{if(!this.state.isActive){
		this.loadPastEvents()}})
		
		
	  }
	//Display my Active Events
	  ActiveEvent=(e)=>{
		this.setState({
			isActive: true,
		},()=>{if(this.state.isActive){
			this.loadActiveEvents()}})
	  }

	//Search for Events
	  updateSearch=(e)=>{
		let {value} = e.target
		this.setState({value},()=>{
		if(this.state.value !== ""){  
		var filteredEvents = this.state.check;
		filteredEvents = filteredEvents.filter((events)=>{
		return events.returnValues.name.toLowerCase().search(this.state.value.toLowerCase()) !==-1;
		
		
		})}else{ filteredEvents = this.state.check}
	
	  this.setState({Events_Blockchain:filteredEvents,
		active_length:filteredEvents.length},()=>console.log("chcking page",this.state.active_length));
	
	  })}

	render() {
		let body = <Loading />;

		if (typeof this.props.contracts['OpenEvents'].eventsOf[this.events] !== 'undefined') {
			let events = this.props.contracts['OpenEvents'].eventsOf[this.events].value;
			
			if (events.length === 0) {
				body =
					<div>
						You are not managing any events.&nbsp;
						<Link to="/createevent">Create new event</Link>.
					</div>
				;
			} else {
				let count = this.state.active_length
			
				let currentPage = Number(this.props.match.params.page);
				if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

				let end = currentPage * this.perPage;
				let start = end - this.perPage;
				if (end > count) end = count;
				let pages = Math.ceil(count / this.perPage);

				let events = [];
				let myEvents = [];

				/*for (let i = count - 1; i >= 0; i--) {
					 //let event = parseInt(this.props.contracts['OpenEvents'].eventsOf[this.events].value[i], 10);					
					events.push(parseInt(this.props.contracts['OpenEvents'].eventsOf[this.events].value[i], 10))
				
				}
				
				for(let x = start;x < end; x++){
					myEvents.push(<Event key={events[x]} id={events[x]} />)
				}*/
				

				this.state.Events_Blockchain.map((value)=>events.push(<Event key={value.returnValues.eventId} id={value.returnValues.eventId} ipfs={value.returnValues.ipfs}/>))

				for (let i = start; i < end; i++) {
					myEvents.push(events[i])
					}

				let pagination;

				if (pages > 1) {
					let links = [];
					for (let i = 1; i <= pages; i++) {
						let active = i === currentPage ? 'active' : '';
						links.push(
							<li className={"page-item " + active} key={i}>
								<Link to={"/myevents/" + i} className="page-link">{i}</Link>
							</li>
						);
					}

					pagination =
						<nav>
							<ul className="pagination justify-content-center">
								{links}
							</ul>
						</nav>
					;
				}

				body =
					<div>
						<div className="row user-list mt-4">
						{myEvents}
						</div>
						{pagination}
					</div>
				;
			}
		}

		return (
			<div>
				<h2 className="col-md-10"><i className="fa fa-calendar-alt "></i>  My Events</h2>
				<div className="input-group input-group-sm mt-5 mb-4">
				<button className="btn sort_button col-md-2 mx-3"  onClick={this.ActiveEvent} >Active Events</button>
				<button className="btn sort_button col-md-2 ml-3"  onClick={this.PastEvent} >Close Events</button>
        		<div className="input-group-prepend ml-5 ">
         		<span className="input-group-text search-icon " id="inputGroup-sizing-lg"><i className="fa fa-search"></i>&nbsp;Search </span>
        		</div> 
        		<input type="text" value={this.state.value} onChange={this.updateSearch.bind(this)} className="form-control2 col-md-5" aria-label="Large" aria-describedby="inputGroup-sizing-sm" />
				
				</div>
				
				<hr />
				{body}
			</div>
		);
	}

	componentDidMount() {
		this._isMounted = true;	
		this.loadBlockchain();
		
		
		}

		
}
	
	

MyEvents.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		accounts: state.accounts
    };
};

const AppContainer = drizzleConnect(MyEvents, mapStateToProps);
export default AppContainer;
