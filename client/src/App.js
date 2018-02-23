import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Row, Col, Card, Avatar} from 'antd';
import Loading from './shared/loading';
import RestaurantCard from './shared/loading';
import axios from 'axios';


const API = 'http://192.168.0.11:8081/'

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      loading: true, restaurants: [],error : null
    }

  }

  handleLoadingState = (loading) =>{
    this.setState({loading:loading});
  }

  // getRestaurants = () =>{
  //   console.log("ee")
  //   axios.get('http://localhost:8081/restaurants')
  //   .then(function (response) {
  //
  //     console.log(response);
  //     this.handleLoadingState(true);
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //   });
  // }

componentDidMount() {
  fetch(API, {mode: 'no-cors'}).then(res =>{
    if (res.ok) {
         return res.json();
       } else {
         throw new Error('Something went wrong ...');
       }
  }).then( data =>this.setState({
     loading:false, restaurants:data, error: null
  })).catch(err => this.setState({ loading: false, restaurants:[] , error: err }));
}

  render() {

    const { loading, restaurants, error} = this.state;

    return (
      <div className="App">
        <header className="header">
          <Row>
            <i className="material_icons">star</i>
            <h1>Starred Restaurants with great discount </h1>

          </Row>
        </header>

        <section className="content">
          <Row>
              <RestaurantCard />


          </Row>

        </section>
        <footer className="footer">
          Corentin LEMAITRE 2018
        </footer>
      </div>
    );
  }
}

export default App;
