import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Layout, Row, Col, Card, Avatar} from 'antd';
import Loading from './shared/loading';
import RestaurantCard from './shared/restaurantCard';
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
            <Row gutter={48} type="flex" justify="space-around" align="center">

            {restaurants.map(res =>
                <RestaurantCard restaurant={res} />
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
