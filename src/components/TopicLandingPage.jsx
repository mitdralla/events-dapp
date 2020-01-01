import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel'

import Loading from './Loading';
import Event from './Event';

import slidesJson from '../config/slides.json';
import topicsJson from '../config/topics.json';


class TopicLandingPage extends Component {
  constructor(props, context) {
      super(props);
	    this.contracts = context.drizzle.contracts;
	    this.eventCount = this.contracts['OpenEvents'].methods.getEventsCount.cacheCall();
	    this.perPage = 6;
      this.topicClick = this.topicClick.bind(this);
	}

  topicClick(slug) {
    this.props.history.push("/topic/"+slug);
  }

	render() {
		let body = <Loading />;

		if (typeof this.props.contracts['OpenEvents'].getEventsCount[this.eventCount] !== 'undefined') {
			let count = Number(this.props.contracts['OpenEvents'].getEventsCount[this.eventCount].value);
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

				for (let i = start; i < end; i++) {
					events_list.push(<Event key={i} id={i} />);
				}

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

      <br /><br />

      <div>
          <h2><i className="fa fa-calendar-alt"></i> Events With Topic</h2>
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
              <div className="topic" style={{ backgroundImage: "url(/images/topics/" + topic.image +")"}} onClick={() => {{this.topicClick(topic.slug)}}}>
              <div className="topic-caption"><h3>{topic.name}</h3><button className="btn">View Topic</button></div>
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

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		accounts: state.accounts
    };
};

const AppContainer = drizzleConnect(TopicLandingPage, mapStateToProps);
export default AppContainer;
