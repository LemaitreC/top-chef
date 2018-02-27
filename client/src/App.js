import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Layout, Row, Col, Card,  Radio, Input, Avatar,Switch, Icon} from 'antd';
import Loading from './shared/loading';
import RestaurantCard from './shared/restaurantCard';
const { Header, Footer, Sider, Content } = Layout;
const RadioGroup = Radio.Group;

const API = "http://localhost:8081/"

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      loading: true,
      restaurants: [],
      error : null,
        stars : 0 ,
        is_menu : false,
        is_brunch : false,
        is_special_offer: false,
        api:API + "restaurantDiscount/all/0"
    }
  }

  handleLoadingState = (loading) =>{
    this.setState({loading:loading});
  }

componentDidMount() {
  fetch(this.state.api).then(res =>{
    if (res.ok) {
         return res.json();
       } else {
         throw new Error('Something went wrong ...');
       }
  }).then( data => this.setState({
     restaurants:data
  }, this.handleLoadingState(false))).catch(err => this.setState({ restaurants:[] , error: err }));
}

onStarsChange = (e) => {
  this.setState({
    stars: e.target.value,
  });
  this.setState({api:setAPIurl(e.target.value, this.state.is_menu, this.state.is_brunch, this.state.is_special_offer)},function () {
  this.componentDidMount()
})
}

checkSpecialOffer = (bool) =>{
  this.setState({
    is_special_offer: bool,
  });
  this.setState({api:  setAPIurl(this.state.stars, this.state.is_menu, this.state.is_brunch, bool)},function () {
  this.componentDidMount()
})
}

checkBrunch = (bool) =>{
  this.setState({
    is_brunch: bool,
  });
  this.setState({api:  setAPIurl(this.state.stars, this.state.is_menu, bool, this.state.is_special_offer)},function () {
  this.componentDidMount()
})
}

checkMenu = (bool) =>{
  this.setState({
    is_menu: bool,
  });
  this.setState({api:setAPIurl(this.state.stars, bool, this.state.is_brunch, this.state.is_special_offer)},function () {
  this.componentDidMount()
})
}

  render() {
    const radioStyle = {
          display: 'block',
          height: '30px',
          lineHeight: '30px',
          color:'white'
        };
    const { loading, restaurants, error } = this.state;

    return (
      <Layout className="App">
        <Header className="header">
          <Row>
            <Icon type="star" className="icon" size="large"/>
            <h1>Starred Restaurants with great discount </h1>

          </Row>
        </Header>
        <Layout>
          <Sider>
            <h3 className="filter">Filters</h3>
            <RadioGroup onChange={this.onStarsChange} value={this.state.stars}>
              <Radio style={radioStyle} value={0}>All Starred</Radio>
              <Radio style={radioStyle} value={1}>1 Starred</Radio>
              <Radio style={radioStyle} value={2}>2 Starred</Radio>
              <Radio style={radioStyle} value={3}>3 Starred</Radio>
            </RadioGroup>

            <div className="check">
              <h4>Discount Type</h4>
              <div>
                <p>Special Offer : </p>
                <Switch checkedChildren={<Icon type="check" />} onChange={this.checkSpecialOffer} unCheckedChildren={<Icon type="cross" />}  />
              </div>
              <div>
                <p>Menu : </p>
                <Switch checkedChildren={<Icon type="check" />} onChange={this.checkMenu} unCheckedChildren={<Icon type="cross" />}  />
              </div>
              <div>
                <p>Brunch : </p>
                <Switch checkedChildren={<Icon type="check" />} onChange={this.checkBrunch} unCheckedChildren={<Icon type="cross" />}  />
              </div>
            </div>
          </Sider>
          <Content className="content">
            {this.state.loading ? <Loading message="Working on it ..."/> : <div></div>}

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

function setAPIurl(stars, is_menu, is_brunch, is_special_offer){
  let filter =""
    filter = is_menu ? "menu" : "_"
    filter+= is_brunch ? "brunch": "_"
    filter +=  is_special_offer ? "special_offer" : "_"

  console.log(filter)
  return API + "restaurantDiscount/"+filter+"/"+stars;
}


export default App;
