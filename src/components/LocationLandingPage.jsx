import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Loading from './Loading';
import Event from './Event';

import locationsJson from '../config/states.json';


class LocationLandingPage extends Component
{
  constructor(props, context)
  {
      super(props);
	    this.contracts = context.drizzle.contracts;
	    this.eventCount = this.contracts['OpenEvents'].methods.getEventsCount.cacheCall();
	    this.perPage = 6;
      this.locationClick = this.locationClick.bind(this);;
      this.theLocation = this.getLocationData();
      this.locationBackground = this.theLocation['image'];
	}

  componentDidUpdate()
  {
    //this.theTopic = this.getTopicData();
	}

	componentDidMount()
  {
    //this.theTopic = this.getTopicData();
	}

	componentWillUnmount()
  {

	}

  locationClick(slug)
  {
    this.props.history.push("/location/"+slug);
    this.theLocation = this.getLocationData();

    window.scrollTo(0, 80);
  }

  getLastURLSegment()
  {
    console.log(this.props.history.location.pathname);
    let currentRoute = this.props.history.location.pathname;
    let lastSegment = currentRoute.substr(currentRoute.lastIndexOf('/') + 1);

    return lastSegment;
  }

  getLocationData() {
    let locationSlug = this.getLastURLSegment();

    let theLocation = locationsJson.filter(function (location) {
      return location.slug == locationSlug;
    });

    return theLocation[0];
  }

	render()
  {
		let body = <Loading />;
    const location = this.theLocation;

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
      <div className="retract-page-inner-wrapper">
        <div className="topic-hero-wrapper">
          <img src={'/images/states/'+this.theLocation['image']} alt={location.name} />
        </div>
      </div>

			<div className="retract-page-inner-wrapper-alternative">

      <br /><br />

      <div>
          <h2><i className="fa fa-calendar-alt"></i> Events In <strong>{location.name}</strong></h2>
          <hr />
          {body}
      </div>

      <br /><br />

      <div className="topics-wrapper">
      <h2><i className="fa fa-calendar-alt"></i> More Locations</h2>
      <hr />
        <div className="row user-list mt-4">
          {locationsJson.map(location => (
            <div className="col-lg-4 pb-4 d-flex align-items-stretch" key={location.slug}>
              <div className="topic" style={{ backgroundImage: "url(/images/states/" + location.image +")"}} onClick={() => {this.locationClick(location.slug)}}>

              <div className="topic-caption"><h3>{location.name}</h3><button className="btn sort_button">View Location</button></div>

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

LocationLandingPage.contextTypes =
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

const AppContainer = drizzleConnect(LocationLandingPage, mapStateToProps);
export default AppContainer;
