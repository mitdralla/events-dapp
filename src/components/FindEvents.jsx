import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel'

// Import dApp Components
import Loading from './Loading';
import Event from './Event';
import Web3 from 'web3';
import {Open_events_ABI, Open_events_Address} from '../config/OpenEvents';

// TODO: Make slides dynamic: import slidesJson from '../config/slides.json';
import topicsJson from '../config/topics.json';



class FindEvents extends Component
{
  constructor(props, context)
  {
      super(props);
      this.state = {
        openEvents : '',
        blocks : 5000000,
        latestblocks : [],
        loading : false,
        Events_Blockchain : [],
        active_length : '',
        isOldestFirst:false,

      };
      
	    this.contracts = context.drizzle.contracts;
	    this.eventCount = this.contracts['OpenEvents'].methods.getEventsCount.cacheCall();
	    this.perPage = 6;
      this.topicClick = this.topicClick.bind(this);
      this.toggleSortDate = this.toggleSortDate.bind(this); 
	}

  topicClick(slug)
  {
    this.props.history.push("/topic/"+slug);
    window.scrollTo(0, 0);
  }

  readMoreClick(location)
  {
    this.props.history.push(location);
    window.scrollTo(0, 0);
  }

  ctasClick(slug)
  {
    this.props.history.push("/"+slug);
    window.scrollTo(0, 0);
  }

  //Loads The Blockhain Data,
  async loadBlockchain(){
    
    const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/72e114745bbf4822b987489c119f858b'));
    const openEvents =  new web3.eth.Contract(Open_events_ABI, Open_events_Address);
    
    if (this._isMounted){
    this.setState({openEvents});
    this.setState({Events_Blockchain:[]});}
    const dateTime = Date.now();
    const dateNow = Math.floor(dateTime / 1000);
    
    const blockNumber = await web3.eth.getBlockNumber();
    if (this._isMounted){
    this.setState({blocks:blockNumber - 50000});
    this.setState({latestblocks:blockNumber});
    this.setState({Events_Blockchain:[]});}
  
    openEvents.getPastEvents("CreatedEvent",{fromBlock: this.state.blocks, toBlock:'latest'})
    .then(events=>{
    this.setState({loading:true})
    var newest = events.filter((activeEvents)=>activeEvents.returnValues.time >=(dateNow));
    var newsort= newest.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
    if (this._isMounted){
    this.setState({Events_Blockchain:newsort,check:newsort});
    this.setState({loading:false})
    this.setState({active_length:this.state.Events_Blockchain.length});   
  
  }
     
    }).catch((err)=>console.error(err))

    openEvents.events.CreatedEvent({fromBlock: this.state.latestblocks, toBlock:'latest'})
    .on('data', (log) => {
    this.setState({loading:true});
   
    this.setState({Events_Blockchain:[...this.state.Events_Blockchain,log]});
    var newest = this.state.Events_Blockchain
    var newsort= newest.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
    if (this._isMounted){
    
    
    //this.setState({incoming:false});
    this.setState({Events_Blockchain:newsort});
    this.setState({active_length:this.state.Events_Blockchain.length})}
    this.setState({loading:false});
    console.log('state',this.state.loading)
    console.log('state',this.state.Events_Blockchain)
    console.log('state',this.state.active_length)
    })
  }

  //Sort By Name
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

  //Sort By Date(Newest/Oldest)
  toggleSortDate=(e)=>{
    let {value} = e.target
    this.setState({value},()=>{
    const{Events_Blockchain}=this.state
    const{ended}=Events_Blockchain
    var newPolls = ended
   
     if(this.state.isOldestFirst){
        newPolls = Events_Blockchain.concat().sort((a,b)=> b.returnValues.eventId - a.returnValues.eventId)
        } 
    else {
        newPolls = Events_Blockchain.concat().sort((a,b)=> a.returnValues.eventId - b.returnValues.eventId)
      }
    
      this.setState({
      isOldestFirst: !this.state.isOldestFirst,
      Events_Blockchain:newPolls  
      });
    })}
  

	render()
  {
		let body = <Loading />;

		if (typeof this.props.contracts['OpenEvents'].getEventsCount[this.eventCount] !== 'undefined' && this.state.active_length !== 'undefined') {
      //let count = Number(this.props.contracts['OpenEvents'].getEventsCount[this.eventCount].value);
      let count = this.state.active_length
			if (count === 0) {
				body = <p className="text-center not-found"><span role="img" aria-label="thinking">🤔</span>&nbsp;No events found. <a href="/createevent">Try creating one.</a></p>;
			} else {
				let currentPage = Number(this.props.match.params.page);
				if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

				let end = currentPage * this.perPage;
				let start = end - this.perPage;
				if (end > count) end = count;
				let pages = Math.ceil(count / this.perPage);

        let events_list = [];
        let events = [];

        this.state.Events_Blockchain.map((value)=>events_list.push(<Event key={value.returnValues.eventId} id={value.returnValues.eventId} ipfs={value.returnValues.ipfs}/>))
          
        for (let i = start; i < end; i++) {
        events.push(events_list[i])
        }

        //events_list.reverse();
        
				let pagination = '';
				if (pages > 1) {
					let links = [];

					for (let i = 1; i <= pages; i++) {
						let active = i === currentPage ? 'active' : '';
						links.push(
							<li className={"page-item " + active} key={i}>
								<Link to={"/findevents/" + i} className="page-link">{i}</Link>
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
							{events}
						</div>
						{pagination}
					</div>
				;
			}
		}

		return(
      <React.Fragment>
      <Carousel className="retract-page-inner-wrapper">
          <Carousel.Item className="slide1">
            <img className="d-block w-100" src="/images/slides/slide1.png" alt="First slide" />
            <Carousel.Caption>
              <h3>Check out a Concert</h3>
              <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
              <button className="btn btn-dark"><i className="fas fa-ticket-alt"></i> Find Events</button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className="slide2">
          <img className="d-block w-100" src="/images/slides/slide2.png" alt="First slide" />
            <Carousel.Caption>
              <h3>Support a Local Charity</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <button className="btn btn-dark"><i className="fas fa-ticket-alt"></i> Find Events</button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className="slide3">
          <img className="d-block w-100" src="/images/slides/slide3.png" alt="First slide" />
            <Carousel.Caption>
              <h3>Attend an Exclusive Party</h3>
              <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
              <button className="btn btn-dark"><i className="fas fa-ticket-alt"></i> Find Events</button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className="slide4">
          <img className="d-block w-100" src="/images/slides/slide4.png" alt="First slide" />
            <Carousel.Caption>
              <h3>Play a New Sport</h3>
              <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
              <button className="btn btn-dark"><i className="fas fa-ticket-alt"></i> Find Events</button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className="slide5">
          <img className="d-block w-100" src="/images/slides/slide5.png" alt="First slide" />
            <Carousel.Caption>
              <h3>Create Your Own and Sell Tickets</h3>
              <p>Create your own event, it takes only a minute.</p>
              <button className="btn btn-dark"><i className="fas fa-ticket-alt"></i> Create Event</button>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>

			<div className="retract-page-inner-wrapper-alternative">

      <br/><br />

      <div className="input-group input-group-lg">
        <div className="input-group-prepend ">
          <span className="input-group-text search-icon" id="inputGroup-sizing-lg"><i className="fa fa-search"></i>&nbsp;Search </span>
        </div> 
        <input type="text" value={this.state.value} onChange={this.updateSearch.bind(this)} className="form-control2 col-md-10" aria-label="Large" aria-describedby="inputGroup-sizing-sm" />
      </div>
      <br /><br />
      
      <div>
        <div className="row">
         <h2 className="col-md-10"><i className="fa fa-calendar-alt"></i> Recent Events</h2> <button className="btn sort_button col-md-2" value={this.state.value} onClick={this.toggleSortDate} onChange={this.toggleSortDate.bind(this)}>{this.state.isOldestFirst ?'Sort:Oldest':'Sort:Newest'}</button>
        </div>

        <hr/>
          {body}
      </div>

      <br /><br />

  
     

      {/*
      <h2><i className="fa fa-calendar-alt"></i> Browse Events By</h2>
      <hr />
        <div className="row user-list mt-4">
          {eventCTAsJson.map(eventCTA => (
            <div className="col-lg-4 pb-4 d-flex align-items-stretch" key={eventCTA.slug}>
              <div className="topic" style={{ backgroundImage: "url(/images/cta"+eventCTA.image+")"}} onClick={() => {this.ctasClick(eventCTA.slug)}}>
              <div className="topic-caption"><h3>{eventCTA.name}</h3><button className="btn">View Events</button></div>
              </div>
            </div>
          ))}
          <button className="btn read-more" onClick={() => {this.readMoreClick("/findevents/1")}}>All Events</button>
        </div>
        <br /><br />
        */}

      <h2><i className="fa fa-calendar-alt"></i> Popular Topics</h2>
        <hr/>
          <div className="row user-list mt-4">
          {
            topicsJson && topicsJson
              .filter(topic => topic.popular === "true")
              .map((topic, index) => {
                return (
                  <div className="col-lg-4 pb-4 d-flex align-items-stretch" key={topic.slug}>
                    <div className="topic" style={{ backgroundImage: "url(/images/topics/" + topic.image +")"}} onClick={() => {this.topicClick(topic.slug)}}>
                    <div className="topic-caption"><h3>{topic.name}</h3><button className="sort_button">View Topic</button></div>
                    </div>
                  </div>
                );
              })
          }

          <button className="btn read-more" onClick={() => {this.readMoreClick("/topics")}}>All Topics</button>
          </div>
        






    </div>

    </React.Fragment>
		);
  }
  
  componentDidMount() {
    this._isMounted = true;
		this.loadBlockchain();
	}
}

FindEvents.contextTypes =
{
    drizzle: PropTypes.object
}

const mapStateToProps = state =>
{
    return {
		contracts: state.contracts,
		accounts: state.accounts
    };
};

const AppContainer = drizzleConnect(FindEvents, mapStateToProps);
export default AppContainer;