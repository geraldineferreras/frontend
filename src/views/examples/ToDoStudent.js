import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardBody, Button, Row, Col, Nav, NavItem, NavLink, Input, Badge } from "reactstrap";
import classnames from "classnames";
import apiService from "../../services/api";

// Enrolled classes will be fetched from API

const tabList = [
  { key: "assigned", label: "Assigned" },
  { key: "missing", label: "Missing" },
  { key: "completed", label: "Completed" }
];

// Helper to group tasks by due date, with special groups for 'completed' tab
function groupTasksByDueDate(tasks, tab) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setDate(startOfWeek.getDate() - 1);

  if (tab === 'completed') {
    // Google Classroom-like grouping for Completed tab
    const groups = {
      'No due date': [],
      'Completed early': [],
      'This week': [],
      'Last week': [],
      'Earlier': []
    };
    tasks.forEach(task => {
      if (!task.due_date) {
        groups['No due date'].push(task);
      } else {
        const due = new Date(task.due_date);
        // Completed early: due date is after completion date
        if (task.submitted_at && due > new Date(task.submitted_at)) {
          groups['Completed early'].push(task);
        } else if (due >= startOfWeek && due <= endOfWeek) {
          groups['This week'].push(task);
        } else if (due >= startOfLastWeek && due <= endOfLastWeek) {
          groups['Last week'].push(task);
        } else if (due < startOfLastWeek) {
          groups['Earlier'].push(task);
        } else {
          groups['No due date'].push(task);
        }
      }
    });
    return groups;
  } else {
    // Default grouping for assigned/missing
    const startOfNextWeek = new Date(endOfWeek);
    startOfNextWeek.setDate(endOfWeek.getDate() + 1);
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
    const groups = {
      'No due date': [],
      'This week': [],
      'Next week': [],
      'Later': []
    };
    tasks.forEach(task => {
      if (!task.due_date) {
        groups['No due date'].push(task);
      } else {
        const due = new Date(task.due_date);
        if (due >= startOfWeek && due <= endOfWeek) {
          groups['This week'].push(task);
        } else if (due >= startOfNextWeek && due <= endOfNextWeek) {
          groups['Next week'].push(task);
        } else if (due > endOfNextWeek) {
          groups['Later'].push(task);
        } else {
          groups['No due date'].push(task);
        }
      }
    });
    return groups;
  }
}

const ToDoStudent = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  // State for tasks and loading
  const [tasks, setTasks] = useState({ assigned: [], missing: [], completed: [] });
  const [enrolledClasses, setEnrolledClasses] = useState([{ code: "ALL", name: "All classes" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Parse tab and classCode from URL
  const pathParts = pathname.split("/");
  const tab = pathParts[2] || "assigned";
  const classCode = (pathParts[3] || "ALL").toUpperCase();

  // Fetch enrolled classes
  const fetchEnrolledClasses = async () => {
    try {
      const response = await apiService.getStudentClasses();
      if (response.status && response.data) {
        const classes = [{ code: "ALL", name: "All classes" }];
        response.data.forEach(classInfo => {
          classes.push({
            code: classInfo.class_code || classInfo.code,
            name: classInfo.subject_name || classInfo.name
          });
        });
        setEnrolledClasses(classes);
      }
    } catch (error) {
      console.error('Error fetching enrolled classes:', error);
      // Keep the default "All classes" option
    }
  };

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get the student's enrolled classes
      const classesResponse = await apiService.getStudentClasses();
      if (!classesResponse.status || !classesResponse.data) {
        setError('Failed to load enrolled classes');
        setTasks({ assigned: [], missing: [], completed: [] });
        return;
      }

      const enrolledClasses = classesResponse.data;
      
      // Fetch tasks for each class and combine results
      const allAssignedTasks = [];
      const allMissingTasks = [];
      const allCompletedTasks = [];

      // Fetch tasks for each enrolled class
      for (const classInfo of enrolledClasses) {
        const classCode = classInfo.class_code || classInfo.code;
        if (!classCode) continue;

        try {
          const [assignedResponse, missingResponse, completedResponse] = await Promise.all([
            apiService.getStudentTasks({ status: 'assigned', classCode }),
            apiService.getStudentTasks({ status: 'missing', classCode }),
            apiService.getStudentTasks({ status: 'completed', classCode })
          ]);

          // Add class information to each task
          if (assignedResponse.status && assignedResponse.data) {
            allAssignedTasks.push(...assignedResponse.data.map(task => ({
              ...task,
              class_code: classCode,
              subject_name: classInfo.subject_name || classInfo.name
            })));
          }

          if (missingResponse.status && missingResponse.data) {
            allMissingTasks.push(...missingResponse.data.map(task => ({
              ...task,
              class_code: classCode,
              subject_name: classInfo.subject_name || classInfo.name
            })));
          }

          if (completedResponse.status && completedResponse.data) {
            allCompletedTasks.push(...completedResponse.data.map(task => ({
              ...task,
              class_code: classCode,
              subject_name: classInfo.subject_name || classInfo.name
            })));
          }
        } catch (classError) {
          console.warn(`Error fetching tasks for class ${classCode}:`, classError);
          // Continue with other classes even if one fails
        }
      }

      setTasks({
        assigned: allAssignedTasks,
        missing: allMissingTasks,
        completed: allCompletedTasks
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message || 'Failed to load tasks');
      setTasks({ assigned: [], missing: [], completed: [] });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchEnrolledClasses();
    fetchTasks();
  }, []);

  // Tab switching
  const handleTabClick = (tabKey) => {
    navigate(`/student/${tabKey}/${classCode}`);
  };

  // Class filter switching
  const handleClassChange = (e) => {
    const newClass = e.target.value;
    navigate(`/student/${tab}/${newClass}`);
  };

  // Get current tab tasks filtered by class if needed
  const currentTasks = (tasks[tab] || []).filter(task => {
    if (classCode === 'ALL') return true;
    return task.class_code === classCode || task.classroom_code === classCode;
  });

  // Add collapsible state for each group
  const groupKeys = tab === 'completed'
    ? ['No due date', 'Completed early', 'This week', 'Last week', 'Earlier']
    : ['No due date', 'This week', 'Next week', 'Later'];
  const [collapsed, setCollapsed] = useState(
    Object.fromEntries(groupKeys.map(k => [k, false]))
  );

  const grouped = groupTasksByDueDate(currentTasks, tab);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Helper function to get task status badge color
  const getStatusBadgeColor = (taskStatus) => {
    switch (taskStatus) {
      case 'assigned':
        return { background: '#e6e8ff', color: '#5e72e4' };
      case 'missing':
        return { background: '#ffe6e6', color: '#e53e3e' };
      case 'completed':
        return { background: '#e6ffe6', color: '#38a169' };
      default:
        return { background: '#e6e8ff', color: '#5e72e4' };
    }
  };

  return (
    <div style={{ background: "#f7fafd", minHeight: "100vh" }}>
      <div className="container py-4">
        <Row className="mb-4 align-items-center todo-tabs-mobile">
          <Col md="8">
            <Nav tabs style={{ borderBottom: "2px solid #e3e3e3" }}>
              {tabList.map(t => (
                <NavItem key={t.key}>
                  <NavLink
                    className={classnames({ active: tab === t.key })}
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      color: tab === t.key ? "#2096ff" : "#888",
                      border: "none",
                      borderBottom: tab === t.key ? "3px solid #2096ff" : "none",
                      background: "none",
                      padding: "12px 28px"
                    }}
                    onClick={() => handleTabClick(t.key)}
                  >
                    {t.label}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </Col>
          <Col md="4" className="d-flex justify-content-end align-items-center">
            <div className="todo-class-filter-mobile" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <Input
                type="select"
                value={classCode}
                onChange={handleClassChange}
                style={{
                  border: 'none',
                  background: '#f3f7fa',
                  borderRadius: 18,
                  width: 170,
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#2096ff',
                  padding: '7px 28px 7px 14px',
                  boxShadow: 'none',
                  appearance: 'none',
                  outline: 'none',
                  minHeight: 36,
                  marginRight: 0,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0
                }}
              >
                {enrolledClasses.map(cls => (
                  <option key={cls.code} value={cls.code}>{cls.name}</option>
                ))}
              </Input>
              <span style={{
                color: '#2096ff',
                fontWeight: 700,
                fontSize: 18,
                background: '#e6e8ff',
                borderRadius: '0 12px 12px 0',
                padding: '4px 14px',
                minWidth: 36,
                textAlign: 'center',
                display: 'inline-block',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0
              }}>{currentTasks.length}</span>
            </div>
          </Col>
        </Row>
        
        {loading && (
          <Row>
            <Col md="12" className="text-center py-5">
              <div style={{ color: '#2096ff', fontSize: 16 }}>
                <i className="ni ni-spinner" style={{ marginRight: 8 }} />
                Loading tasks...
              </div>
            </Col>
          </Row>
        )}

        {error && (
          <Row>
            <Col md="12" className="text-center py-5">
              <div style={{ color: '#e53e3e', fontSize: 16 }}>
                <i className="ni ni-alert-circle" style={{ marginRight: 8 }} />
                {error}
              </div>
            </Col>
          </Row>
        )}

        {!loading && !error && (
          <Row>
            <Col md="12">
              {Object.entries(grouped).map(([group, groupTasks]) => (
                <div key={group} style={{ marginBottom: 32 }}>
                  <div
                    className="todo-group-header-mobile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 15,
                      color: '#444',
                      background: '#f7fafd',
                      borderBottom: '1px solid #e3e3e3',
                      padding: '12px 0',
                    }}
                    onClick={() => setCollapsed(c => ({ ...c, [group]: !c[group] }))}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {group}
                      <span style={{
                        color: '#2096ff',
                        fontWeight: 700,
                        fontSize: 13,
                        background: '#e6e8ff',
                        borderRadius: 10,
                        padding: '2px 12px',
                        minWidth: 28,
                        textAlign: 'center',
                        marginLeft: 8,
                        display: 'inline-block',
                      }}>{groupTasks.length}</span>
                    </span>
                    <span style={{ marginLeft: 12, color: '#aaa', fontSize: 15 }}>
                      {collapsed[group] ? '▼' : '▲'}
                    </span>
                  </div>
                  {!collapsed[group] && groupTasks.length > 0 && (
                    <Card className="shadow-sm rounded-lg todo-task-card-mobile" style={{ border: 'none', marginTop: 0 }}>
                      <CardBody>
                        {groupTasks.map(task => (
                          <div key={task.id} className="d-flex align-items-center mb-4" style={{ borderBottom: '1px solid #f0f1f6', paddingBottom: 18 }}>
                            <div style={{
                              width: 48,
                              height: 48,
                              borderRadius: 16,
                              background: '#e3f0ff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 18
                            }}>
                              <i className="ni ni-bullet-list-67" style={{ fontSize: 22, color: '#2096ff' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="todo-task-title-mobile" style={{ fontWeight: 700, fontSize: 16 }}>
                                {task.title || task.task_title}
                              </div>
                              <div className="todo-task-class-mobile" style={{ color: '#888', fontSize: 13 }}>
                                {task.subject_name || task.class_name || 'Unknown Class'}
                              </div>
                              <div className="todo-task-date-mobile" style={{ color: '#aaa', fontSize: 12 }}>
                                Posted {formatDate(task.created_at || task.posted_date)}
                              </div>
                            </div>
                            <Badge 
                              className="todo-task-badge-mobile" 
                              style={{ 
                                fontSize: 12, 
                                fontWeight: 500, 
                                borderRadius: 8, 
                                padding: '6px 14px',
                                ...getStatusBadgeColor(task.status || tab)
                              }}
                            >
                              {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </CardBody>
                    </Card>
                  )}
                  {!collapsed[group] && groupTasks.length === 0 && (
                    <div className="text-center text-muted" style={{ fontSize: 15, margin: '32px 0' }}>
                      No {tab} tasks for this group.
                    </div>
                  )}
                </div>
              ))}
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

// Responsive styles for mobile
const style = document.createElement('style');
style.innerHTML = `
@media (max-width: 600px) {
  .todo-tabs-mobile {
    flex-direction: column !important;
    align-items: stretch !important;
  }
  .todo-tabs-mobile .nav {
    flex-direction: column !important;
    width: 100%;
  }
  .todo-tabs-mobile .nav-item {
    width: 100%;
  }
  .todo-tabs-mobile .nav-link {
    width: 100%;
    text-align: left;
    padding: 14px 12px;
    font-size: 16px !important;
  }
  .todo-class-filter-mobile {
    width: 100% !important;
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .todo-class-filter-mobile select {
    width: 70% !important;
    font-size: 14px !important;
    padding: 8px 10px !important;
  }
  .todo-class-filter-mobile span {
    font-size: 15px !important;
    padding: 6px 12px !important;
  }
  .todo-group-header-mobile {
    font-size: 14px !important;
    padding: 10px 0 !important;
  }
  .todo-group-header-mobile span {
    font-size: 12px !important;
    padding: 2px 8px !important;
  }
  .todo-task-card-mobile {
    margin-bottom: 18px !important;
    padding: 10px !important;
  }
  .todo-task-card-mobile .ni {
    font-size: 18px !important;
    width: 36px !important;
    height: 36px !important;
  }
  .todo-task-title-mobile {
    font-size: 15px !important;
  }
  .todo-task-class-mobile {
    font-size: 12px !important;
  }
  .todo-task-date-mobile {
    font-size: 11px !important;
  }
  .todo-task-badge-mobile {
    font-size: 11px !important;
    padding: 4px 10px !important;
  }
}
`;
document.head.appendChild(style);

export default ToDoStudent; 