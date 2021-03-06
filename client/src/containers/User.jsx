import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Button from 'material-ui/Button';

import TabContainer from './TabContainer';
import UserActivities from './UserActivities';
import UserStudyPlan from './UserStudyPlan';
import UserGoals from './UserGoals';

import {
  clearProgressData,
  fetchUserInfo,
  fetchActivities,
  fetchProgressData,
  clearActivities,
  clearUserPage,
} from '../actions';

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing.unit * 3,
    marginBottom: '0px',
    backgroundColor: theme.palette.background.paper,
    width: '70%',
    justifyContent: 'center',
  },
});

class User extends Component {
  state = {
    user: null,
    isAuthenticated: false,
    value: 0,
    canShowBtn: false,
  };

  checkAuth = () => {
    if (this.props.match.params.userName === this.props.userName) {
      this.setState(prevState => {
        if (!prevState.isAuthenticated) return { isAuthenticated: true };
      });
      return true;
    }

    this.setState(prevState => {
      if (prevState.isAuthenticated) return { isAuthenticated: false };
    });
    return false;
  };

  async componentDidMount() {
    const {
      clearProgressData,
      fetchUserInfo,
      fetchActivities,
      fetchProgressData,
      history,
      match: { params },
    } = this.props;

    clearProgressData();

    try {
      await fetchUserInfo(params.userName);
      const { userPage } = this.props;

      fetchActivities(userPage._id);
      await fetchProgressData(userPage._id);
    } catch (err) {
      return history.push(`/404/${params.userName}`);
    }
    this.setState({ ...this.state, user: params.userName, canShowBtn: true });
  }

  componentWillUnmount() {
    this.props.clearActivities();
    this.props.clearUserPage();
  }

  componentDidUpdate() {
    this.checkAuth();
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes, userPage, activities } = this.props;
    const { user, value, isAuthenticated, canShowBtn } = this.state;

    return (
      <div>
        <h2>{user}</h2>

        {userPage.goal &&
          isAuthenticated && (
            <Link
              to={{
                pathname: '/progress/edit',
                state: {
                  currentCourse: userPage.currentCourse,
                  goal: userPage.goal,
                  studyPlan: userPage.studyPlan,
                },
              }}
              style={{ textDecoration: 'none' }}
            >
              <Button className={classes.button} color="primary">
                Edit Goals, Current Course & Study Plan
              </Button>
            </Link>
          )}
        {canShowBtn &&
          !userPage.goal &&
          isAuthenticated && (
            <Link to="/progress/new" style={{ textDecoration: 'none' }}>
              <Button className={classes.button} color="primary">
                Add Goals, Current Course & Study Plan
              </Button>
            </Link>
          )}

        <UserGoals
          goal={userPage.goal}
          points={userPage.totalPoints}
          currentCourse={userPage.currentCourse}
        />

        <div className="user__tabs">
          <div className={classes.root}>
            <AppBar position="static">
              <Tabs value={value} onChange={this.handleChange} centered>
                <Tab label="Activities" />
                <Tab label="Study Plan" />
              </Tabs>
            </AppBar>
            {value === 0 && (
              <TabContainer>
                {activities && (
                  <UserActivities
                    activities={activities}
                    isAuthenticated={isAuthenticated}
                  />
                )}
              </TabContainer>
            )}
            {value === 1 && (
              <TabContainer>
                <UserStudyPlan studyPlan={userPage.studyPlan} />
              </TabContainer>
            )}
          </div>
        </div>
      </div>
    );
  }
}

User.propTypes = {
  classes: PropTypes.object.isRequired,
  clearProgressData: PropTypes.func.isRequired,
  fetchUserInfo: PropTypes.func.isRequired,
  fetchActivities: PropTypes.func.isRequired,
  fetchProgressData: PropTypes.func.isRequired,
  clearUserPage: PropTypes.func.isRequired,
  userPage: PropTypes.object,
  userName: PropTypes.string,
  activities: PropTypes.array,
};

const mapStateToProps = state => ({
  userName: state.authReducer.userName,
  activities: state.activities,
  userPage: state.userPage,
});

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      clearProgressData,
      fetchUserInfo,
      fetchActivities,
      fetchProgressData,
      clearActivities,
      clearUserPage,
    },
    dispatch
  );
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(User);
