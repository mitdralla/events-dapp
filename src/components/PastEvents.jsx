import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel'

// Import dApp Components
import Loading from './Loading';
import PhoenixDAOLoader from './PhoenixDAOLoader';

import Event from './Event';
import Web3 from 'web3';
import {Open_events_ABI, Open_events_Address} from '../config/OpenEvents';

// TODO: Make slides dynamic: import slidesJson from '../config/slides.json';
import topicsJson from '../config/topics.json';


class PastEvents extends Component
{
  constructor(props, context)
  {
      super(props);
      this.state = {
        openEvents : '',
        blocks : 5000000,
        latestblocks : '',
        loading : true,
        past_length : '',
        isOldestFirst : false,
        past_events : [],
        past_events_copy : []

      };
	    this.contracts = context.drizzle.contracts;
	    this.eventCount = this.contracts['OpenEvents'].methods.getEventsCount.cacheCall();
	    this.perPage = 6;
      this.topicClick = this.topicClick.bind(this);
	}

  topicClick(slug)
  {
    this.props.history.push("/topic/"+slug+"/"+1);
    window.scrollTo(0, 80);
  }

  readMoreClick(location)
  {
    this.props.history.push(location);
  }

  ctasClick(slug)
  {
    this.props.history.push("/"+slug);
    window.scrollTo(0, 0);
  }

  caruselClick(location)
  {
    this.props.history.push(location);
    window.scrollTo(0, 80);
  }

  //Load Blockchain Data
  async loadBlockchain(){

    const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/72e114745bbf4822b987489c119f858b'));
    const openEvents =  new web3.eth.Contract(Open_events_ABI, Open_events_Address);

    if (this._isMounted){
    this.setState({openEvents});
    this.setState({past_events:[]});}
    const dateTime = Date.now();
    const dateNow = Math.floor(dateTime / 1000);

    const blockNumber = await web3.eth.getBlockNumber();
    if (this._isMounted){
    this.setState({blocks:blockNumber - 50000});
    this.setState({latestblocks:blockNumber});
    this.setState({past_events:[]});}

    //Get Finished Events
    openEvents.getPastEvents("CreatedEvent",{fromBlock: 5000000, toBlock:'latest'})
    .then(events=>{
    if (this._isMounted){
    this.setState({loading:true})

    //var newest = events.filter((activeEvents)=>activeEvents.returnValues.time <=(dateNow));
    var newsort= events.concat().sort((a,b)=>
    b.blockNumber- a.blockNumber).filter((pastEvents=>
    pastEvents.returnValues.time <=(dateNow)));

    this.setState({past_events:newsort,past_events_copy:newsort});
    this.setState({past_length:this.state.past_events.length})
    this.setState({loading:false});
    }

    }).catch((err)=>console.error(err))

  }

  //Search Past Events By Name
  updateSearch=(e)=>{
    let {value} = e.target
    this.setState({value},()=>{
    if(this.state.value !== ""){
    var filteredEvents = this.state.past_events_copy;
    filteredEvents = filteredEvents.filter((events)=>{
    return events.returnValues.name.toLowerCase().search(this.state.value.toLowerCase()) !==-1;
      })
    }
    else{
      filteredEvents = this.state.past_events_copy
    }

    this.setState({
      past_events:filteredEvents,
      past_length:filteredEvents.length})
      this.props.history.push("/pastevents/"+1);
    })
  }

  //Sort Past Events By Newest/Oldest
  toggleSortDate=(e)=>{
    let {value} = e.target
    this.setState({value},()=>{
    const{past_events}=this.state
    const{ended}=past_events
    var newPolls = ended

    if(this.state.isOldestFirst){
        newPolls = past_events.concat().sort((a,b)=> b.returnValues.eventId - a.returnValues.eventId)
      }
    else {
        newPolls = past_events.concat().sort((a,b)=> a.returnValues.eventId - b.returnValues.eventId)
    }

    this.setState({
    isOldestFirst: !this.state.isOldestFirst,
    past_events:newPolls
      });
    })
  }

	render()
  {
		let body = <PhoenixDAOLoader />;

		if (typeof this.props.contracts['OpenEvents'].getEventsCount[this.eventCount] !== 'undefined' && this.state.active_length !== 'undefined' && this.state.loading !==true) {
      //let count = Number(this.props.contracts['OpenEvents'].getEventsCount[this.eventCount].value);
      let count = this.state.past_length
      if(this.state.loading){
        body = <PhoenixDAOLoader/>
      }
			else if (count === 0 && !this.state.loading) {
				body = <p className="text-center not-found"><span role="img" aria-label="thinking">🤔</span>&nbsp;No events found. <a href="/createevent">Try creating one.</a></p>;
			} else {
				let currentPage = Number(this.props.match.params.page);
				if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

				let end = currentPage * this.perPage;
				let start = end - this.perPage;
				if (end > count) end = count;
				let pages = Math.ceil(count / this.perPage);

        let events_list = [];
        for (let i = start; i < end; i++) {
          events_list.push(<Event
            key={this.state.past_events[i].returnValues.eventId}
            id={this.state.past_events[i].returnValues.eventId}
            ipfs={this.state.past_events[i].returnValues.ipfs} />);
				}

        //events_list.reverse();

				let pagination = '';
				if (pages > 1) {
					let links = [];

          if (pages > 5 && currentPage >= 3){
            for (let i = currentPage - 2; i <= currentPage + 2 && i<=pages; i++) {
                 let active = i === currentPage ? 'active' : '';
               links.push(
                <li className={"page-item " + active} key={i}>
                  <Link to={"/pastevents/" + i} className="page-link">{i}</Link>
                </li>
              );
            }
          }

          else if (pages > 5 && currentPage < 3){
            for (let i = 1 ; i <= 5 && i<=pages; i++) {
              let active = i === currentPage ? 'active' : '';
              links.push(
                <li className={"page-item " + active} key={i}>
                  <Link to={"/pastevents/" + i} className="page-link">{i}</Link>
                </li>
              );
            }
          }
					else{
            for (let i = 1; i <= pages; i++) {
						let active = i === currentPage ? 'active' : '';
						links.push(
							<li className={"page-item " + active} key={i}>
								<Link to={"/pastevents/" + i} className="page-link">{i}</Link>
							</li>
						);
					}
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
      <Carousel className="retract-page-inner-wrapper">
          <Carousel.Item className="slide1">
            <img className="d-block w-100" src="/images/topics/music.jpg" alt="First slide" />
            <Carousel.Caption>
              <h3>Check out a Concert</h3>
              <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
              <button className="btn btn-dark" onClick={() => {this.caruselClick("/topic/music/1")}}><i className="fas fa-ticket-alt"></i> Find Events</button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className="slide2">
          <img className="d-block w-100" src="/images/topics/charity-and-causes.jpg" alt="First slide" />
            <Carousel.Caption>
              <h3>Support a Local Charity</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <button className="btn btn-dark" onClick={() => {this.caruselClick("/topic/charity-and-causes/1")}}><i className="fas fa-ticket-alt"></i> Find Events</button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className="slide3">
          <img className="d-block w-100" src="/images/topics/parties.jpg" alt="First slide" />
            <Carousel.Caption>
              <h3>Attend an Exclusive Party</h3>
              <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
              <button className="btn btn-dark" onClick={() => {this.caruselClick("/topic/parties/1")}}><i className="fas fa-ticket-alt"></i> Find Events</button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className="slide4">
          <img className="d-block w-100" src="/images/topics/sports-and-fitness.jpg" alt="First slide" />
            <Carousel.Caption>
              <h3>Play a New Sport</h3>
              <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
              <button className="btn btn-dark" onClick={() => {this.caruselClick("/topic/sports-and-fitness/1")}}><i className="fas fa-ticket-alt"></i> Find Events</button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className="slide5">
          <img className="d-block w-100" src="/images/slides/slide5.png" alt="First slide" />
            <Carousel.Caption>
              <h3>Create and Sell Tickets</h3>
              <p>Create your own event, it takes only a minute.</p>
              <button className="btn btn-dark" onClick={() => {this.caruselClick("/createevent")}}><i className="fas fa-ticket-alt"></i> Create Event</button>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>

			<div className="retract-page-inner-wrapper-alternative dash">

      <br /><br />

      <div className="input-group input-group-lg">
        <div className="input-group-prepend">
          <span className="input-group-text search-icon" id="inputGroup-sizing-lg"><i className="fa fa-search"></i>&nbsp;Search </span>
        </div>
        <input type="text" value={this.state.value} onChange={this.updateSearch.bind(this)} className="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm" />
      </div>
      <br /><br />

      <div>
        <div className="row row_mobile">
        <h2 className="col-lg-10 col-md-9 col-sm-8"><i className="fa fa-calendar-alt"></i> Past Events</h2>
        <button className="btn sort_button col-lg-2 col-md-3 col-sm-3" value={this.state.value} onClick={this.toggleSortDate} onChange={this.toggleSortDate.bind(this)}>{this.state.isOldestFirst ?'Sort: Oldest':'Sort: Newest'}</button>
        </div>
          <hr />
          {body}
      </div>

      <br /><br />

      <div className="topics-wrapper">

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
        <hr />
          <div className="row user-list mt-4">
          {
            topicsJson && topicsJson
              .filter(topic => topic.popular === "true")
              .map((topic, index) => {
                return (
                  <div className="col-lg-4 pb-4 d-flex align-items-stretch" key={topic.slug}>
                    <div className="topic" style={{ backgroundImage: "url(/images/topics/" + topic.image +")"}} onClick={() => {this.topicClick(topic.slug)}}>
                    <div className="topic-caption"><h3>{topic.name}</h3><button className="btn">View Topic</button></div>
                    </div>
                  </div>
                );
              })
          }

          <button className="btn read-more" onClick={() => {this.readMoreClick("/topics")}}>All Topics</button>
          </div>
        </div>

      </div>





    </React.Fragment>
		);
  }

  componentDidMount() {
    this._isMounted = true;
	  this.loadBlockchain();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
}

PastEvents.contextTypes =
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

const AppContainer = drizzleConnect(PastEvents, mapStateToProps);
export default AppContainer;
