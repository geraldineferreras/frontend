import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  FormGroup,
  Label,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Pagination,
  PaginationItem,
  PaginationLink,
  Spinner,
  Progress,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import classnames from "classnames";

// Helper to get a random avatar based on id
function getRandomAvatar(userId) {
  const avatarUrls = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
  ];
  const index = Math.abs(userId.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % avatarUrls.length;
  return avatarUrls[index];
}

const GradesLog = () => {
  const [gradesData, setGradesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedActivityType, setSelectedActivityType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeCourseTab, setActiveCourseTab] = useState("bsit");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  // Sample grades data
  const sampleData = [
    {
      id: 1,
      studentName: "John Smith",
      section: "BSIT-1A",
      subject: "Programming Fundamentals",
      activityType: "Quiz",
      score: 18,
      totalScore: 20,
      date: "2024-01-15",
      gradedBy: "Mr. Cruz",
    },
    {
      id: 2,
      studentName: "Maria Garcia",
      section: "BSIT-1A",
      subject: "Programming Fundamentals",
      activityType: "Quiz",
      score: 16,
      totalScore: 20,
      date: "2024-01-15",
      gradedBy: "Mr. Cruz",
    },
    {
      id: 3,
      studentName: "David Wilson",
      section: "BSIT-1A",
      subject: "Programming Fundamentals",
      activityType: "Quiz",
      score: 20,
      totalScore: 20,
      date: "2024-01-15",
      gradedBy: "Mr. Cruz",
    },
    {
      id: 4,
      studentName: "Sarah Johnson",
      section: "BSIT-1B",
      subject: "Web Development",
      activityType: "Project",
      score: 45,
      totalScore: 50,
      date: "2024-01-16",
      gradedBy: "Ms. Reyes",
    },
    {
      id: 5,
      studentName: "Michael Brown",
      section: "BSIT-1B",
      subject: "Web Development",
      activityType: "Project",
      score: 42,
      totalScore: 50,
      date: "2024-01-16",
      gradedBy: "Ms. Reyes",
    },
    {
      id: 6,
      studentName: "Emily Davis",
      section: "BSIT-1C",
      subject: "Database Management",
      activityType: "Exam",
      score: 85,
      totalScore: 100,
      date: "2024-01-17",
      gradedBy: "Mr. Garcia",
    },
    {
      id: 7,
      studentName: "James Miller",
      section: "BSIT-1C",
      subject: "Database Management",
      activityType: "Exam",
      score: 78,
      totalScore: 100,
      date: "2024-01-17",
      gradedBy: "Mr. Garcia",
    },
    {
      id: 8,
      studentName: "Lisa Anderson",
      section: "BSIT-1A",
      subject: "Computer Networks",
      activityType: "Quiz",
      score: 17,
      totalScore: 20,
      date: "2024-01-18",
      gradedBy: "Mrs. David",
    },
    {
      id: 9,
      studentName: "Robert Taylor",
      section: "BSIT-1B",
      subject: "Software Engineering",
      activityType: "Project",
      score: 48,
      totalScore: 50,
      date: "2024-01-19",
      gradedBy: "Ms. Santos",
    },
    {
      id: 10,
      studentName: "Jennifer White",
      section: "BSIT-1C",
      subject: "Operating Systems",
      activityType: "Exam",
      score: 92,
      totalScore: 100,
      date: "2024-01-20",
      gradedBy: "Mr. Lee",
    },
  ];

  const sections = ["BSIT-1A", "BSIT-1B", "BSIT-1C", "BSIT-2A", "BSIT-2B"];
  const subjects = [
    "Programming Fundamentals",
    "Web Development",
    "Database Management",
    "Computer Networks",
    "Software Engineering",
    "Operating Systems",
  ];
  const activityTypes = ["Quiz", "Exam", "Project"];

  // Add courses array for tabs
  const courses = [
    { id: "bsit", abbr: "BSIT", name: "Info Tech" },
    { id: "bscs", abbr: "BSCS", name: "Computer Science" },
    { id: "bsis", abbr: "BSIS", name: "Info Systems" },
    { id: "act", abbr: "ACT", name: "Computer Technology" },
  ];

  const teachers = [
    "Mr. Cruz", "Ms. Reyes", "Mr. Garcia", "Mrs. David", "Ms. Santos",
    "Mr. Lee", "Ms. Tan", "Mr. Ramos", "Ms. Lim", "Mr. Dela Cruz",
    "Ms. Torres", "Mr. Mendoza", "Ms. Navarro", "Mr. Villanueva",
    "Ms. Bautista", "Mr. Hernandez"
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setGradesData(sampleData);
      setFilteredData(sampleData);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, selectedSection, selectedSubject, selectedActivityType, gradesData]);

  const filterData = () => {
    let filtered = gradesData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Section filter
    if (selectedSection) {
      filtered = filtered.filter((item) => item.section === selectedSection);
    }

    // Subject filter
    if (selectedSubject) {
      filtered = filtered.filter((item) => item.subject === selectedSubject);
    }

    // Activity type filter
    if (selectedActivityType) {
      filtered = filtered.filter((item) => item.activityType === selectedActivityType);
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const getSortIndicator = (key) => {
    if (sortKey === key) {
      return sortDirection === "asc" ? " ↑" : " ↓";
    }
    return "";
  };

  const getActivityTypeBadge = (type) => {
    switch (type) {
      case "Quiz":
        return <Badge color="info">{type}</Badge>;
      case "Exam":
        return <Badge color="warning">{type}</Badge>;
      case "Project":
        return <Badge color="success">{type}</Badge>;
      default:
        return <Badge color="secondary">{type}</Badge>;
    }
  };

  const getScorePercentage = (score, totalScore) => {
    return Math.round((score / totalScore) * 100);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "info";
    if (percentage >= 70) return "warning";
    return "danger";
  };

  const exportToCSV = () => {
    const headers = ["Student Name", "Section", "Subject", "Activity Type", "Score", "Percentage", "Graded By", "Date"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) => {
        const percentage = getScorePercentage(row.score, row.totalScore);
        return [
          row.studentName,
          row.section,
          row.subject,
          row.activityType,
          `${row.score}/${row.totalScore}`,
          `${percentage}%`,
          row.gradedBy,
          row.date,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grades_log.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF export simulation
    alert("PDF export functionality would be implemented here");
  };

  // Filter by course tab
  const filteredByCourse = filteredData.filter(item => (item.section || '').toLowerCase().includes(activeCourseTab));

  // Sorting and pagination
  const sortedData = [...filteredByCourse].sort((a, b) => {
    if (!sortKey) return 0;
    
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    
    if (sortKey === "date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else if (sortKey === "percentage") {
      aVal = getScorePercentage(a.score, a.totalScore);
      bVal = getScorePercentage(b.score, b.totalScore);
    }
    
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedSubject("");
    setSelectedSection("");
    setSelectedTeacher("");
    filterData();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2">Loading grades data...</p>
      </div>
    );
  }

  return (
    <>
      <Header showStats={false} />
      {/* Header Background */}
      <div className="header pb-8 pt-4 pt-md-7"></div>
      <Container className="mt-4" fluid>
        <Row style={{marginTop: '-14rem'}}>
          <Col md="12">
            {/* Filter Section with Course Tabs at the very top edge INSIDE the card */}
            <Card className="mb-4" style={{ border: '1px solid #e1e5e9', borderTopLeftRadius: 0, borderRadius: '8px', marginTop: 0 }}>
              <CardBody style={{ padding: 0 }}>
                <div className="d-flex align-items-end" style={{marginTop: 0, paddingTop: 0, paddingLeft: 0, marginLeft: 0, marginBottom: '0.75rem'}}>
                  <Nav tabs style={{marginLeft: 0, paddingLeft: 0}}>
                    {courses.map(course => (
                      <NavItem key={course.id}>
                        <NavLink
                          className={classnames({ active: activeCourseTab === course.id })}
                          onClick={() => setActiveCourseTab(course.id)}
                          style={{
                            cursor: "pointer",
                            borderBottom: activeCourseTab === course.id ? "3px solid #5e72e4" : "none"
                          }}
                        >
                          {course.abbr}
                        </NavLink>
                      </NavItem>
                    ))}
                  </Nav>
                </div>
                {/* Filter controls below tabs */}
                <div style={{paddingLeft: '1.5rem', paddingRight: '1.5rem'}}>
                  <Row>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Date From</Label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: dateFrom ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Date To</Label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: dateTo ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Subject</Label>
                        <Input
                          type="select"
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: selectedSubject ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        >
                          <option value="">All Subjects</option>
                          {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Section</Label>
                        <Input
                          type="select"
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: selectedSection ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        >
                          <option value="">All Sections</option>
                          {sections.map(section => (
                            <option key={section} value={section}>{section}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Activity Type</Label>
                        <Input
                          type="select"
                          value={selectedActivityType}
                          onChange={e => setSelectedActivityType(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: selectedActivityType ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        >
                          <option value="">All Types</option>
                          <option value="Quiz">Quiz</option>
                          <option value="Exam">Exam</option>
                          <option value="Project">Project</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Teacher</Label>
                        <Input
                          type="select"
                          value={selectedTeacher}
                          onChange={(e) => setSelectedTeacher(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: selectedTeacher ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        >
                          <option value="">All Teachers</option>
                          {teachers.map(teacher => (
                            <option key={teacher} value={teacher}>{teacher}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={6} className="d-flex justify-content-end align-items-end">
                      <Button
                        color="secondary"
                        outline
                        size="sm"
                        onClick={clearFilters}
                        style={{ borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', padding: '0.375rem 0.75rem', marginBottom: '1.5rem' }}
                      >
                        <i className="ni ni-refresh mr-1" />
                        Clear Filters
                      </Button>
                    </Col>
                  </Row>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        {/* Card with search, filter buttons, and table */}
        <Row>
          <Col md="12">
            <Card className="shadow">
              <CardBody style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: 0 }}>
                {/* Search and Filter Row */}
                <Row style={{ marginLeft: 0, marginRight: 0 }}>
                  <Col md="12" className="pl-3 pr-3">
                    {/* Search bar in a single row with space to the right */}
                    <div className="d-flex align-items-center mb-2" style={{ width: '100%', margin: 0, padding: 0, marginTop: '20px' }}>
                      <InputGroup className={isSearchFocused ? 'focused' : ''} style={{ width: '100%', marginBottom: '6px' }}>
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="fas fa-search" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Search students, sections, or subjects..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ minWidth: 0 }}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() => setIsSearchFocused(false)}
                        />
                      </InputGroup>
                    </div>
                    {/* Header with count and action buttons */}
                    <div className="w-100 d-flex justify-content-between align-items-center" style={{ marginTop: '20px', marginBottom: '16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#32325d' }}>
                        Grades Log ({filteredData.length})
                      </div>
                      <div className="d-flex align-items-center" style={{ gap: 12 }}>
                        <UncontrolledDropdown className="d-inline-block">
                          <DropdownToggle color="info" outline size="sm" style={{ padding: '3px 10px', fontSize: '0.75rem', margin: 0 }}>
                            <i className="ni ni-archive-2 mr-2" /> Export
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem 
                              onClick={exportToCSV}
                              style={{ backgroundColor: 'white', transition: 'background 0.2s' }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = '#e7f3ff'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <i className="ni ni-single-copy-04 mr-2" />
                              Export to CSV
                            </DropdownItem>
                            <DropdownItem 
                              onClick={exportToPDF}
                              style={{ backgroundColor: 'white', transition: 'background 0.2s' }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = '#e7f3ff'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <i className="ni ni-pdf mr-2" />
                              Export to PDF
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Table */}
                <Table className="align-items-center table-flush" responsive style={{ margin: 0, padding: 0, width: '100%' }}>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col" onClick={() => handleSort('studentName')} style={{ cursor: 'pointer' }}>
                        STUDENT NAME{getSortIndicator('studentName')}
                      </th>
                      <th scope="col" onClick={() => handleSort('section')} style={{ cursor: 'pointer' }}>
                        SECTION{getSortIndicator('section')}
                      </th>
                      <th scope="col" onClick={() => handleSort('subject')} style={{ cursor: 'pointer' }}>
                        SUBJECT{getSortIndicator('subject')}
                      </th>
                      <th scope="col" onClick={() => handleSort('activityType')} style={{ cursor: 'pointer' }}>
                        ACTIVITY TYPE{getSortIndicator('activityType')}
                      </th>
                      <th scope="col" onClick={() => handleSort('score')} style={{ cursor: 'pointer' }}>
                        SCORE{getSortIndicator('score')}
                      </th>
                      <th scope="col" onClick={() => handleSort('percentage')} style={{ cursor: 'pointer' }}>
                        PERCENTAGE{getSortIndicator('percentage')}
                      </th>
                      <th scope="col" onClick={() => handleSort('gradedBy')} style={{ cursor: 'pointer' }}>
                        GRADED BY{getSortIndicator('gradedBy')}
                      </th>
                      <th scope="col" onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                        DATE{getSortIndicator('date')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item) => {
                        const percentage = getScorePercentage(item.score, item.totalScore);
                        return (
                          <tr key={item.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div
                                  className="avatar avatar-sm rounded-circle bg-gradient-primary mr-3"
                                  style={{ width: 32, height: 32, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #e9ecef' }}
                                >
                                  <img 
                                    src={getRandomAvatar(item.id)} 
                                    alt={item.studentName} 
                                    style={{ width: 32, height: 32, objectFit: 'cover' }} 
                                  />
                                </div>
                                <div>
                                  <div className="font-weight-bold">{item.studentName}</div>
                                </div>
                              </div>
                            </td>
                            <td>{item.section}</td>
                            <td>{item.subject}</td>
                            <td>{getActivityTypeBadge(item.activityType)}</td>
                            <td>
                              <div className="font-weight-bold">{item.score}/{item.totalScore}</div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="font-weight-bold mr-2" style={{ color: getScoreColor(percentage), minWidth: 35 }}>
                                  {percentage}%
                                </div>
                                <div style={{ flex: 1, maxWidth: 80 }}>
                                  <Progress value={percentage} color={getScoreColor(percentage)} style={{ height: 6, borderRadius: 3, background: '#f1f3fa' }} />
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="font-weight-bold">{item.gradedBy}</div>
                            </td>
                            <td>{new Date(item.date).toLocaleDateString()}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="text-muted">
                            <i className="ni ni-hat-3" style={{ fontSize: "3rem" }} />
                            <p className="mt-2">No grades records found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                {/* Pagination */}
                <div style={{height: '80px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div className="d-flex flex-row align-items-center" style={{ marginLeft: '1.5rem' }}>
                    <span className="mr-2 text-muted small">Show</span>
                    <UncontrolledDropdown direction="down">
                      <DropdownToggle
                        caret
                        color="white"
                        style={{
                          width: '80px',
                          fontSize: '0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #e1e5e9',
                          background: '#fff',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                          padding: '0.375rem 0.75rem',
                          height: '32px',
                          color: '#32325d',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {itemsPerPage}
                      </DropdownToggle>
                      <DropdownMenu style={{
                        borderRadius: '8px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1)',
                        padding: '4px 0',
                        border: '1px solid #e1e5e9',
                        marginTop: 4,
                        minWidth: '80px',
                      }}>
                        {[5, 10, 20, 50].map(size => (
                          <DropdownItem
                            key={size}
                            onClick={() => setItemsPerPage(size)}
                            style={{
                              backgroundColor: itemsPerPage === size ? '#e7f3ff' : '#fff',
                              color: '#525f7f',
                              fontWeight: itemsPerPage === size ? 600 : 400,
                              fontSize: '0.85rem',
                              padding: '0.5rem 0.75rem',
                              transition: 'background 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#e7f3ff'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = itemsPerPage === size ? '#e7f3ff' : '#fff'}
                          >
                            {size}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </UncontrolledDropdown>
                    <span className="text-muted small" style={{ whiteSpace: 'nowrap' }}>
                      of {totalItems} entries
                    </span>
                  </div>
                  <Pagination size="sm" className="mb-0 justify-content-end" style={{margin: 0, marginRight: '1.5rem'}}>
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink
                        previous
                        onClick={() => handlePageChange(currentPage - 1)}
                        style={{ cursor: currentPage === 1 ? 'default' : 'pointer' }}
                      />
                    </PaginationItem>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(currentPage - 1)}
                          style={{ cursor: 'pointer', textAlign: 'center', minWidth: '28px', fontSize: '0.875rem' }}
                        >
                          {currentPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    <PaginationItem active>
                      <PaginationLink style={{ textAlign: 'center', minWidth: '28px', fontSize: '0.875rem' }}>
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(currentPage + 1)}
                          style={{ cursor: 'pointer', textAlign: 'center', minWidth: '28px', fontSize: '0.875rem' }}
                        >
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    <PaginationItem disabled={currentPage === totalPages}>
                      <PaginationLink
                        next
                        onClick={() => handlePageChange(currentPage + 1)}
                        style={{ cursor: currentPage === totalPages ? 'default' : 'pointer' }}
                      />
                    </PaginationItem>
                  </Pagination>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default GradesLog; 