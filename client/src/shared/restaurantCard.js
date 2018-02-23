import React, { Component } from 'react';
import hotel1 from './1_hotel.png';
import hotel2 from './2_hotel.png';
import hotel3 from './3_hotel.png';
import './App.css';
import {Row, Col, Card, Avatar} from 'antd';
const { Meta } = Card;


const RestaurantCard = {(props)} =>{
  return {
    <Card hoverable
      style={{ width: 350 }}
      cover={<img alt="example" src="https://restaurant.michelin.fr/sites/mtpb2c_fr/files/styles/poi_detail_landscape/public/iISK-1u8sxhxOIPA.jpg" />}>
      <Meta
        title={props.name}
        description="www.instagram.com"
        avatar={<Avatar src={hotel1} size="large" shape="square" />}

      />
      <p>Lorem ipsum best vere feznf fjeznf efezjfe fefef fee </p>
    </Card>
  }
}

export default RestaurantCard;
