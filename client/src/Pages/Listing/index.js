import Sidebar from "../../Components/Sidebar";
import Button from "@mui/material/Button";
import { IoIosMenu } from "react-icons/io";
import { CgMenuGridR } from "react-icons/cg";
import { HiViewGrid } from "react-icons/hi";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";
import { FaAngleDown } from "react-icons/fa6";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useContext, useEffect, useState } from "react";
import ProductItem from "../../Components/ProductItem";


import { useNavigate, useParams } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import { FaFilter } from "react-icons/fa";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

import { MyContext } from "../../App";

const Listing = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [productView, setProductView] = useState("four");
  const [productData, setProductData] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [filterId, setFilterId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");

  
  const history = useNavigate();

  const openDropdown = Boolean(anchorEl);

  const context = useContext(MyContext);

  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    setFilterId("");

    let url = window.location.href;
    let apiEndPoint = "";
    let catApi = "";

    if (url.includes("subCat")) {
      apiEndPoint = `/api/products/subCatId?subCatId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=1&perPage=12`;

      catApi = `/api/category/bySubCat/${id}`;
    }
    if (url.includes("category")) {
      apiEndPoint = `/api/products/catId?catId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=1&perPage=12`;

      catApi = `/api/category/${id}`;
    }

    setisLoading(true);
    fetchDataFromApi(`${apiEndPoint}`).then((res) => {
      console.log("Fetched Data:", res);
      setProductData(res);
      setisLoading(false);
    });

    fetchDataFromApi(catApi).then((res) => {
      if (res?.parent?.name) {
        setCategoryName(res.parent.name);
      } else if (res?.categoryData[0]?.name) {
        setCategoryName(res.categoryData[0].name);
      } else {
        setCategoryName("");  // reset nếu không có category
      }

      if (res?.children && res.children.length > 0) {
        setSubCategoryName(res.children[0].name);
      } else {
        setSubCategoryName("");  // reset nếu không có subcategory
      }
    });


    context.setEnableFilterTab(true);

  }, [id]);

  const handleChangePage = (event, value) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    let url = window.location.href;
    let apiEndPoint = "";

    if (url.includes("subCat")) {
      apiEndPoint = `/api/products/subCatId?subCatId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=${value}&perPage=12`;
    }
    if (url.includes("category")) {
      apiEndPoint = `/api/products/catId?catId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=${value}&perPage=12`;
    }

    setisLoading(true);
    fetchDataFromApi(`${apiEndPoint}`).then((res) => {
      setProductData(res);
      setisLoading(false);
    });



  };

  const filterData = (subCatId) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    history(`/products/subCat/${subCatId}`)

  };

  

  const filterByRating = (rating, subCatId) => {
    setisLoading(true);
    let url = window.location.href;
    let apiEndPoint = "";

    if (url.includes("subCat")) {
      apiEndPoint = `/api/products/rating?rating=${rating}&subCatId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=1&perPage=12`;
    }
    if (url.includes("category")) {
      apiEndPoint = `/api/products/rating?rating=${rating}&catId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=1&perPage=12`;
    }

    fetchDataFromApi(apiEndPoint).then((res) => {
      setProductData(res);
      setisLoading(false);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  };

  return (
    <>
      <section className="product_Listing_Page pt-5">
        <div className="container">
          <div className="productListing d-flex">
            <Sidebar
              filterData={filterData}
              // filterByPrice={filterByPrice}
              filterByRating={filterByRating}
              isOpenFilter={context?.isOpenFilters}
            />

            <div className="content_right">
              <div
                style={{
                  marginBottom: "1rem",
                  borderBottom: "1px solid #ddd",
                  paddingBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.6rem",
                    fontWeight: "700",
                    color: "#5C88C4",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {categoryName}
                </h2>

                {subCategoryName && (
                  <>
                    <span
                      style={{
                        fontSize: "1.2rem",
                        color: "#999",
                        userSelect: "none",
                      }}
                    >
                      →
                    </span>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "1.2rem",
                        fontWeight: "500",
                        color: "#555",
                        fontStyle: "italic",
                      }}
                    >
                      {subCategoryName}
                    </h4>
                  </>
                )}
              </div>

              <div className="showBy mt-0 mb-3 d-flex align-items-center">
                <div className="d-flex align-items-center btnWrapper">
                  <Button
                    className={productView === "one" && "act"}
                    onClick={() => setProductView("one")}
                  >
                    <IoIosMenu />
                  </Button>

                  <Button
                    className={productView === "three" && "act"}
                    onClick={() => setProductView("three")}
                  >
                    <CgMenuGridR />
                  </Button>
                  <Button
                    className={productView === "four" && "act"}
                    onClick={() => setProductView("four")}
                  >
                    <TfiLayoutGrid4Alt />
                  </Button>
                </div>
              </div>

              <div className="productListing">
                {isLoading === true ? (
                  <div className="loading d-flex align-items-center justify-content-center">
                    <CircularProgress color="inherit" />
                  </div>
                ) : (
                  <>
                    {productData?.products?.slice(0)
                      .reverse().map((item, index) => {
                      return (
                        <ProductItem
                          key={index}
                          itemView={productView}
                          item={item}
                        />
                      );
                    })}
                  </>
                )}
              </div>
              {!isLoading && productData?.totalPages > 1 && (
                <Box
                  className="paginationContainer"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '20px',
                  }}
                >
                  <Pagination
                    count={productData.totalPages}
                    page={productData.page}
                    onChange={handleChangePage}
                    color="secondary"
                    shape="rounded" 
                    variant="outlined"
                  />
                </Box>
              )}
              
            </div>
          </div>
        </div>
      </section>

     
    </>
  );
};

export default Listing;

