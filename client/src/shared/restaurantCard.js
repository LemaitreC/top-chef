import React, { Component } from 'react';
import hotel1 from '../1_hotel.png';
import hotel2 from '../2_hotel.png';
import hotel3 from '../3_hotel.png';
import '../App.css';
import {Row, Col,Card , Avatar} from 'antd';
const { Meta } = Card;


const RestaurantCard = ({restaurant}) =>{
  return (
    <Col span={5} >
    {restaurant.discount[0]
      ? (<h3 className="discountTitle">{restaurant.discount[0].title.toUpperCase()}</h3>)
      : <div></div>
    }
    <Card
   hoverable
   cover={<img alt="example"   src={restaurant.photo != null ? restaurant.photo : "https://restaurant.michelin.fr/sites/mtpb2c_fr/themes/mtpb2c/custom/michelin/img/defaultImage_big.jpg" } />}
 >

     <Meta
       title={restaurant.name}
       description={restaurant.address.street+", " + restaurant.address.town.toUpperCase()}
       avatar={<Avatar src={ restaurant.stars == 1 ? hotel1 : restaurant.stars == 2 ? hotel2 : hotel3} style={{width:50,height:50}} shape="square" />}
       />

       {restaurant.discount[0]
         ? (<p className="exclu">{restaurant.discount[0].exclusions}</p>)
         : <div></div>
       }
   </Card>
   </Col>
  );
}

export default RestaurantCard;
