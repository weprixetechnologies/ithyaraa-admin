import React, { useState } from 'react'
import Layout from '../../layout'
import './users.css'
import Container from '../../components/ui/container'
import InputCustomLabelled from '../../components/ui/customLabelledField'
import LoginDataComponent from '../../components/user/logindata'
import Addresses from '../../components/user/addresses'
import OrdersUser from '../../components/user/ordersuser'
import TransactionUser from '../../components/user/transactionUser'

const ordersHistory = [
  {
    orderDetails: {
      id: 1001,
      regularPrice: 4600,
      shippingCharge: 0,
      isMakeCombo: false,
      isCombo: false,
      status: 'Shipped', discountApplied: 300,
      subtotal: 4400, // 4600 + 100 - 300
      coupons: ["WELCOME15", "FREESHIP"]
    },
    orderProducts: [
      {
        productID: "PROD-10001",
        offerName: 'Buy 1 Get 1 Free', offerID: "OFFER-201",
        categoryID: "CAT-101",
        amount: "1899",
        featuredImage: {
          imageUrl: "https://picsum.photos/id/1011/300/200",
          imageAlt: "Winter Jacket"
        },
        productName: "Winter Jacket",
        skuID: "SKU-JACK-101"
      },
      {
        productID: "PROD-10002",
        offerName: 'Buy 1 Get 1 Free', offerID: "OFFER-202",
        categoryID: "CAT-102",
        amount: "2000",
        featuredImage: {
          imageUrl: "https://picsum.photos/id/1012/300/200",
          imageAlt: "Running Sneakers"
        },
        productName: "Sneakers",
        skuID: "SKU-SHOE-202"
      }
    ]
  },
  {
    orderDetails: {
      id: 1002,
      regularPrice: 3300,
      shippingCharge: 80,
      status: 'Delivered', discountApplied: 200,
      subtotal: 3180, // 3300 + 80 - 200
      coupons: ["FESTIVE10"], isMakeCombo: false,
      isCombo: false,
    },
    orderProducts: [
      {
        productID: "PROD-10003",
        offerName: 'Buy 1 Get 1 Free', offerID: "OFFER-203",
        categoryID: "CAT-103",
        amount: "2999",
        featuredImage: {
          imageUrl: "https://picsum.photos/id/1015/300/200",
          imageAlt: "Travel Backpack"
        },
        productName: "Backpack",
        skuID: "SKU-BAG-303"
      }
    ]
  },
  {
    orderDetails: {
      id: 1003,
      regularPrice: 7250,
      shippingCharge: 120,
      status: 'Pending', discountApplied: 451,
      subtotal: 6919, // 7250 + 120 - 451
      coupons: ["SAVE20", "EXTRA5"],
      isMakeCombo: false,
      isCombo: false,
    },
    orderProducts: [
      {
        productID: "PROD-10004",
        offerName: 'Buy 1 Get 1 Free', offerID: "OFFER-204",
        categoryID: "CAT-104",
        amount: "3499",
        featuredImage: {
          imageUrl: "https://picsum.photos/id/1020/300/200",
          imageAlt: "Adjustable Laptop Stand"
        },
        productName: "Laptop Stand",
        skuID: "SKU-TECH-401"
      },
      {
        productID: "PROD-10005",
        offerName: 'Buy 1 Get 1 Free', offerID: "OFFER-205",
        categoryID: "CAT-105",
        amount: "3050",
        featuredImage: {
          imageUrl: "https://picsum.photos/id/1021/300/200",
          imageAlt: "Mechanical Keyboard"
        },
        productName: "Mechanical Keyboard",
        skuID: "SKU-TECH-402"
      }
    ]
  }
];


const badge_svgs = [
  {
    badgeId: 'top_performer',
    badgeCode: `<svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="170" height="50" rx="25" fill="#FFD700" />
      <text x="90" y="35" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#333333" text-anchor="middle">🏆 Top Performer</text>
      <path d="M90 10 L100 20 L90 30 L80 20 Z" fill="#FFA500" />
    </svg>`
  }, {
    badgeId: 'Referral_Star',
    badgeCode: `<svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="170" height="50" rx="25" fill="#4CAF50" />
      <text x="90" y="35" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">⭐ Referral Star</text>
      <path d="M90 10 L95 25 L110 25 L100 35 L105 50 L90 40 L75 50 L80 35 L70 25 L85 25 Z" fill="#FFEB3B" />
    </svg>`
  }, {
    badgeId: '100_Orders',
    badgeCode: `<svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="170" height="50" rx="25" fill="#2196F3" />
      <text x="90" y="35" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">💯 100+ Orders</text>
      <circle cx="90" cy="15" r="8" fill="#FFC107" />
    </svg>`
  }, {
    badgeId: 'Verified_Trader',
    badgeCode: `<svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="170" height="50" rx="25" fill="#607D8B" />
      <text x="90" y="35" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✅ Verified Trader</text>
      <path d="M80 15 L90 25 L100 10 L90 20 Z" fill="#8BC34A" />
    </svg>`
  }, {
    badgeId: 'early_adopter',
    badgeCode: `<svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="170" height="50" rx="25" fill="#9C27B0" />
      <text x="90" y="35" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">🚀 Early Adopter</text>
      <path d="M90 10 L95 20 L90 30 L85 20 Z" fill="#FFEB3B" />
    </svg>`
  },
  // New Badges
  {
    badgeId: '10_orders',
    badgeCode: `<svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="170" height="50" rx="25" fill="#FFC107" />
      <text x="90" y="35" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#333333" text-anchor="middle">🔟 10+ Orders</text>
      <circle cx="90" cy="15" r="8" fill="#FFEB3B" />
    </svg>`
  },
  {
    badgeId: '20_orders',
    badgeCode: `<svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="170" height="50" rx="25" fill="#FF9800" />
      <text x="90" y="35" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">2️⃣0️⃣ 20+ Orders</text>
      <circle cx="90" cy="15" r="8" fill="#FFD700" />
    </svg>`
  },
  {
    badgeId: '50_orders',
    badgeCode: `<svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="170" height="50" rx="25" fill="#FF5722" />
      <text x="90" y="35" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">5️⃣0️⃣ 50+ Orders</text>
      <circle cx="90" cy="15" r="8" fill="#FFA500" />
    </svg>`
  },
  {
    badgeId: 'century_man',
    badgeCode: `<svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="170" height="50" rx="25" fill="#673AB7" />
      <text x="90" y="35" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">💯 CenturyMan</text>
      <path d="M90 10 L100 20 L90 30 L80 20 Z" fill="#FFD700"/>
    </svg>`
  }
];

const AddUser = () => {
  const [name, setName] = useState('Ronit Sarkar')
  const [email, setEmail] = useState('rseditz57@gmail.com')
  const [verified, setVerified] = useState('')
  const [orders, setOrders] = useState(ordersHistory)
  const [transactionHistory, setTransactionHistory] = useState()
  const [ordersReturns, setOrdersReturns] = useState(ordersHistory)
  const [addresses, setAddresses] = useState([
    {
      type: 'Home',
      addressLine1: '56 Subhas Nagar',
      addressLine2: 'A.K Mukherjee Lane',
      landmark: 'Noapara',
      city: 'Kolkata',
      pincode: '182090',
      contact: '+91 74393 98783',
      state: 'New Delhi'
    },
    {
      type: 'Work',
      addressLine1: '56 Subhas Nagar',
      addressLine2: 'A.K Mukherjee Lane',
      landmark: 'Noapara',
      city: 'Kolkata',
      pincode: '182090',
      contact: '+91 74393 98783',
      state: 'New Delhi'
    }
  ])
  const [reviews, setReviews] = useState('')
  const [joinedOn, setJoinedOn] = useState('')
  const [uid, setUID] = useState(23456789)
  const [phoneNumber, setphoneNumber] = useState(917439398783)
  const [balance, setBalance] = useState('')
  const [badges, setBadges] = useState(['top_performer',
    '100_Orders',
    'Verified_Trader',
    '10_orders',
    '20_orders',
    '50_orders',
    'century_man'])
  const [rewardPoints, setRewardPoints] = useState('')
  const [loginData, setLoginData] = useState({
    lastLogin: '17-01-2025',
    lastLoginTime: '16:56',
    device: 'MacOS, MacIntoshHD'
  })
  const [profilePic, setProfilePic] = useState('https://randomuser.me/api/portraits/men/75.jpg')
  const [referCode, setReferCode] = useState('rs1210')
  const handleInputChange = (setter) => (data) => {
    setter(data);
  };

  return (
    <Layout active={'admin-3a'} title={'Add User'} >
      <div className="adduser-wrapper">
        <div className="left-auw">

          <Container gap={15} title={'Personal Information'}>
            <div className="pregrid-wrapper" style={{ gridTemplateColumns: '1.5fr 4fr', gap: '20px' }} >
              <div className="profileimage">
                <img src={profilePic} alt="" />
              </div>
              <div className="verificationContainer">
                <div className="pregrid-wrapper" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <InputCustomLabelled type='text' value={name} isLabel={true} label={' Name'} />
                  <InputCustomLabelled type='number' value={uid} isLabel={true} label={'UID'} />
                </div>
                <div className="pregrid-wrapper" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <InputCustomLabelled type='email' value={email} isLabel={true} label={' Email Address'} />
                  <InputCustomLabelled type='number' value={phoneNumber} isLabel={true} label={'Phone Number'} />
                </div>
                <div className="pregrid-wrapper" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <InputCustomLabelled type='text' value={referCode} isLabel={true} label={'Refferal Code'} />
                  <InputCustomLabelled type='text' value={`https://ithyaraa.com/signup?refer=${referCode}`} isLabel={true} label={'Referral Link'} />
                </div>
              </div>
            </div>
          </Container>
          <Container gap={10} title={'Order Details'}>
            <OrdersUser order={orders} />
          </Container>
          <Container gap={10} title={'Return Details'}>
            <OrdersUser order={ordersReturns} backgroundcolor={'red'} />
          </Container>
          <Container title={'Achievements'} gap={10} >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
              {badges.length > 0 ? (
                badges.map((badgeId) => {
                  const badgeObj = badge_svgs.find(b => b.badgeId === badgeId);
                  if (!badgeObj) return null;

                  return (
                    <div
                      key={badgeId}
                      dangerouslySetInnerHTML={{ __html: badgeObj.badgeCode }}
                    />
                  );
                })
              ) : (
                <p>No badges to display yet.</p>
              )}
            </div>

          </Container>
        </div>
        <div className="right-auw">
          <LoginDataComponent loginData={loginData}></LoginDataComponent>
          <Addresses address={addresses} />
          <Container gap={10} title={'Transactions'}>
            <TransactionUser />

          </Container>
        </div>
      </div>
    </Layout>
  )
}

export default AddUser