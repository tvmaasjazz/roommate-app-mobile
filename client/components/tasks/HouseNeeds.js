import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import {
  FormInput,
  FormLabel,
  Button,
} from 'react-native-elements';
import { StackNavigator } from 'react-navigation';

import axios from '../../lib/customAxios';
import HouseNavBack from '../HouseNavBack';

import HouseNeedList from './HouseNeedList';


const styles = StyleSheet.create({
  needsContainer: {
    flex: 1,
  },
  needsListContainer: {
    flex: 6,
  },
  addNeedContainer: {
    flex: 1,
    margin: 5,
    flexDirection: 'row',
  },
  submitFormColumn: {
    flex: 1,
    flexDirection: 'column',
  },
});

class HouseNeedsView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      houseNeeds: [],
      addingNeed: false,
      text: '',
    };

    this.getNeeds = this.getNeeds.bind(this);
    this.postNeed = this.postNeed.bind(this);
    this.claimNeed = this.claimNeed.bind(this);
    this.completeNeed = this.completeNeed.bind(this);
  }
  componentWillMount() {
    this.getNeeds();
  }
  getNeeds() {
    axios.get(`/api/tasks/${this.props.houseId}`)
      .then((tasks) => {
        const onlyHouseNeeds = tasks.data.filter(need => need.type === 'houseneed');
        onlyHouseNeeds.forEach((need) => {
          this.props.roomies.forEach((roomie) => {
            if (roomie.id === need.posterId) {
              need.poster = roomie.firstName;
            }
            if (roomie.id === need.claimerId) {
              need.claimer = roomie.firstName;
            }
          });
        });
        this.setState({ houseNeeds: onlyHouseNeeds });
      })
      .catch((err) => {
        console.log('Error retrieving tasks', err);
      });
  }
  postNeed() {
    axios.post('api/tasks/', {
      houseId: this.props.houseId,
      posterId: this.props.userId,
      text: this.state.text,
      type: 'houseneed',
    })
      .then(() => {
        this.getNeeds();
        this.setState({ addingneed: !this.state.addingneed });
      })
      .catch(err => console.log('Error posting task', err));
  }
  claimNeed(taskId) {
    axios.put(`api/tasks/${taskId}`, {
      claimerId: this.props.userId,
    })
      .then(() => this.getNeeds())
      .catch(err => console.log('Error claiming task', err));
  }
  completeNeed(taskId) {
    axios.delete(`api/tasks/${taskId}`)
      .then(() => this.getNeeds())
      .catch(err => console.log('Error deleting task', err));
  }
  render() {
    return (
      <View style={styles.needsContainer}>
        <View style={styles.needsListContainer}>
          <HouseNeedList
            houseNeeds={this.state.houseNeeds}
            claimNeed={this.claimNeed}
            firstName={this.props.firstName}
            userId={this.props.userId}
            completeNeed={this.completeNeed}
          />
        </View>
        <View style={styles.addNeedContainer}>
          <View style={styles.submitFormColumn}>
            <FormLabel style={styles.roomieLabel}>Need:</FormLabel>
          </View>
          <View style={styles.submitFormColumn}>
            <FormInput
              containerStyle={styles.input}
              onChangeText={task => this.setState({ text: task })}
            />
          </View>
          <View style={styles.submitFormColumn}>
            <Button
              title="Submit"
              onPress={() => {
                this.postNeed();
                this.setState({ addingNeed: !this.state.addingNeed });
              }}
            />
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (store) => {
  return {
    username: store.user.username,
    roomies: store.house.roomies,
    houseId: store.user.houseId,
    userId: store.user.id,
  };
};

const HouseNeedsViewRedux = connect(mapStateToProps, null)(HouseNeedsView);


const HouseNeeds = StackNavigator({
  HouseNeeds: {
    screen: HouseNeedsViewRedux,
    navigationOptions: ({ navigation }) => ({
      title: 'HouseNeeds',
      headerLeft: <HouseNavBack navigation={navigation} />,
    }),
  },
});

export default HouseNeeds;
