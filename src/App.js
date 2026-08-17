import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import AddUser from './views/users/addUser';
import EditUser from './views/users/editUser';
import ListUsers from './views/users/listUsers';
import VendorDetails from './views/users/vendorDetails';
import ListStaff from './views/staff/listStaff';
import AddStaff from './views/staff/addStaff';
import EditStaff from './views/staff/editStaff';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ListOrders from './views/orders/listOrders';
import OrderDetail from './views/orders/orderDetail';
import BrandOrders from './views/orders/brandOrders';
import ListRefundQueries from './views/refund-queries/listRefundQueries';
import ListResolvedQueries from './views/refund-queries/listResolvedQueries';
import Login from './views/auth/login';
import AddProduct from './views/products/addProduct';
import ListProducts from './views/products/listProducts';
import EditProduct from './views/products/editProduct';
import ListCategory from './views/categories/listCategory';
import AddCategory from './views/categories/addCategory';
import EditCategory from './views/categories/editCategory';
import AddOffer from './views/offer/addOffer';
import ListOffers from './views/offer/listOffer';
import EditOffer from './views/offer/editOffer';
import ListCoupons from './views/coupons/listCoupons';
import AddCoupon from './views/coupons/addCoupon';
import EditCoupon from './views/coupons/editCoupon';
import AddMakeCombo from './views/makeCombo/addMakeCombo';
import ListMakeCombo from './views/makeCombo/listMakeCombo';
import EditMakeCombo from './views/makeCombo/editMakeCombo';
import AddCombo from './views/combo/addCombo';
import ListCombo from './views/combo/listCombo';
import EditCombo from './views/combo/editCombo';
import ProtectedRoute from './views/protectedRoute';
import AddCustomProduct from './views/custom-product/addcustomProduct';
import EditCustomProduct from './views/custom-product/editCustomProduct';
import CustomProductList from './views/custom-product/listCustomProducts';
import Dashboard from './views/dashboard/dashboard';
import ListPayouts from './views/payout/listPayouts';
import ListReviews from './views/reviews/listReviews';
import ListHomepageSections from './views/homepage-sections/listHomepageSections';
import AddHomepageSection from './views/homepage-sections/addHomepageSection';
import EditHomepageSection from './views/homepage-sections/editHomepageSection';
import SectionTagManager from './views/homepage-sections/sectionTagManager';
import ManageHomeSlider from './views/home-slider/manageHomeSlider';
import AddFeaturedBlock from './views/homepage-sections/addFeaturedBlock';
import ListProductGroups from './views/product-groups/listProductGroups';
import AddProductGroup from './views/product-groups/addProductGroup';
import EditProductGroup from './views/product-groups/editProductGroup';
import ListPresaleSectionGroups from './views/presale-section-groups/listPresaleSectionGroups';
import AddPresaleSectionGroup from './views/presale-section-groups/addPresaleSectionGroup';
import EditPresaleSectionGroup from './views/presale-section-groups/editPresaleSectionGroup';
import ListCustomImageSections from './views/custom-image-sections/listCustomImageSections';
import AddCustomImageSection from './views/custom-image-sections/addCustomImageSection';
import EditCustomImageSection from './views/custom-image-sections/editCustomImageSection';
import ListSectionItems from './views/section-items/listSectionItems';
import AddSectionItem from './views/section-items/addSectionItem';
import EditSectionItem from './views/section-items/editSectionItem';
import ListComboSectionGroups from './views/combo-groups/listComboSectionGroups';
import AddComboSectionGroup from './views/combo-groups/addComboSectionGroup';
import EditComboSectionGroup from './views/combo-groups/editComboSectionGroup';
import ListOfferSectionItems from './views/offer-section-items/listSectionItems';
import AddOfferSectionItem from './views/offer-section-items/addSectionItem';
import EditOfferSectionItem from './views/offer-section-items/editSectionItem';
import ListBrands from './views/brands/listBrands';
import ListAffiliateBankAccounts from './views/affiliate-bank-accounts/listAffiliateBankAccounts';
import AddBrand from './views/brands/addBrand';
import EditBrand from './views/brands/editBrand';
import ListBrandApplications from './views/brands/listBrandApplications';
import ListBankDetails from './views/banks/listBankDetails';
import ListCoins from './views/coins/listCoins';
import ListFlashSales from './views/flashSale/listFlashSales';
import AddFlashSale from './views/flashSale/addFlashSale';
import EditFlashSale from './views/flashSale/editFlashSale';
import AddPresaleProduct from './views/presale/addPresaleProduct';
import EditPresaleProduct from './views/presale/editPresaleProduct';
import ListPresaleProducts from './views/presale/listPresaleProducts';
import AddPresaleGroup from './views/presale/addPresaleGroup';
import EditPresaleGroup from './views/presale/editPresaleGroup';
import ListPresaleGroups from './views/presale/listPresaleGroups';
import ListPresaleBookings from './views/presale-bookings/listPresaleBookings';
import PresaleBookingDetail from './views/presale-bookings/presaleBookingDetail';
import SubscribersList from './views/newsletter/subscribersList';
import NewsletterList from './views/newsletter/newsletterList';
import CreateNewsletter from './views/newsletter/createNewsletter';
import NewsletterStats from './views/newsletter/newsletterStats';
import SizeChartsPage from './views/sizeCharts/listSizeCharts';
import ListNotifications from './views/notifications/listNotifications';
import CreateNotification from './views/notifications/createNotification';
import ListFaqs from './views/faq/listFaqs';
import AddFaq from './views/faq/addFaq';
import EditFaq from './views/faq/editFaq';
import AddHomeCategory from './views/homeCategories/addHomeCategory';
import ListHomeCategories from './views/homeCategories/listHomeCategories';
import ListAffiliates from './views/affiliates/listAffiliates';
import AffiliateDetail from './views/affiliates/affiliateDetail';
import AffiliateApproval from './views/affiliates/affiliateApproval';
import ListReels from './views/reels/listReels';
import AddReel from './views/reels/addReel';
import CacheManagement from './views/cache/CacheManagement';
import SupportTicketQueue from './views/support/SupportTicketQueue';
import SupportTicketDetail from './views/support/SupportTicketDetail';
import SupportTopicManager from './views/support/SupportTopicManager';
import ManageCustomTabbedCategories from './views/customTabbedCategories/ManageCustomTabbedCategories';
import SoftDeletedProducts from './views/products/listSoftDeleteProduct';

const FeaturedCategories = lazy(() => import('./views/categories/featuredCategories'));
const DeliveryFeedbackList = lazy(() => import('./views/delivery-feedback/DeliveryFeedbackList'));
const ListSettlements = lazy(() => import("./views/settlement/ListSettlements"));
const SettlementDetail = lazy(() => import("./views/settlement/SettlementDetail"));

// Simple 404 component
export const NotFound = () => (
  <div className="flex-center h-[100vh] text-white bg-[#0a0a0a]">
    <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
  </div>
);

function App() {
  return (
    <>
      <ToastContainer />

      <Routes>
        {/* Unprotected login */}
        <Route path="/login" element={<Login />} />

        {/* All other routes protected */}
        <Route path="/admin/settlements" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><ListSettlements /></Suspense></ProtectedRoute>} />
        <Route path="/admin/settlements/:brandID/:month" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<div>Loading...</div>}><SettlementDetail /></Suspense></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute>     <Dashboard />   </ProtectedRoute>} />
        <Route path="/users/list" element={<ProtectedRoute>     <ListUsers />   </ProtectedRoute>} />
        <Route path="/users/add" element={<ProtectedRoute>     <AddUser />   </ProtectedRoute>} />
        <Route path="/users/edit/:uid" element={<ProtectedRoute>     <EditUser />   </ProtectedRoute>} />
        <Route path="/vendors/add" element={<ProtectedRoute>     <VendorDetails />   </ProtectedRoute>} />

        {/* Staff Management Routes */}
        <Route path="/staff/list" element={<ProtectedRoute allowedRoles={['admin']}>     <ListStaff />   </ProtectedRoute>} />
        <Route path="/staff/add" element={<ProtectedRoute allowedRoles={['admin']}>     <AddStaff />   </ProtectedRoute>} />
        <Route path="/staff/edit/:uid" element={<ProtectedRoute allowedRoles={['admin']}>     <EditStaff />   </ProtectedRoute>} />
        <Route path="/orders/list" element={<ProtectedRoute>     <ListOrders />   </ProtectedRoute>} />
        <Route path="/orders/brand-orders" element={<ProtectedRoute>     <BrandOrders />   </ProtectedRoute>} />
        <Route path="/orders/refund-queries" element={<ProtectedRoute>     <ListRefundQueries />   </ProtectedRoute>} />
        <Route path="/orders/resolved-queries" element={<ProtectedRoute>     <ListResolvedQueries />   </ProtectedRoute>} />
        <Route path="/orders/details/:orderId" element={<ProtectedRoute>     <OrderDetail />   </ProtectedRoute>} />

        <Route path="/products/add" element={<ProtectedRoute>     <AddProduct />   </ProtectedRoute>} />
        <Route path="/products/list" element={<ProtectedRoute>     <ListProducts />   </ProtectedRoute>} />
        <Route path="/products/deleted" element={<ProtectedRoute>     <SoftDeletedProducts />   </ProtectedRoute>} />
        <Route path="/products/details/:productID" element={<ProtectedRoute>     <EditProduct />   </ProtectedRoute>} />

        <Route path="/categories/list" element={<ProtectedRoute>     <ListCategory />   </ProtectedRoute>} />
        <Route path="/categories/add" element={<ProtectedRoute>     <AddCategory />   </ProtectedRoute>} />
        <Route path="/categories/details/:categoryID" element={<ProtectedRoute>     <EditCategory />   </ProtectedRoute>} />
        <Route path="/categories/featured" element={<ProtectedRoute><Suspense fallback={<div>Loading...</div>}><FeaturedCategories /></Suspense></ProtectedRoute>} />
        <Route path="/delivery-feedback/list" element={<ProtectedRoute><Suspense fallback={<div>Loading...</div>}><DeliveryFeedbackList /></Suspense></ProtectedRoute>} />

        <Route path="/offer/add" element={<ProtectedRoute allowedRoles={['admin']}>     <AddOffer />   </ProtectedRoute>} />
        <Route path="/offer/list" element={<ProtectedRoute allowedRoles={['admin']}>     <ListOffers />   </ProtectedRoute>} />
        <Route path="/offer/details/:offerID" element={<ProtectedRoute allowedRoles={['admin']}>     <EditOffer />   </ProtectedRoute>} />

        <Route path="/coupons/add" element={<ProtectedRoute allowedRoles={['admin']}>     <AddCoupon />   </ProtectedRoute>} />
        <Route path="/coupons/list" element={<ProtectedRoute allowedRoles={['admin']}>     <ListCoupons />   </ProtectedRoute>} />
        <Route path="/coupons/edit/:couponID" element={<ProtectedRoute allowedRoles={['admin']}>     <EditCoupon />   </ProtectedRoute>} />

        <Route path="/make-combo/add" element={<ProtectedRoute>     <AddMakeCombo />   </ProtectedRoute>} />
        <Route path="/make-combo/list" element={<ProtectedRoute>     <ListMakeCombo />   </ProtectedRoute>} />
        <Route path="/make-combo/detail/:comboID" element={<ProtectedRoute>     <EditMakeCombo />   </ProtectedRoute>} />

        <Route path="/combo/add" element={<ProtectedRoute>     <AddCombo />   </ProtectedRoute>} />
        <Route path="/combo/list" element={<ProtectedRoute>     <ListCombo />   </ProtectedRoute>} />
        <Route path="/combo/detail/:comboID" element={<ProtectedRoute>     <EditCombo />   </ProtectedRoute>} />

        <Route path='/custom-product/add' element={<ProtectedRoute><AddCustomProduct /></ProtectedRoute>} />
        <Route path='/custom-product/edit/:productID' element={<ProtectedRoute><EditCustomProduct /></ProtectedRoute>} />
        <Route path='/custom-product/list' element={<ProtectedRoute><CustomProductList /></ProtectedRoute>} />

        <Route path="/payout/list" element={<ProtectedRoute><ListPayouts /></ProtectedRoute>} />

        <Route path="/affiliates/list" element={<ProtectedRoute><ListAffiliates /></ProtectedRoute>} />
        <Route path="/affiliates/details/:uid" element={<ProtectedRoute><AffiliateDetail /></ProtectedRoute>} />
        <Route path="/affiliates/approval" element={<ProtectedRoute><AffiliateApproval /></ProtectedRoute>} />

        <Route path="/affiliate-bank-accounts/list" element={<ProtectedRoute><ListAffiliateBankAccounts /></ProtectedRoute>} />

        <Route path="/reviews/list" element={<ProtectedRoute><ListReviews /></ProtectedRoute>} />

        <Route path="/brands/list" element={<ProtectedRoute><ListBrands /></ProtectedRoute>} />
        <Route path="/brands/add" element={<ProtectedRoute><AddBrand /></ProtectedRoute>} />
        <Route path="/brands/edit/:uid" element={<ProtectedRoute><EditBrand /></ProtectedRoute>} />
        <Route path="/brands/applications" element={<ProtectedRoute><ListBrandApplications /></ProtectedRoute>} />

        <Route path="/banks/list" element={<ProtectedRoute><ListBankDetails /></ProtectedRoute>} />

        <Route path="/coins/list" element={<ProtectedRoute><ListCoins /></ProtectedRoute>} />

        <Route path="/flash-sale/list" element={<ProtectedRoute><ListFlashSales /></ProtectedRoute>} />
        <Route path="/flash-sale/add" element={<ProtectedRoute><AddFlashSale /></ProtectedRoute>} />
        <Route path="/flash-sale/edit/:saleID" element={<ProtectedRoute><EditFlashSale /></ProtectedRoute>} />

        <Route path="/presale/products/add" element={<ProtectedRoute><AddPresaleProduct /></ProtectedRoute>} />
        <Route path="/presale/products/list" element={<ProtectedRoute><ListPresaleProducts /></ProtectedRoute>} />
        <Route path="/presale/products/edit/:presaleProductID" element={<ProtectedRoute><EditPresaleProduct /></ProtectedRoute>} />
        <Route path="/presale/groups/add" element={<ProtectedRoute><AddPresaleGroup /></ProtectedRoute>} />
        <Route path="/presale/groups/list" element={<ProtectedRoute><ListPresaleGroups /></ProtectedRoute>} />
        <Route path="/presale/groups/edit/:presaleGroupID" element={<ProtectedRoute><EditPresaleGroup /></ProtectedRoute>} />

        {/* Pre-Booking Orders Routes */}
        <Route path="/prebooking-orders/:viewType" element={<ProtectedRoute><ListPresaleBookings /></ProtectedRoute>} />
        <Route path="/presale-bookings/list" element={<ProtectedRoute><ListPresaleBookings /></ProtectedRoute>} />
        <Route path="/presale-bookings/details/:preBookingID" element={<ProtectedRoute><PresaleBookingDetail /></ProtectedRoute>} />

        {/* Newsletter Management */}
        <Route path="/admin/newsletters/subscribers" element={<ProtectedRoute><SubscribersList /></ProtectedRoute>} />
        <Route path="/admin/newsletters" element={<ProtectedRoute><NewsletterList /></ProtectedRoute>} />
        <Route path="/admin/newsletters/create" element={<ProtectedRoute><CreateNewsletter /></ProtectedRoute>} />
        <Route path="/admin/newsletters/:id/stats" element={<ProtectedRoute><NewsletterStats /></ProtectedRoute>} />

        {/* Admin → Brand notifications */}
        <Route path="/admin/notifications" element={<ProtectedRoute><ListNotifications /></ProtectedRoute>} />
        <Route path="/admin/notifications/create" element={<ProtectedRoute><CreateNotification /></ProtectedRoute>} />

        {/* Size Charts */}
        <Route path="/size-charts" element={<ProtectedRoute><SizeChartsPage /></ProtectedRoute>} />

        {/* Homepage Sections Routes */}
        <Route path="/homepage-sections/list" element={<ProtectedRoute><ListHomepageSections /></ProtectedRoute>} />
        <Route path="/homepage-sections/add" element={<ProtectedRoute><AddHomepageSection /></ProtectedRoute>} />
        <Route path="/homepage-sections/edit/:id" element={<ProtectedRoute><EditHomepageSection /></ProtectedRoute>} />
        <Route path="/homepage-sections/tags" element={<ProtectedRoute><SectionTagManager /></ProtectedRoute>} />
        <Route path="/home-slider" element={<ProtectedRoute><ManageHomeSlider /></ProtectedRoute>} />
        <Route path="/featured-blocks/add" element={<ProtectedRoute><AddFeaturedBlock /></ProtectedRoute>} />
        {/* Product Groups */}
        <Route path="/product-groups/list" element={<ProtectedRoute><ListProductGroups /></ProtectedRoute>} />
        <Route path="/product-groups/add" element={<ProtectedRoute><AddProductGroup /></ProtectedRoute>} />
        <Route path="/product-groups/edit/:groupId" element={<ProtectedRoute><EditProductGroup /></ProtectedRoute>} />
        <Route path="/product-groups/:groupId/products" element={<ProtectedRoute><EditProductGroup /></ProtectedRoute>} />
        {/* Presale Section Groups */}
        <Route path="/presale-section-groups/list" element={<ProtectedRoute><ListPresaleSectionGroups /></ProtectedRoute>} />
        <Route path="/presale-section-groups/add" element={<ProtectedRoute><AddPresaleSectionGroup /></ProtectedRoute>} />
        <Route path="/presale-section-groups/edit/:groupId" element={<ProtectedRoute><EditPresaleSectionGroup /></ProtectedRoute>} />
        {/* Custom Image Sections */}
        <Route path="/custom-image-sections/list" element={<ProtectedRoute><ListCustomImageSections /></ProtectedRoute>} />
        <Route path="/custom-image-sections/add" element={<ProtectedRoute><AddCustomImageSection /></ProtectedRoute>} />
        <Route path="/custom-image-sections/edit/:id" element={<ProtectedRoute><EditCustomImageSection /></ProtectedRoute>} />
        {/* Section Items */}
        <Route path="/section-items/list" element={<ProtectedRoute><ListSectionItems /></ProtectedRoute>} />
        <Route path="/section-items/add" element={<ProtectedRoute><AddSectionItem /></ProtectedRoute>} />
        <Route path="/section-items/edit/:id" element={<ProtectedRoute><EditSectionItem /></ProtectedRoute>} />

        {/* Combo Section Groups */}
        <Route path="/combo-groups/list" element={<ProtectedRoute><ListComboSectionGroups /></ProtectedRoute>} />
        <Route path="/combo-groups/add" element={<ProtectedRoute><AddComboSectionGroup /></ProtectedRoute>} />
        <Route path="/combo-groups/edit/:groupId" element={<ProtectedRoute><EditComboSectionGroup /></ProtectedRoute>} />
        <Route path="/combo-groups/:groupId/products" element={<ProtectedRoute><EditComboSectionGroup /></ProtectedRoute>} />

        {/* Offer Section Items */}
        <Route path="/offer-section-items/list" element={<ProtectedRoute><ListOfferSectionItems /></ProtectedRoute>} />
        <Route path="/offer-section-items/add" element={<ProtectedRoute><AddOfferSectionItem /></ProtectedRoute>} />
        <Route path="/offer-section-items/edit/:id" element={<ProtectedRoute><EditOfferSectionItem /></ProtectedRoute>} />

        {/* FAQ Routes */}
        <Route path="/faq/list" element={<ProtectedRoute><ListFaqs /></ProtectedRoute>} />
        <Route path="/faq/add" element={<ProtectedRoute><AddFaq /></ProtectedRoute>} />
        <Route path="/faq/edit/:id" element={<ProtectedRoute><EditFaq /></ProtectedRoute>} />

        {/* Home Categories */}
        <Route path="/home-categories/list" element={<ProtectedRoute><ListHomeCategories /></ProtectedRoute>} />
        <Route path="/home-categories/add" element={<ProtectedRoute><AddHomeCategory /></ProtectedRoute>} />
        <Route path="/custom-tabbed-categories" element={<ProtectedRoute><ManageCustomTabbedCategories /></ProtectedRoute>} />

        <Route path="/reels/list" element={<ProtectedRoute><ListReels /></ProtectedRoute>} />
        <Route path="/reels/add" element={<ProtectedRoute><AddReel /></ProtectedRoute>} />
        <Route path="/reels/edit/:id" element={<ProtectedRoute><AddReel /></ProtectedRoute>} />

        <Route path="/admin/cache" element={<ProtectedRoute><CacheManagement /></ProtectedRoute>} />

        {/* Support Support System */}
        <Route path="/support/tickets" element={<ProtectedRoute><SupportTicketQueue /></ProtectedRoute>} />
        <Route path="/support/details/:ticketNo" element={<ProtectedRoute><SupportTicketDetail /></ProtectedRoute>} />
        <Route path="/support/topics" element={<ProtectedRoute><SupportTopicManager /></ProtectedRoute>} />

        {/* 404 - catch all other routes */}
        <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
