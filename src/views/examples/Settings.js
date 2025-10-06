import React, { useState } from 'react';

const Settings = () => {
  // Demo state
  const [email, setEmail] = useState('user@example.com');
  const [name, setName] = useState('John Doe');
  const [profilePic, setProfilePic] = useState(null);
  const [notifications, setNotifications] = useState({
    assignments: true,
    announcements: true,
    grades: true,
  });
  const [theme, setTheme] = useState('light');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [backupCodes] = useState([
    'ABCD-EFGH', 'IJKL-MNOP', 'QRST-UVWX', 'YZ12-3456', '7890-1234'
  ]);

  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handle2FAToggle = () => {
    if (!twoFAEnabled) setShow2FASetup(true);
    else setTwoFAEnabled(false);
  };

  const handle2FASetup = () => {
    setTwoFAEnabled(true);
    setShow2FASetup(false);
  };

  return (
    <div className="settings-container" style={{ maxWidth: 600, margin: 'auto', padding: 16 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Settings</h2>
      {/* Account Section */}
      <section className="settings-section">
        <h4>Account</h4>
        <div className="settings-field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="settings-field">
          <label>Password</label>
          <input type="password" value="********" readOnly />
          <button style={{ marginLeft: 8 }}>Change</button>
        </div>
        <div className="settings-field">
          <label>Two-Factor Authentication (2FA)</label>
          <input type="checkbox" checked={twoFAEnabled} onChange={handle2FAToggle} />
          <span style={{ marginLeft: 8 }}>{twoFAEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
        {show2FASetup && (
          <div className="settings-2fa-setup" style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, marginTop: 8 }}>
            <h5>Set up 2FA</h5>
            <p>Scan this QR code with your authenticator app:</p>
            <div style={{ width: 120, height: 120, background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, margin: 'auto' }}>
              <span>QR CODE</span>
            </div>
            <p style={{ marginTop: 8 }}>Or enter this code: <b>123 456</b></p>
            <p>Backup codes:</p>
            <ul style={{ columns: 2 }}>
              {backupCodes.map(code => <li key={code}>{code}</li>)}
            </ul>
            <button onClick={handle2FASetup} style={{ marginTop: 8 }}>Finish Setup</button>
            <button onClick={() => setShow2FASetup(false)} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        )}
      </section>
      <hr />
      {/* Profile Section */}
      <section className="settings-section">
        <h4>Profile</h4>
        <div className="settings-field">
          <label>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="settings-field">
          <label>Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleProfilePicChange} />
          {profilePic && <img src={profilePic} alt="Profile" style={{ width: 48, height: 48, borderRadius: '50%', marginLeft: 8 }} />}
        </div>
      </section>
      <hr />
      {/* Notifications Section */}
      <section className="settings-section">
        <h4>Notifications</h4>
        {Object.keys(notifications).map(key => (
          <div className="settings-field" key={key}>
            <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
            <input
              type="checkbox"
              checked={notifications[key]}
              onChange={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
            />
          </div>
        ))}
      </section>
      <hr />
      {/* Theme Section */}
      <section className="settings-section">
        <h4>Theme</h4>
        <div className="settings-field">
          <label>Dark Mode</label>
          <input type="checkbox" checked={theme === 'dark'} onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        </div>
      </section>
      <style>{`
        .settings-container { font-family: inherit; }
        .settings-section { margin-bottom: 24px; }
        .settings-field { display: flex; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
        .settings-field label { min-width: 120px; margin-right: 8px; font-weight: 500; }
        .settings-field input[type="text"], .settings-field input[type="email"], .settings-field input[type="password"] {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        @media (max-width: 600px) {
          .settings-container { padding: 8px; }
          .settings-field { flex-direction: column; align-items: flex-start; }
          .settings-field label { margin-bottom: 4px; }
        }
      `}</style>
    </div>
  );
};

export default Settings; 