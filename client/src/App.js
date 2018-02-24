import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Layout, Row, Col, Card, Avatar} from 'antd';
import Loading from './shared/loading';
import RestaurantCard from './shared/restaurantCard';
import axios from 'axios';
const { Header, Footer, Sider, Content } = Layout;

const DemoBox = props => <p className={`height-${props.value}`}>{props.children}</p>;
const API = 'http://localhost:8081/'

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      loading: true, restaurants: [], error : null
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
  fetch(API).then(res =>{
    if (res.ok) {
      console.log("The result is ok ")
         return res.json();
       } else {
         console.log("OH FUCK")
         throw new Error('Something went wrong ...');
       }
  }).then( data =>this.setState({
     loading:false, restaurants:data, error: null
  })).catch(err => this.setState({ loading: false, restaurants:[] , error: err }));
}

  render() {

    const { loading, restaurants, error} = this.state;

    return (
      <Layout className="App">
        <Header className="header">
          <Row>
            <i className="material_icons">star</i>
            <h1>Starred Restaurants with great discount </h1>

          </Row>
        </Header>
        <Layout>
          <Sider>Sider</Sider>
          <Content className="content">
            <Row gutter={48} type="flex" justify="space-around">

            {restaurants.map(res =>
                <RestaurantCard name="eee" />
              )}

            </Row>
          </Content>
        </Layout>
        <Footer className="footer">
          Corentin LEMAITRE 2018
        </Footer>
        </Layout>
    );
  }
}

export default App;
