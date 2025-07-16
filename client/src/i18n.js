import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: "Welcome to ecommerce website FRUITOPIA",
          signIn: "Sign In",
          signUp: "Sign Up",
          allCategories: "All Categories",
          home: "Home",
          blogs: "Blogs",
          mapLocation: "Map Location",
          Intro: "Introduce & Licence",
          deli: "Delivered Address",
          select: "Select Address",
          noti: "Notifications",
          myAcc: "My Account",
          ord: "Orders",
          myList: "My List",
          memRank: "Member Rank",
          logOut: "Logout",
          feaCat: "Featured Categories",
          disPro: "Discover Our Products",
          donmis: "Don't miss out on great offers this month!",
          offer: "OFFER FOR YOU",
          feaPro: "featured products",
          seaPro: "Season Products",
          blogTypes: "Blog Types",
          ship: "Shipping Fee Guide",
        }
      },
      vi: {
        translation: {
          welcome: "Chào mừng đến với trang web của chúng tôi",
          signIn: "Đăng nhập",
          signUp: "Đăng ký",
          allCategories: "Các Loại",
          home: "Trang Chủ",
          blogs: "Bài Viết",
          mapLocation: "Cửa Hàng",
          Intro: "Giới thiệu & Giấy phép",
          deli: "Địa chỉ nhận",
          select: "Chọn địa chỉ",
          noti: "Thông báo",
          myAcc: "Tài khoản",
          ord: "Đơn hàng",
          myList: "Yêu thích",
          memRank: "Thành viên",
          logOut: "Đăng xuất",
          feaCat: "Loại đặc trưng",
          disPro: "Khám phá sản phẩm",
          donmis: "Đừng bỏ lỡ tháng này!",
          offer: "Dành cho bạn",
          feaPro: "Sản phẩm đặc trưng",
          seaPro: "Theo mùa",
          blogTypes: "Loại bài viết",
          ship: "Hướng dẫn tính phí",
        }
      }
    },
    fallbackLng: 'vi', // hoặc 'en'
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
