import React from "react";

const loading = () => {
  return (
    <div className="preloader">
      <div className="pxl-loader-spinner">
        <div className="pxl-loader-bounce1"></div>
        <div className="pxl-loader-bounce2"></div>
        <div className="pxl-loader-bounce3"></div>
      </div>
    </div>
  );
};

export default loading;
