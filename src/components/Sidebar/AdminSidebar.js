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
/*eslint-disable*/
import React, { useState, useEffect } from "react";
import { Link, NavLink as NavLinkRRD, useLocation } from "react-router-dom";
import { PropTypes } from "prop-types";
import { useAuth } from "../../contexts/AuthContext";
import { getProfilePictureUrl, getUserInitials, getAvatarColor } from "../../utils/profilePictureUtils";
import ApiService from "../../services/api";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Collapse,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Media,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col,
} from "reactstrap";

var ps;

// Access control placeholder: In a real app, this would come from the backend or user settings
// Example: allowedModules[role] = ["Dashboard", "Assignments", ...]
const allowedModules = {
  teacher: [
    "Dashboard",
    "Classroom",
    "Announcement",
    "Materials",
    "Assignments",
    "Submissions",
    "Attendance",
    "Recitation & Grades",
    "Excuse Management"
  ],
  student: [
    "Dashboard",
    "Join Class",
    "Announcements",
    "Materials",
    "Assignments",
    "Submissions",
    "Attendance",
    "Grades",
    "Excuse Letters",
    "Notifications"
  ]
  // Admin can manage these lists in a real UI
};

const AdminSidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState();
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await ApiService.getProfile();
        if (res && res.status && res.data) setUserProfile(res.data);
      } catch (e) {}
    };
    fetchProfile();
  }, []);
  const currentUser = userProfile || user;
  const profilePictureUrl = getProfilePictureUrl(currentUser);
  const userInitials = getUserInitials(currentUser);
  const avatarColor = getAvatarColor(currentUser);
  const [reportsOpen, setReportsOpen] = useState(false);
  const location = props.location || useLocation();
  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };
  const toggleCollapse = () => {
    setCollapseOpen((data) => !data);
  };
  const closeCollapse = () => {
    setCollapseOpen(false);
  };
  const adminModules = [
    { name: "Dashboard", icon: "ni ni-tv-2 text-primary", path: "/index" },
    { name: "User Management", icon: "ni ni-single-02 text-primary", path: "/user-management" },
    { name: "Section Management", icon: "ni ni-badge text-success", path: "/section-management" },
    { name: "Subject Management", icon: "ni ni-books text-info", path: "/subject-management" },
    { name: "Offerings Management", icon: "ni ni-collection text-orange", path: "/offerings-management" },
    { name: "Reports & Logs", icon: "ni ni-archive-2 text-warning", path: "/reports-logs", dropdown: true },
  ];
  const createLinks = () => {
    return adminModules.map((mod, key) => {
      if (mod.dropdown) {
        return (
          <NavItem key={key}>
            <div style={{ position: 'relative' }}>
              <Button
                color="link"
                className="nav-link d-flex align-items-center"
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: 400,
                  color: reportsOpen ? "#fb6340" : "#525f7f",
                  fontSize: "0.93rem",
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: 'none'
                }}
                onClick={e => { e.preventDefault(); setReportsOpen(!reportsOpen); }}
              >
                <i className={mod.icon} style={{ marginLeft: '0.38rem', marginRight: '0.1rem', fontSize: 18, verticalAlign: 'middle', color: '#fb6340' }} />
                Reports & Logs
                <i className={`fa fa-chevron-${reportsOpen ? "down" : "right"}`} style={{ position: 'absolute', right: -8, fontSize: 13, color: "#8898aa" }} />
              </Button>
              {reportsOpen && (
                <div style={{ marginLeft: 32 }}>
                  <NavItem>
                    <NavLink
                      to="/admin/reports-logs/attendance"
                      tag={NavLinkRRD}
                      className={location.pathname.startsWith("/admin/reports-logs/attendance") ? "active" : ""}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0.5rem 1rem",
                        fontSize: "0.93rem",
                        fontWeight: 400,
                        color: location.pathname.startsWith("/admin/reports-logs/attendance") ? "#fb6340" : "#525f7f"
                      }}
                      onClick={closeCollapse}
                    >
                      <i className="ni ni-calendar-grid-58 mr-2" /> Attendance Log
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      to="/admin/reports-logs/grades"
                      tag={NavLinkRRD}
                      className={location.pathname.startsWith("/admin/reports-logs/grades") ? "active" : ""}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0.5rem 1rem",
                        fontSize: "0.93rem",
                        fontWeight: 400,
                        color: location.pathname.startsWith("/admin/reports-logs/grades") ? "#fb6340" : "#525f7f"
                      }}
                      onClick={closeCollapse}
                    >
                      <i className="ni ni-hat-3 mr-2" /> Grades Log
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      to="/admin/reports-logs/audit"
                      tag={NavLinkRRD}
                      className={location.pathname.startsWith("/admin/reports-logs/audit") ? "active" : ""}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0.5rem 1rem",
                        fontSize: "0.93rem",
                        fontWeight: 400,
                        color: location.pathname.startsWith("/admin/reports-logs/audit") ? "#fb6340" : "#525f7f"
                      }}
                      onClick={closeCollapse}
                    >
                      <i className="ni ni-archive-2 mr-2" /> Audit Log
                    </NavLink>
                  </NavItem>
                </div>
              )}
            </div>
          </NavItem>
        );
      }
      return (
        <NavItem key={key}>
          <NavLink
            to={"/admin" + mod.path}
            tag={NavLinkRRD}
            onClick={closeCollapse}
            style={{ fontSize: '0.93rem', fontWeight: 400 }}
          >
            <i className={mod.icon} />
            {mod.name}
          </NavLink>
        </NavItem>
      );
    });
  };
  const { bgColor, routes, logo } = props;
  let navbarBrandProps;
  if (logo && logo.innerLink) {
    navbarBrandProps = {
      to: logo.innerLink,
      tag: Link,
    };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: "_blank",
    };
  }
  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
    >
      <Container fluid>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleCollapse}
        >
          <span className="navbar-toggler-icon" />
        </button>
        {logo ? (
          <NavbarBrand className="pt-0" {...navbarBrandProps}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={logo.imgSrc}
            />
          </NavbarBrand>
        ) : null}
        <Nav className="align-items-center d-md-none">
          <UncontrolledDropdown nav>
            <DropdownToggle nav className="nav-link-icon">
              <i className="ni ni-bell-55" />
            </DropdownToggle>
            <DropdownMenu
              aria-labelledby="navbar-default_dropdown_1"
              className="dropdown-menu-arrow"
              right
            >
              <DropdownItem>Action</DropdownItem>
              <DropdownItem>Another action</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Something else here</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <UncontrolledDropdown nav>
            <DropdownToggle nav>
              <Media className="align-items-center">
                <span className="avatar avatar-sm rounded-circle">
                  {profilePictureUrl ? (
                    <img
                      alt="Profile"
                      src={profilePictureUrl}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <span
                    style={{
                      display: profilePictureUrl ? "none" : "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      backgroundColor: avatarColor,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 12,
                      borderRadius: "50%"
                    }}
                  >
                    {userInitials}
                  </span>
                </span>
              </Media>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">Welcome!</h6>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-single-02" />
                <span>My profile</span>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-settings-gear-65" />
                <span>Settings</span>
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem href="#logout" onClick={async (e) => { e.preventDefault(); await logout(); }}>
                <i className="ni ni-user-run" />
                <span>Logout</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        <Collapse navbar isOpen={collapseOpen}>
          <div className="navbar-collapse-header d-md-none">
            <Row>
              {logo ? (
                <Col className="collapse-brand" xs="6">
                  {logo.innerLink ? (
                    <Link to={logo.innerLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </Link>
                  ) : (
                    <a href={logo.outterLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </a>
                  )}
                </Col>
              ) : null}
              <Col className="collapse-close" xs="6">
                <button
                  className="navbar-toggler"
                  type="button"
                  onClick={toggleCollapse}
                >
                  <span />
                  <span />
                </button>
              </Col>
            </Row>
          </div>
          <Nav navbar>{createLinks()}</Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

AdminSidebar.propTypes = {
    // links that will be displayed inside the component
    routes: PropTypes.arrayOf(PropTypes.object),
    logo: PropTypes.shape({
      // innerLink is for links that will direct the user within the app
      // it will be rendered as <Link to="...">...</Link> tag
      innerLink: PropTypes.string,
      // outterLink is for links that will direct the user outside the app
      // it will be rendered as simple <a href="...">...</a> tag
      outterLink: PropTypes.string,
      // the image src of the logo
      imgSrc: PropTypes.string.isRequired,
      // the alt for the img
      imgAlt: PropTypes.string.isRequired,
    }),
  };

export default AdminSidebar; 