import HomeBanner from "../../Components/HomeBanner";
import HomeSideBanner from "../../Components/HomeSideBanner";
import MyChatBot from "../../Components/chatbot";
import Button from "@mui/material/Button";
import { IoIosArrowRoundForward } from "react-icons/io";
import React, { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "./index.css"
import AOS from "aos";
import "aos/dist/aos.css";
import { Navigation } from "swiper/modules";
import ProductItem from "../../Components/ProductItem";
import HomeCat from "../../Components/HomeCat";

import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";

import homeBannerPlaceholder from "../../assets/images/homeBannerPlaceholder.jpg";
import Banners from "../../Components/banners";
import { Link } from "react-router-dom";
import ChatBot from 'react-chatbotify';
import { useTranslation } from 'react-i18next';
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [selectedCat, setselectedCat] = useState();
  const [selectedSeason, setselectedSeason] = useState();
  const [filterData, setFilterData] = useState([]);
  const [seasonProductData, setSeasonProductData] = useState([]);
  const [homeSlides, setHomeSlides] = useState([]);

  const [value, setValue] = React.useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [bannerList, setBannerList] = useState([]);
  const [randomCatProducts, setRandomCatProducts] = useState([]);
  const [homeSideBanners, setHomeSideBanners] = useState([]);
  const [homeBottomBanners, setHomeBottomBanners] = useState([]);

  const context = useContext(MyContext);
  const { t } = useTranslation();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const selectCat = (cat) => {
    const encodedCat = encodeURIComponent(cat);
    setselectedCat(encodedCat);
  };

  const selectSeason = (season) => {
    setselectedSeason(season);
  };

  useEffect(() => {
    AOS.init({ duration: 800 });
    window.scrollTo(0, 0);
    context.setisHeaderFooterShow(true);
    setselectedCat(context.categoryData[0]?.name);
    setselectedSeason('Fall');

    const location = localStorage.getItem("location");
    const user = JSON.parse(localStorage.getItem("user")) ;
    const userId = user?.userId || "dddddddddddddddddddddddd";
    console.log(location)

    if (location !== null && location !== "" && location !== undefined) {
      fetchDataFromApi(`/api/products/featured?location=${location}`).then(
        (res) => {
          setFeaturedProducts(res);
        }
      );

      fetchDataFromApi(
        `/api/recommendation/${userId}`
      ).then((res) => {
        setProductsData(res);
      });
    }

    fetchDataFromApi("/api/homeBanner").then((res) => {
      setHomeSlides(res);
    });

    fetchDataFromApi("/api/banners").then((res) => {
      setBannerList(res);
    });

    fetchDataFromApi("/api/homeSideBanners").then((res) => {
      setHomeSideBanners(res);
    });

    fetchDataFromApi("/api/homeBottomBanners").then((res) => {
      setHomeBottomBanners(res);
    });

    context.setEnableFilterTab(false);
    context.setIsBottomShow(true);
  }, []);

  useEffect(() => {
    if (context.categoryData[0] !== undefined) {
      setselectedCat(context.categoryData[0].name);
    }

    if (context.categoryData?.length !== 0) {
      const randomIndex = Math.floor(
        Math.random() * context.categoryData.length
      );

     
      fetchDataFromApi(
        `/api/products/catId?catId=${
          context.categoryData[randomIndex]?.id
        }&location=${localStorage.getItem("location")}`
      ).then((res) => {
        setRandomCatProducts({
          catName: context.categoryData[randomIndex]?.name,
          catId: context.categoryData[randomIndex]?.id,
          products: res?.products,
        });
      });
    }
  }, [context.categoryData]);

  useEffect(() => {
    if (selectedCat !== undefined) {
      setIsLoading(true);
      const location = localStorage.getItem("location");
      fetchDataFromApi(
        `/api/products/catName?catName=${selectedCat}&location=${location}`
      ).then((res) => {
        setFilterData(res.products);
        setIsLoading(false);
      });
    }
  }, [selectedCat]);

  useEffect(() => {
    if (selectedSeason !== undefined) {
      setIsLoading(true);
      const location = localStorage.getItem("location");
      fetchDataFromApi(
        `/api/products/seasonName?seasonName=${selectedSeason}&location=${location}`
      ).then((res) => {
        setSeasonProductData(res.products);
        setIsLoading(false);
      });
    }
  }, [selectedSeason]);


  return (
    <>
      {/* <MyChatBot/> */}
      {homeSlides?.length !== 0 ? (
        <HomeBanner data={homeSlides} />
      ) : (
        <div className="container mt-5">
          <div className="homeBannerSection">
            <img src={homeBannerPlaceholder} className="w-100" />
          </div>
        </div>
      )}

      {context.categoryData?.length !== 0 && (
        <div  data-aos="flip-left">
          <HomeCat catData={context.categoryData} />

        </div>
      )}

      <section className="homeProducts pb-0 " data-aos="flip-right">
        <div className="container ">
          <div className="row homeProductsRow">
            <div className="col-md-3">
              <HomeSideBanner data={homeSideBanners} col={3}/>
              {/* <div className="sticky">
                {homeSideBanners?.length !== 0 &&
                  homeSideBanners?.map((item, index) => {
                    return (
                      <div className="banner mb-3" key={index}>
                        {item?.subCatId !== null ? (
                          <Link
                            to={`/products/subCat/${item?.subCatId}`}
                            className="box"
                          >
                            <img
                              src={item?.images[0]}
                              className="w-100 transition"
                              alt="banner img"
                            />
                          </Link>
                        ) : (
                          <Link
                            to={`/products/category/${item?.catId}`}
                            className="box"
                          >
                            <img
                              src={item?.images[0]}
                              className="cursor w-100 transition"
                              alt="banner img"
                            />
                          </Link>
                        )}
                      </div>
                    );
                  })}

              </div> */}
            </div>

            <div className="col-md-9 productRow" >
              <div className="d-flex align-items-center res-flex-column">
                <div className="info" data-aos="fade-left" style={{ width: "35%" }}>
                  <h3 className="mb-0 hd">{t('disPro')}</h3>
                  <p className="text-light text-sml mb-0">
                    {t('donmis')}
                  </p>
                </div>

                <div
                  className="ml-auto d-flex align-items-center justify-content-end res-full"
                  style={{ width: "65%" }}
                >
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    className="filterTabs"
                  >
                    {context.categoryData?.map((item, index) => {
                      return (
                        <Tab
                          className="item"
                          label={item.name}
                          onClick={() => selectCat(item.name)}
                        />
                      );
                    })}
                  </Tabs>
                </div>
              </div>

              <div
                className="product_row w-100 mt-2" data-aos="fade-up"
                style={{
                  opacity: `${isLoading === true ? "0.5" : "1"}`,
                }}
              >
               

                {context.windowWidth > 992 ? (
                  <Swiper
                    slidesPerView={4}
                    spaceBetween={0}
                    navigation={true}
                    slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                    modules={[Navigation]}
                    className="mySwiper"
                  >
                    {filterData?.length !== 0 &&
                      filterData
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return (
                            <SwiperSlide key={index}>
                              <ProductItem item={item} />
                            </SwiperSlide>
                          );
                        })}

                    <SwiperSlide style={{ opacity: 0 }}>
                      <div className={`productItem`}></div>
                    </SwiperSlide>
                  </Swiper>
                ) : (
                  <div className="productScroller">
                    {filterData?.length !== 0 &&
                      filterData
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return <ProductItem item={item} key={index} />;
                        })}
                  </div>
                )}
              </div>

              <div className="d-flex align-items-center mt-5" data-aos="zoom-in">
                <div className="info w-100 d-flex flex-column">
                  <h3 className="mb-0 hd">{t('offer')}</h3>
                  <p className="text-light text-sml mb-0">
                    New products with updated stocks.
                  </p>
                </div>
              </div>
              <div
                className="product_row w-100 mt-2" data-aos="fade-up"
                style={{
                  opacity: `${isLoading === true ? "0.5" : "1"}`,
                }}
              >
               

                {context.windowWidth > 992 ? (
                  <Swiper
                    slidesPerView={4}
                    spaceBetween={0}
                    navigation={true}
                    slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                    modules={[Navigation]}
                    className="mySwiper"
                  >
                    {productsData?.recommended?.length !== 0 &&
                      productsData.recommended
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return (
                            <SwiperSlide key={index}>
                              <ProductItem item={item} />
                            </SwiperSlide>
                          );
                        })}

                    <SwiperSlide style={{ opacity: 0 }}>
                      <div className={`productItem`}></div>
                    </SwiperSlide>
                  </Swiper>
                ) : (
                  <div className="productScroller">
                    {productsData?.recommended.length !== 0 &&
                      productsData
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return <ProductItem item={item} key={index} />;
                        })}
                  </div>
                )}
              </div>

              

              {/* {productsData?.products?.length === 0 && (
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ minHeight: "300px" }}
                >
                  <CircularProgress />
                </div>
              )}

              <div className="product_row productRow2 w-100 mt-2 d-flex productScroller ml-0 mr-0" data-aos="fade-up">
                {productsData?.products?.length !== 0 &&
                  productsData?.products
                    ?.slice(0)
                    .reverse()
                    .map((item, index) => {
                      return <ProductItem key={index} item={item} />;
                    })}
              </div> */}

              {bannerList?.length !== 0 && (
                <div className="mt-3 mb-3 " data-aos="zoom-in">
                  <Banners data={bannerList} col={3} />
                </div>
              )}

              <div className="d-flex align-items-center mt-3" data-aos="zoom-in">
                <div className="info w-100 d-flex flex-column ">
                  <h3 className="mb-0 hd">{t('feaPro')}</h3>
                  <p className="text-light text-sml mb-0">
                    {t('donmis')}
                  </p>
                </div>
              </div>

              {featuredProducts?.length !== 0 &&  <div className="product_row w-100 mt-2" data-aos="fade-up">
                  {context.windowWidth > 992 ? (
                    <Swiper
                      slidesPerView={4}
                      spaceBetween={0}
                      navigation={true}
                      slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                      modules={[Navigation]}
                      className="mySwiper"
                      breakpoints={{
                        300: {
                          slidesPerView: 1,
                          spaceBetween: 5,
                        },
                        400: {
                          slidesPerView: 2,
                          spaceBetween: 5,
                        },
                        600: {
                          slidesPerView: 3,
                          spaceBetween: 5,
                        },
                        750: {
                          slidesPerView: 4,
                          spaceBetween: 5,
                        },
                      }}
                    >
                      {featuredProducts?.length !== 0 &&
                        featuredProducts
                          ?.slice(0)
                          ?.reverse()
                          ?.map((item, index) => {
                            return (
                              <SwiperSlide key={index}>
                                <ProductItem item={item} />
                              </SwiperSlide>
                            );
                          })}

                      <SwiperSlide style={{ opacity: 0 }}>
                        <div className={`productItem`}></div>
                      </SwiperSlide>
                    </Swiper>
                  ) : (
                    <div className="productScroller">
                      {featuredProducts?.length !== 0 &&
                        featuredProducts
                          ?.slice(0)
                          ?.reverse()
                          ?.map((item, index) => {
                            return <ProductItem item={item} key={index} />;
                          })}
                    </div>
                  )}
                </div>
                
                }
              <div className="d-flex align-items-center res-flex-column mt-5">
                <div className="info" data-aos="fade-left" style={{ width: "35%" }}>
                  <h3 className="mb-0 hd">{t('seaPro')}</h3>
                  <p className="text-light text-sml mb-0">
                    {t('donmis')}
                  </p>
                </div>

                <div
                  className="ml-auto d-flex align-items-center justify-content-end res-full"
                  style={{ width: "65%" }}
                >
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    className="filterTabs"
                  >
                    {["Fall", "Summer", "Spring", "Winter"].map((season) => (
                      <Tab
                        key={season}
                        className="item"
                        label={season}
                        onClick={() => selectSeason(season)}
                      />
                    ))}
                  </Tabs>
                </div>
              </div>

              <div
                className="product_row w-100 mt-2" data-aos="fade-up"
                style={{
                  opacity: `${isLoading === true ? "0.5" : "1"}`,
                }}
              >
               

                {context.windowWidth > 992 ? (
                  <Swiper
                    slidesPerView={4}
                    spaceBetween={0}
                    navigation={true}
                    slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                    modules={[Navigation]}
                    className="mySwiper"
                  >
                    {seasonProductData?.length !== 0 &&
                      seasonProductData
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return (
                            <SwiperSlide key={index}>
                              <ProductItem item={item} />
                            </SwiperSlide>
                          );
                        })}

                    <SwiperSlide style={{ opacity: 0 }}>
                      <div className={`productItem`}></div>
                    </SwiperSlide>
                  </Swiper>
                ) : (
                  <div className="productScroller">
                    {seasonProductData?.length !== 0 &&
                      seasonProductData
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return <ProductItem item={item} key={index} />;
                        })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {bannerList?.length !== 0 && (
            <div className="mt-2 mb-2 " data-aos="zoom-in">
            <Banners data={homeBottomBanners} col={3} />
              
            </div>
          )}
        </div>
      </section>

      <div className="container homeRandom" data-aos="fade-up">
        {randomCatProducts?.length !== 0 &&  randomCatProducts?.products?.length!==0 && (
          <>
            <div className="d-flex align-items-center mt-1 pr-3">
              <div className="info">
                <h3 className="mb-0 hd">{randomCatProducts?.catName}</h3>
                <p className="text-light text-sml mb-0">
                  {t('donmis')}
                </p>
              </div>

              <Link
                to={`/products/category/${randomCatProducts?.catId}`}
                className="ml-auto"
              >
                <Button className="viewAllBtn">
                  View All <IoIosArrowRoundForward />
                </Button>
              </Link>
            </div>

            {randomCatProducts?.length === 0 ? (
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ minHeight: "300px" }}
              >
                <CircularProgress />
              </div>
            ) : (
              <div className="product_row w-100 mt-2">
                {context.windowWidth > 992 ? (
                  <Swiper
                    slidesPerView={5}
                    spaceBetween={0}
                    navigation={true}
                    slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                    modules={[Navigation]}
                    className="mySwiper"
                    breakpoints={{
                      300: {
                        slidesPerView: 1,
                        spaceBetween: 5,
                      },
                      400: {
                        slidesPerView: 2,
                        spaceBetween: 5,
                      },
                      600: {
                        slidesPerView: 4,
                        spaceBetween: 5,
                      },
                      750: {
                        slidesPerView: 5,
                        spaceBetween: 5,
                      },
                    }}
                  >
                    {randomCatProducts?.length !== 0 &&
                      randomCatProducts?.products
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return (
                            <SwiperSlide key={index}>
                              <ProductItem item={item} />
                            </SwiperSlide>
                          );
                        })}

                    <SwiperSlide style={{ opacity: 0 }}>
                      <div className={`productItem`}></div>
                    </SwiperSlide>
                  </Swiper>
                ) : (
                  <div className="productScroller">
                    {randomCatProducts?.length !== 0 &&
                      randomCatProducts?.products
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return <ProductItem item={item} key={index} />;
                        })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Home;