import React from 'react';
import hotel1 from '../1_hotel.png';
import hotel2 from '../2_hotel.png';
import hotel3 from '../3_hotel.png';
import '../App.css';
import { Col,Card , Avatar} from 'antd';
const { Meta } = Card;


const DealsCard = ({deal}) =>{
  return (
    <Col span={5} >
    <h3 className="discountTitle">{deal.discount.title.toUpperCase()}</h3>

    <Card
   hoverable
   cover={<img alt="example"   src={deal.photo != null ? deal.photo : "https://restaurant.michelin.fr/sites/mtpb2c_fr/themes/mtpb2c/custom/michelin/img/defaultImage_big.jpg" } />}
 >

     <Meta
       title={deal.name}
       description={deal.address.street+", " + deal.address.town.toUpperCase()}
       avatar={<Avatar src={ deal.stars === 1 ? hotel1 : deal.stars === 2 ? hotel2 : hotel3} style={{width:50,height:50}} shape="square" />}
       />

    <p className="exclu">{deal.discount.exclusions}</p>

   </Card>
   </Col>
  );
}

export default DealsCard;
