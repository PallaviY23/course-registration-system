import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { MENU_BY_ROLE, defaultMenuState } from './config/menus';
import {
  getEmailForRoll,
  getPhoneForRoll,
  maskEmailForDisplay,
  maskPhoneForDisplay,
} from './data/mockData';
import { attachAuthHeaders, clearAuthHeaders } from './services/api';

import StudentRegistrationFlow from './pages/student/StudentRegistrationFlow';
import StudentPlaceholder from './pages/student/StudentPlaceholder';

import ProfessorMyCourses from './pages/professor/ProfessorMyCourses';
import ProfessorCreateCourse from './pages/professor/ProfessorCreateCourse';
import ProfessorPriorityRules from './pages/professor/ProfessorPriorityRules';
import ProfessorPrerequisites from './pages/professor/ProfessorPrerequisites';
import ProfessorIncoming from './pages/professor/ProfessorIncoming';

import About from './pages/About';

const STUDENT_VIEWS = {
  'add-drop-25262': StudentRegistrationFlow,
  'summer-25263': StudentRegistrationFlow,
  'hss-26271': StudentRegistrationFlow,
  'pre-reg-26271': StudentRegistrationFlow,
  profile: () => (
    <StudentPlaceholder title="Student Profile">View and update your programme details here.</StudentPlaceholder>
  ),
  password: () => (
    <StudentPlaceholder title="Change Password">
      Password changes will be handled by your institute authentication service.
    </StudentPlaceholder>
  ),
  about: About,
};

const PROFESSOR_VIEWS = {
  'my-courses': ProfessorMyCourses,
  'create-course': ProfessorCreateCourse,
  'priority-rules': ProfessorPriorityRules,
  prerequisites: ProfessorPrerequisites,
  'incoming-requests': ProfessorIncoming,
  'prof-profile': () => (
    <StudentPlaceholder title="Instructor Profile">
      Faculty contact and department information.
    </StudentPlaceholder>
  ),
  'prof-password': () => (
    <StudentPlaceholder title="Change Password">
      Password changes will be handled by your institute authentication service.
    </StudentPlaceholder>
  ),
  about: About,
};

const ADMIN_VIEWS = {
  'admin-password': () => (
    <StudentPlaceholder title="Change Password">
      Password changes will be handled by your institute authentication service.
    </StudentPlaceholder>
  ),
  about: About,
};

const ROLE_VIEWS = {
  student: STUDENT_VIEWS,
  professor: PROFESSOR_VIEWS,
  admin: ADMIN_VIEWS,
};

/** Sidebar sentinel when About is open — never matches a real menu section id */
const ABOUT_SECTION_ID = '__about__';

const SIDEBAR_WIDTH_DEFAULT = 260;
const SIDEBAR_WIDTH_MIN = 180;
const SIDEBAR_WIDTH_MAX = 560;

function App() {
  const [user, setUser] = useState(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(null);

  const menuSections = useMemo(() => {
    if (!user) return [];
    return MENU_BY_ROLE[user.role];
  }, [user]);

  const [openDropdowns, setOpenDropdowns] = useState({});
  const [activeSection, setActiveSection] = useState('Academics');
  const [selectedSub, setSelectedSub] = useState('');
  /** Sidebar visible by default; menu button toggles open/closed */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidthPx, setSidebarWidthPx] = useState(SIDEBAR_WIDTH_DEFAULT);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const sidebarResizeRef = useRef({ startX: 0, startWidth: SIDEBAR_WIDTH_DEFAULT });

  useEffect(() => {
    if (!user) {
      clearAuthHeaders();
      return;
    }
    attachAuthHeaders(user);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const next = defaultMenuState(MENU_BY_ROLE[user.role]);
    setOpenDropdowns(next.openDropdowns);
    setSelectedSub(next.selectedSub);
    setActiveSection(MENU_BY_ROLE[user.role][0]?.id ?? 'Academics');
    setSidebarOpen(true);
  }, [user]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!isResizingSidebar) return undefined;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    const onMove = (e) => {
      const delta = e.clientX - sidebarResizeRef.current.startX;
      const w = sidebarResizeRef.current.startWidth + delta;
      setSidebarWidthPx(
        Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, Math.round(w))),
      );
    };
    const onUp = () => setIsResizingSidebar(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = prevUserSelect;
    };
  }, [isResizingSidebar]);

  const onSidebarResizePointerDown = (e) => {
    if (!sidebarOpen) return;
    e.preventDefault();
    sidebarResizeRef.current = { startX: e.clientX, startWidth: sidebarWidthPx };
    setIsResizingSidebar(true);
  };

  const toggleDropdown = (section) => {
    setOpenDropdowns((prev) => ({ ...prev, [section]: !prev[section] }));
    setActiveSection(section);
  };

  const selectMenuItem = (sectionId, key) => {
    setSelectedSub(key);
    setActiveSection(sectionId);
  };

  const selectAbout = () => {
    setSelectedSub('about');
    setActiveSection(ABOUT_SECTION_ID);
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordMode(true);
    setResetFeedback(null);
    setCredentials((c) => ({ ...c, password: '' }));
  };

  const handleBackToLogin = () => {
    setForgotPasswordMode(false);
    setResetFeedback(null);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    const roll = credentials.username.trim();
    if (!roll) {
      setResetFeedback({ type: 'error', message: 'Please enter your roll number.' });
      return;
    }
    const email = getEmailForRoll(roll);
    const phone = getPhoneForRoll(roll);
    const maskedEmail = maskEmailForDisplay(email);
    const maskedPhone = maskPhoneForDisplay(phone);
    setResetFeedback({
      type: 'success',
      message: `A password reset link has been sent to ${maskedEmail} and an SMS to ${maskedPhone}.`,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = credentials;
    const lowerUser = username.toLowerCase();
    if (username === password && ['student', 'professor', 'admin'].includes(lowerUser)) {
      if (lowerUser === 'student') {
        setUser({
          role: 'student',
          name: 'Aayushman Kumar',
          displayName: 'Aayushman Kumar',
          rollNo: '230029',
          externalId: '230029',
          photoUrl: '/user-avatar.png',
        });
      } else if (lowerUser === 'professor') {
        setUser({
          role: 'professor',
          name: 'Vinay Kumar Gupta',
          displayName: 'Vinay Kumar Gupta',
          facultyId: 'P-CE-1042',
          externalId: 'P-CE-1042',
          photoUrl: '/user-avatar.png',
        });
      } else if (lowerUser === 'admin') {
        setUser({
          role: 'admin',
          name: 'System Administrator',
          displayName: 'System Administrator',
          staffId: 'ADM-001',
          externalId: 'ADM-001',
          photoUrl: '/user-avatar.png',
        });
      }
    } else {
      // eslint-disable-next-line no-alert
      alert('Demo login: use the same word for username and password: student, professor, or admin');
    }
  };

  const handleLogout = () => {
    setUser(null);
    clearAuthHeaders();
  };

  const MainPanel = user ? ROLE_VIEWS[user.role]?.[selectedSub] : null;

  const resetSuccess = forgotPasswordMode && resetFeedback?.type === 'success';

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-box">
          <img src="/logo_black.png" alt="" className="login-logo" />
          <h2>Course Registration Portal</h2>
          {!resetSuccess && (
            <p className="login-sub">
              {forgotPasswordMode ? (
                <>Enter your roll number as registered in the system.</>
              ) : (
                <>
                  Demo: username and password both <code>student</code>, <code>professor</code>, or{' '}
                  <code>admin</code>
                </>
              )}
            </p>
          )}
          {resetSuccess ? (
            <div className="login-form login-reset-complete">
              <p className="login-reset-feedback is-success" role="status">
                {resetFeedback.message}
              </p>
              <div className="login-forgot-row">
                <button type="button" className="login-forgot-link" onClick={handleBackToLogin}>
                  Back to login
                </button>
              </div>
            </div>
          ) : (
            <form
              className="login-form"
              onSubmit={forgotPasswordMode ? handleResetPassword : handleLogin}
            >
              <input
                type="text"
                placeholder={forgotPasswordMode ? 'Roll number' : 'Username'}
                autoComplete={forgotPasswordMode ? 'off' : 'username'}
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
              {!forgotPasswordMode && (
                <>
                  <input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  />
                  <div className="login-forgot-row">
                    <button type="button" className="login-forgot-link" onClick={handleForgotPasswordClick}>
                      Forgot password?
                    </button>
                  </div>
                </>
              )}
              {forgotPasswordMode && (
                <div className="login-forgot-row">
                  <button type="button" className="login-forgot-link" onClick={handleBackToLogin}>
                    Back to login
                  </button>
                </div>
              )}
              {resetFeedback && resetFeedback.type === 'error' && (
                <p className="login-reset-feedback is-error" role="status">
                  {resetFeedback.message}
                </p>
              )}
              <button type="submit">{forgotPasswordMode ? 'Reset password' : 'Login'}</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <main className="main-area">
        <aside
          id="app-sidebar"
          className={`sidebar ${sidebarOpen ? '' : 'sidebar--collapsed'} ${
            isResizingSidebar ? 'sidebar--resizing' : ''
          }`}
          style={{ width: sidebarOpen ? sidebarWidthPx : 0 }}
          aria-hidden={!sidebarOpen}
        >
            {sidebarOpen ? (
              <div
                className="sidebar-resize-handle"
                onMouseDown={onSidebarResizePointerDown}
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize navigation panel"
              />
            ) : null}
            <div className="sidebar-header">
              <img src="/logo_white.png" alt="" className="sidebar-logo-img" />
              <p className="role-label">{user.role.toUpperCase()} panel</p>
            </div>

            <nav className="sidebar-nav">
              <div className="sidebar-nav-scroll">
                {menuSections.map((section) => (
                  <div key={section.id} className="menu-group">
                    <div
                      className={`nav-item ${
                        activeSection === section.id && selectedSub !== 'about' ? 'active' : ''
                      }`}
                      onClick={() => toggleDropdown(section.id)}
                      onKeyDown={(ev) => ev.key === 'Enter' && toggleDropdown(section.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <span>{section.id}</span>
                      <span className="arrow-icon">{openDropdowns[section.id] ? '⇩' : '⇨'}</span>
                    </div>
                    <div className={`sliding-menu ${openDropdowns[section.id] ? 'open' : ''}`}>
                      <div className="sub-menu">
                        {section.items.map((item) => (
                          <div
                            key={item.key}
                            className={`sub-item-header ${selectedSub === item.key ? 'selected' : ''}`}
                            onClick={() => selectMenuItem(section.id, item.key)}
                            onKeyDown={(ev) =>
                              ev.key === 'Enter' && selectMenuItem(section.id, item.key)
                            }
                            role="button"
                            tabIndex={0}
                          >
                            {item.label}
                            {item.status === 'open' && <span className="status-open">Open</span>}
                            {item.status === 'closed' && <span className="status-closed">Closed</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="sidebar-nav-footer">
                <div
                  className={`nav-item ${selectedSub === 'about' ? 'active' : ''}`}
                  onClick={selectAbout}
                  onKeyDown={(ev) => ev.key === 'Enter' && selectAbout()}
                  role="button"
                  tabIndex={0}
                >
                  <span>About</span>
                </div>
              </div>
            </nav>
        </aside>

        <div className="main-column">
          <header className="header">
            <div className="header-left">
              <button
                type="button"
                className="header-menu-btn"
                onClick={() => setSidebarOpen((open) => !open)}
                aria-expanded={sidebarOpen}
                aria-controls="app-sidebar"
                aria-label="Toggle sidebar menu"
              >
                <svg className="header-menu-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"
                  />
                </svg>
              </button>
            </div>
            <div className="header-right">
              {user.displayName && (user.rollNo || user.facultyId || user.staffId) ? (
                <div className="header-user">
                  <div className="header-avatar-wrap">
                    <img
                      src={user.photoUrl || '/user-avatar.png'}
                      alt=""
                      className="header-avatar"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="header-user-text">
                    <span className="header-user-name">{user.displayName}</span>
                    <span className="header-user-id">
                      {user.rollNo || user.facultyId || user.staffId}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="header-welcome">
                  Welcome, <strong>{user.name}</strong>
                </span>
              )}
              <button
                type="button"
                className="header-menu-btn"
                onClick={handleLogout}
                aria-label="Log out"
              >
                <svg className="header-menu-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                  />
                </svg>
              </button>
            </div>
          </header>

          <section className="table-container">
            {MainPanel ? (
              <MainPanel user={user} viewKey={selectedSub} />
            ) : (
              <p className="panel-muted">Select a menu item.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
