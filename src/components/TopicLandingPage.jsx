import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Loading from './Loading';
import HydroLoader from './HydroLoader';
import Event from './Event';

import Web3 from 'web3';
import {Open_events_ABI, Open_events_Address} from '../config/OpenEvents';


import topicsJson from '../config/topics.json';


class TopicLandingPage extends Component
{
  constructor(props, context)
  {
      super(props);

      this.state = {
        openEvents : '',
        blocks : 5000000,
        latestblocks :6000000,
        blocks:0,
        loading : true,
        Topic_Events : [],
        topic_copy:[],
        active_length : '',
        isOldestFirst:false,
        isActive:true,
        dateNow:''

      };

	    this.contracts = context.drizzle.contracts;
	    this.eventCount = this.contracts['OpenEvents'].methods.getEventsCount.cacheCall();
	    this.perPage = 6;
      this.topicClick = this.topicClick.bind(this);
      this.theTopic = this.getTopicData();
      this.topicBackground = this.theTopic['image'];

      this.ActiveEvent = this.ActiveEvent.bind(this);
	  	this.PastEvent = this.PastEvent.bind(this);
      this.toggleSortDate = this.toggleSortDate.bind(this);


	}

  componentDidUpdate()
  {
    //this.theTopic = this.getTopicData();
	}

	componentDidMount()
  {
    this._isMounted = true;
		this.loadBlockchain();
    //this.theTopic = this.getTopicData();
	}

	componentWillUnmount()
  {

	}

  topicClick(slug)
  {
    this.props.history.push("/topic/"+slug+"/"+1);
    this.theTopic = this.getTopicData();
    this.loadBlockchain();
    window.scrollTo(0, 180);
  }

  getLastURLSegment()
  {
    console.log(this.props.history.location.pathname);
    let currentRoute = this.props.history.location.pathname;
    let middleSegment = currentRoute.split('/')
    //let lastSegment = currentRoute.substr(currentRoute.lastIndexOf('/') + 1);
    return middleSegment[middleSegment.length - 2];
  }

  getTopicData() {
    let topicSlug = this.getLastURLSegment();

    let theTopic = topicsJson.filter(function (topic) {
      return topic.slug == topicSlug;

    });

    return theTopic[0]

    ;

  }

  //Loadblockchain Data
  async loadBlockchain(){

    const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/72e114745bbf4822b987489c119f858b'));
    const openEvents =  new web3.eth.Contract(Open_events_ABI, Open_events_Address);

    if (this._isMounted){
    this.setState({openEvents});
    this.setState({Topic_Events:[],active_length:0});

    const dateTime = Date.now();
    const dateNow = Math.floor(dateTime / 1000);
    const blockNumber = await web3.eth.getBlockNumber();

    this.setState({dateNow})
    this.setState({blocks:blockNumber});
    this.setState({latestblocks:blockNumber - 1});
    this.setState({Topic_Events:[]});

    if(this.state.isActive){
      this.loadActiveEvents()
      }
    else{
      this.loadPastEvents()
      }
    }

    openEvents.events.CreatedEvent({fromBlock: this.state.blocks, toBlock:'latest'})
    .on('data', (log) => setTimeout(()=> {
    if(this.state.isActive && log.returnValues.category === this.props.match.params.page){

    this.setState({Topic_Events:[...this.state.Topic_Events,log]});
    var newest = this.state.Topic_Events
    var newsort= newest.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
    if (this._isMounted){


    //this.setState({incoming:false});
    this.setState({Topic_Events:newsort,topic_copy:newsort});
    this.setState({active_length:this.state.Topic_Events.length})
       };
      }
    },10000))

  }


  //Get My Active Events on Blockchain
	async loadActiveEvents(){

		if (this._isMounted){
		this.setState({Topic_Events:[],active_length:0}); }

		this.state.openEvents.getPastEvents("CreatedEvent",{fromBlock: 5000000, toBlock:this.state.latestblocks})
		.then(events=>{
		this.setState({loading:true})
		var newest = events.filter((activeEvents)=>activeEvents.returnValues.time >=(this.state.dateNow) && activeEvents.returnValues.category === this.props.match.params.page);
		var newsort= newest.concat().sort((a,b)=> b.blockNumber- a.blockNumber);

		if (this._isMounted){
      this.setState({Topic_Events:newsort,topic_copy:newsort});
      this.setState({active_length:this.state.Topic_Events.length});
      setTimeout(()=>this.setState({loading:false}),1000);}

		}).catch((err)=>console.error(err))

    }

    //Get My Active Events on Blockchain
	async loadPastEvents(){

		if (this._isMounted){
		this.setState({Topic_Events:[],active_length:0}); }

		this.state.openEvents.getPastEvents("CreatedEvent",{fromBlock: 5000000, toBlock:this.state.latestblocks})
		.then(events=>{
		this.setState({loading:true})
		var newest = events.filter((activeEvents)=>activeEvents.returnValues.time <=(this.state.dateNow) && activeEvents.returnValues.category === this.props.match.params.page);
		var newsort= newest.concat().sort((a,b)=> b.blockNumber- a.blockNumber);

		if (this._isMounted){
      this.setState({Topic_Events:newsort,topic_copy:newsort});
      this.setState({active_length:this.state.Topic_Events.length});
      setTimeout(()=>this.setState({loading:false}),1000); }

		}).catch((err)=>console.error(err))

    }


  //Display My Close Events
	PastEvent=(e)=>{
		this.setState({
      isActive: false,
      loading:true,
		},()=>{if(!this.state.isActive){
		this.loadPastEvents()}})
	  }

  //Display My Active Events
	ActiveEvent=(e)=>{
		this.setState({
      isActive: true,
      loading:true
		},()=>{if(this.state.isActive){
			this.loadActiveEvents()}})
	  }


  //Search Active Events By Name
  updateSearch=(e)=>{
    let {value} = e.target
    this.setState({value},()=>{
    if(this.state.value !== ""){
    var filteredEvents = this.state.topic_copy;
    filteredEvents = filteredEvents.filter((events)=>{
    return events.returnValues.name.toLowerCase().search(this.state.value.toLowerCase()) !==-1;


    })}else{ filteredEvents = this.state.topic_copy}

  this.setState({Topic_Events:filteredEvents,
    active_length:filteredEvents.length});
    this.props.history.push("/topic/"+this.props.match.params.page+"/"+1)
  })}

  //Sort Active Events By Date(Newest/Oldest)
  toggleSortDate=(e)=>{
    let {value} = e.target
    this.setState({value},()=>{
    const{Topic_Events}=this.state
    var newPolls = Topic_Events

     if(this.state.isOldestFirst){
        newPolls = Topic_Events.concat().sort((a,b)=> b.returnValues.eventId - a.returnValues.eventId)
        }
    else {
        newPolls = Topic_Events.concat().sort((a,b)=> a.returnValues.eventId - b.returnValues.eventId)
      }

      this.setState({
      isOldestFirst: !this.state.isOldestFirst,
      Topic_Events:newPolls
      });
    })}

	render()
  {
		let body = <Loading />;
    const topic = this.theTopic;


		if (typeof this.props.contracts['OpenEvents'].getEventsCount[this.eventCount] !== 'undefined' ) {
      let count = this.state.Topic_Events.length;
      if(this.state.loading){
        body = <HydroLoader/>
      }
			  else if (count === 0 && !this.state.loading) {
				body = <p className="text-center not-found"><span role="img" aria-label="thinking">🤔</span>&nbsp;No events found. <a href="/createevent">Try creating one.</a></p>;
			} else {

        let currentPage = Number(this.props.match.params.id);

				if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

				let end = currentPage * this.perPage;
				let start = end - this.perPage;
				if (end > count) end = count;
				let pages = Math.ceil(count / this.perPage);

				let events_list = [];

				for (let i = start; i < end; i++) {

          events_list.push(<Event
            inquire={this.props.inquire}
            key={this.state.Topic_Events[i].returnValues.eventId}
            id={this.state.Topic_Events[i].returnValues.eventId}
            ipfs={this.state.Topic_Events[i].returnValues.ipfs} />);
				}

				let pagination = '';
				if (pages > 1) {
					let links = [];

					for (let i = 1; i <= pages; i++) {
						let active = i === currentPage ? 'active' : '';
						links.push(
							<li className={"page-item " + active} key={i}>
                <Link to={"/topic/" + this.props.match.params.page + "/" + i } onClick={window.scrollTo(0, 700)} className="page-link">{i}</Link>
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
					<div >
						<div className="row user-list mt-4">
							{events_list}
						</div>
						{pagination}
					</div>
				;
			}
		}

		return(
      <React.Fragment>
      <div className="retract-page-inner-wrapper">
        <div className="topic-hero-wrapper">
          <img src={'/images/topics/'+this.theTopic['image']} alt={topic.name} />
        </div>
      </div>

			<div className="retract-page-inner-wrapper-alternative">

      <br /><br />


      <div className="input-group input-group-lg">
        <div className="input-group-prepend ">
          <span className="input-group-text search-icon" id="inputGroup-sizing-lg"><i className="fa fa-search"></i>&nbsp;Search </span>
        </div>
        <input type="text" value={this.state.value} onChange={this.updateSearch.bind(this)} className="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm" />
      </div>
      <br /><br />

      <div>
          <h2 className =""><i className={this.state.isActive ?' fa fa-calendar-alt':' fa fa-archive'}></i>{this.state.isActive ?' Active':' Past'} Events In The <strong>{topic.name}</strong> Topic</h2>

          <div className="mt-4">
          <button className="btn sort_button col-md-2 mr-4"  onClick={this.ActiveEvent} >Active Events</button>
				  <button className="btn sort_button col-md-2 ml-1"  onClick={this.PastEvent} >Past Events</button>
          <button className="btn sort_button col-md-2 float-right" value={this.state.value} onClick={this.toggleSortDate} onChange={this.toggleSortDate.bind(this)}>{this.state.isOldestFirst ?'Sort: Oldest':'Sort: Newest'}</button>
          </div>

          <hr />
          {body}
      </div>

      <br /><br />

      <div className="topics-wrapper">
      <h2><i className="fa fa-calendar-alt"></i> More Topics</h2>

      <hr />
        <div className="row user-list mt-4">
          {topicsJson.map(topic => (
            <div className="col-lg-4 pb-4 d-flex align-items-stretch" key={topic.slug}>
              <div className="topic" style={{ backgroundImage: "url(/images/topics/" + topic.image +")"}} onClick={() => {this.topicClick(topic.slug)}}>
              <div className="topic-caption"><h3>{topic.name}</h3><button className="btn sort_button col-md-2">View Topic</button></div>

              </div>
            </div>
            ))}
        </div>
      </div>



    </div>

    </React.Fragment>
		);
	}
}

TopicLandingPage.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state =>
{
    return {
		contracts: state.contracts,
		accounts: state.accounts
    };
};

const AppContainer = drizzleConnect(TopicLandingPage, mapStateToProps);
export default AppContainer;
