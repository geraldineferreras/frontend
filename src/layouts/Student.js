/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
// reactstrap components
import { Container } from "reactstrap";
// core components
import StudentNavbar from "components/Navbars/StudentNavbar.js";
import StudentFooter from "components/Footers/StudentFooter.js";
import StudentSidebar from "components/Sidebar/StudentSidebar.js";

import routes from "routes.js";

const Student = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/student") {
        return (
          <Route path={prop.path} element={prop.component} key={key} exact />
        );
      } else {
        return null;
      }
    });
  };

  const getBrandText = (path) => {
    if (path.startsWith('/student/assigned')) return 'TO-DO ASSIGNED';
    if (path.startsWith('/student/missing')) return 'TO-DO MISSING';
    if (path.startsWith('/student/done')) return 'TO-DO DONE';
    for (let i = 0; i < routes.length; i++) {
      if (
        path.indexOf(routes[i].layout + routes[i].path) !==
        -1
      ) {
        return routes[i].name;
      }
    }
    return "Brand";
  };

  return (
    <>
      <StudentSidebar
        {...props}
        routes={routes}
        logo={{
          innerLink: "/student/index",
          imgSrc: require("../assets/img/brand/logo-scms.png"),
          imgAlt: "SCMS Logo",
        }}
      />
      <div className="main-content" ref={mainContent}>
        <StudentNavbar
          {...props}
          brandText={getBrandText(location.pathname)}
        />
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/student/index" replace />} />
        </Routes>
        <Container fluid>
          <StudentFooter />
        </Container>
      </div>
    </>
  );
};

export default Student; 