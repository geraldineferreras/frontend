/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

=========================================================

*/

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
  Alert,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import Select from 'react-select';
import GoogleOAuthButton from "../../components/GoogleOAuthButton";
import apiService from "../../services/api";
import "../../assets/css/react-select-mobile-fix.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "",
    full_name: "",
    email: "",
    student_num: "",
    program: "",
    section_id: "",
    contact_num: "",
    cityMunicipality: "",
    barangay: "",
    province: "",
    password: "",
    confirmPassword: ""
  });
  const [passwordVisible, setPasswordVisible] = useState({
    password: false,
    confirmPassword: false
  });
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [autoDetectedRole, setAutoDetectedRole] = useState("");
  const contactInputRef = useRef(null);
  // Options for react-select place selectors

  // Pampanga data
  const pampangaData = {
    "province": "Pampanga",
    "LGUs": {
      "Angeles City": {
        "barangays": ["Agapito del Rosario","Amsic","Anunas","Balibago","Capaya","Claro M. Recto","Cuayan","Cutcut","Cutud","Lourdes North West","Lourdes Sur","Lourdes Sur East","Malabañas","Margot","Mining","Ninoy Aquino (Marisol)","Pampang","Pandan","Pulung Cacutud","Pulung Maragul","Pulungbulu","Salapungan","San Jose","San Nicolas","Santa Teresita","Santa Trinidad","Santo Cristo","Santo Domingo","Santo Rosario (Poblacion)","Sapalibutad","Sapangbato","Tabun","Virgen Delos Remedios"]
      },
      "Apalit": {
        "barangays": ["Balucuc","Calantipe","Cansinala","Capalangan","Colgante","Paligui","Sampaloc","San Juan (Poblacion)","San Vicente","Sucad","Sulipan","Tabuyuc"]
      },
      "Arayat": {
        "barangays": ["Arenas","Baliti","Batasan","Buensuceso","Candating","Gatiawin","Guemasan","La Paz (Turu)","Lacmit","Lacquios","Mangga-Cacutud","Mapalad","Palinlang","Paralaya","Plazang Luma","Poblacion","San Agustin Norte","San Agustin Sur","San Antonio","San Jose Mesulo","San Juan Baño","San Mateo","San Nicolas","San Roque Bitas","Cupang (Santa Lucia)","Matamo (Santa Lucia)","Santo Niño Tabuan","Suclayin","Telapayong","Kaledian (Camba)"]
      },
      "Bacolor": {
        "barangays": ["Balas","Cabalantian","Calambangan","Cabetican","Calibutbut","Concepcion","Dolores","Duat","Macabacle","Magliman","Maliwalu","Mesalipit","Parulog","Potrero","San Antonio","San Isidro","San Vicente","Santa Barbara","Santa Ines","Talba","Tinajero"]
      },
      "Candaba": {
        "barangays": ["Bahay Pare","Bambang","Barangca","Barit","Buas (Poblacion)","Cuayang Bugtong","Dalayap","Dulong Ilog","Gulap","Lanang","Lourdes","Magumbali","Mandasig","Mandili","Mangga","Mapaniqui","Paligui","Pangclara","Pansinao","Paralaya (Poblacion)","Pasig","Pescadores (Poblacion)","Pulong Gubat","Pulong Palazan","Salapungan","San Agustin (Poblacion)","Santo Rosario","Tagulod","Talang","Tenejero","Vizal San Pablo","Vizal Santo Cristo","Vizal Santo Niño"]
      },
      "Floridablanca": {
        "barangays": ["Anon","Apalit","Basa Air Base","Benedicto","Bodega","Cabangcalan","Calantas","Carmencita","Consuelo","Culubasa","Dampe","Del Carmen","Fortuna","Gutad","Mabical","Maligaya","Mawaque","Nabuclod","Pabanlag","Paguiruan","Palmayo","Pandaguirig","Poblacion","San Antonio","San Isidro","San Jose","San Nicolas","San Pedro","San Ramon","San Roque","Santa Monica","Solib","Santo Rosario","Valdez"]
      },
      "Guagua": {
        "barangays": ["Ascomo","Bancal","Betis","Bulaon","Jose Abad Santos (Siran)","Lambac","Magsaysay","Maquiapo","Natividad","Plaza Burgos","Pulungmasle","Rizal","San Agustin","San Juan Bautista","San Juan Nepomuceno","San Miguel","San Nicolas 1st","San Nicolas 2nd","Santa Ines","Santa Ursula","San Pablo","San Matias","San Isidro","San Antonio"]
      },
      "Lubao": {
        "barangays": ["Bancal Pugad","Bancal Sinubli","Baruya","Calangain","Concepcion","Del Carmen","Don Ignacio Dimson","Prado Siongco","Remedios","San Agustin","San Antonio","San Francisco","San Isidro","San Jose Apunan","San Juan (Poblacion)","San Matias","San Miguel","San Nicolas 1st","San Nicolas 2nd","San Pedro Palcarangan","Santa Barbara","Santa Catalina","Santa Cruz","Santa Lucia (Poblacion)","Santa Maria","Santa Monica","Santa Rita","Santa Teresa 1st","Santa Teresa 2nd","Santo Cristo","Santo Domingo","Santo Rosario (Poblacion)","Santo Tomas (Poblacion)","Sapang Balas","Sapang Maisac"]
      },
      "Mabalacat": {
        "barangays": ["Atlu-Bola","Bical","Bundagul","Cacutud","Calumpang","Camachiles","Dapdap","Dau","Dolores","Duquit","Lakandula","Mabiga","Macapagal Village","Mamatitang","Mangalit","Marcos Village","Mawaque","Paralayunan","Poblacion","San Francisco","San Joaquin","Santa Ines","Santa Maria","Santo Rosario","Sapang Balen","Sapang Biabas","Tabun"]
      },
      "Macabebe": {
        "barangays": ["Caduang Tete","Candelaria","Castuli","Consuelo","Culo","Dalayap","Duala","San Gabriel","San Isidro","San Jose","San Juan","San Rafael","San Vicente","Santa Maria","Santo Niño","Saplad","Tacasan","Telacsan"]
      },
      "Magalang": {
        "barangays": ["Ayala","Bucanan","Camias","Dolores","Escaler","La Paz","Navaling","San Agustin","San Antonio","San Francisco","San Ildefonso","San Isidro","San Jose","San Miguel","San Nicolas I","San Nicolas II (Concepcion)","San Pablo","San Pedro I","San Pedro II","San Roque","San Vicente","Santa Cruz","Santa Lucia","Santa Maria","Santo Niño","Santo Rosario","Turu"]
      },
      "Masantol": {
        "barangays": ["Alauli","Bagang","Balibago","Bebe Anac","Bebe Matua","Bulacus","Cambasi","Malauli","Nigui","Palimpe","Puti","Sagrada (Tibagin)","San Agustin (Caingin)","San Isidro Anac","San Isidro Matua (Poblacion)","San Nicolas (Poblacion)","San Pedro","Santa Cruz","Santa Lucia Anac (Poblacion)","Santa Lucia Matua","Santa Lucia Paguiba","Santa Lucia Wakas","Santa Monica (Caingin)","Santo Niño","Sapang Kawayan","Sua"]
      },
      "Mexico": {
        "barangays": ["Acli","Anao","Balas","Buenavista","Camuning","Cawayan","Concepcion","Culubasa","Divisoria","Dolores (Piring)","Eden","Gandus","Lagundi","Laput","Laug","Masamat","Masangsang (Santo Cristo)","Nueva Victoria","Pandacaqui","Pangatlan","Panipuan","Parian (Poblacion)","Sabanilla","San Antonio","San Carlos","San Jose Malino","San Jose Matulid","San Juan","San Lorenzo","San Miguel","San Nicolas","San Pablo","San Patricio","San Rafael","San Roque","San Vicente","Santa Cruz","Santa Maria","Santo Domingo","Santo Rosario","Sapang Maisac","Suclaban","Tangle"]
      },
      "Minalin": {
        "barangays": ["Bulac","Dawe","Maniango","Saplad","San Francisco de Asisi (San Francisco Uno)","San Francisco Javier (San Francisco Dos)","Santa Catalina","San Nicolas (Poblacion)","Santo Rosario","San Pedro","Santa Rita","Santo Domingo","Santa Maria","Lourdes","San Isidro"]
      },
      "Porac": {
        "barangays": ["Babo Pangulo","Babo Sacan (Guanson)","Balubad","Calzadang Bayu","Camias","Cangatba","Diaz","Dolores (Hacienda Dolores)","Inararo (Aetas)","Jalung","Mancatian","Manibaug Libutad","Manibaug Paralaya","Manibaug Pasig","Manuali","Mitla Proper","Palat","Pias","Pio","Planas","Poblacion","Pulung Santol","Salu","San Jose Mitla","Santa Cruz","Sapang Uwak (Aetas)","Sepung Bulaun (Baidbid)","Siñura (Seniora)","Villa Maria (Aetas)"]
      },
      "San Fernando City": {
        "barangays": ["Alasas","Baliti","Bulaon","Calulut","Del Carmen","Del Pilar","Del Rosario","Dela Paz Norte","Dela Paz Sur","Dolores","Juliana","Lara","Lourdes","Magliman","Maimpis","Malino","Malpitic","Pandaras","Panipuan","Pulung Bulo","Quebiawan","Saguin","San Agustin","San Felipe","San Isidro","San Jose","San Nicolas","San Pedro","San Juan","Santa Lucia","Santa Teresita","Santo Niño","Santo Rosario","Sindalan","Telabastagan"]
      },
      "San Luis": {
        "barangays": ["San Agustín","San Carlos","San Isidro","San José","San Juan","San Nicolás","San Roque","San Sebastián","Santa Catalina","Santa Cruz Pambilog","Santa Cruz Población","Santa Lucia","Santa Mónica","Santa Rita","Santo Niño","Santo Rosario","Santo Tomás"]
      },
      "San Simon": {
        "barangays": ["Concepcion","De La Paz","San Juan (Poblacion)","San Agustin","San Isidro","San Jose","San Miguel","San Nicolas","San Pablo Libutad","San Pablo Proper","San Pedro","Santa Cruz","Santa Monica","Santo Niño"]
      },
      "Santa Ana": {
        "barangays": ["San Agustin (Sumpung)","San Bartolome (Patayum)","San Isidro (Quenabuan)","San Joaquin (Poblacion, Canukil)","San Jose (Catmun)","San Juan (Tinajeru)","San Nicolas (Sepung Ilug)","San Pablo (Darabulbul)","San Pedro (Calumpang)","San Roque (Tuclung)","Santa Lucia (Calinan)","Santa Maria (Balen Bayu)","Santiago (Barrio Libutad)","Santo Rosario (Pagbatuan)"]
      },
      "Santa Rita": {
        "barangays": ["Becuran","Dila-dila","San Agustin","San Basilio","San Isidro","San Jose (Poblacion)","San Juan","San Matias (Poblacion)","Santa Monica","San Vicente (Poblacion)"]
      },
      "Santo Tomas": {
        "barangays": ["Moras De La Paz","Poblacion","San Bartolome","San Matias","San Vicente","Santo Rosario (Pau)","Sapa (Santo Niño)"]
      },
      "Sasmuan": {
        "barangays": ["Batang 1st","Batang 2nd","Mabuanbuan","Malusac","Sabitanan","San Antonio","San Nicolas 1st","San Nicolas 2nd","San Pedro","Santa Lucia (Poblacion)","Santa Monica","Santo Tomas"]
      }
    }
  };

  // Get cities for dropdown
  const cities = Object.keys(pampangaData.LGUs);
  const cityOptions = (cities || []).map(c => ({ value: c, label: c }));
  
  // Get barangays for selected city
  const getBarangays = (city) => {
    return city ? pampangaData.LGUs[city]?.barangays || [] : [];
  };
  const barangayOptions = getBarangays(formData.cityMunicipality).map(b => ({ value: b, label: b }));

  // Function to detect role from email
  const detectRoleFromEmail = (email) => {
    if (!email) {
      return null;
    }
    
    // Only auto-detect role for PSU emails (@pampangastateu.edu.ph)
    if (email.includes('@pampangastateu.edu.ph')) {
      const localPart = email.replace('@pampangastateu.edu.ph', '');
      
      // Check if it's a student number (10 digits starting with year)
      if (/^\d{10}$/.test(localPart)) {
        return 'student';
      }
      
      // Check if it's initials (e.g., a.ferrer)
      if (/^[a-z]\.[a-z]+$/i.test(localPart)) {
        return 'teacher';
      }
    }
    
    // For non-PSU emails, no auto-detection
    return null;
  };

  // Auto-detect role when email changes
  const handleEmailChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      email: value
    }));
    
    const detectedRole = detectRoleFromEmail(value);
    setAutoDetectedRole(detectedRole);
    
    // Auto-select role if detected
    if (detectedRole && !formData.role) {
      setFormData(prev => ({
        ...prev,
        role: detectedRole
      }));
    }
  };

  const handleGoogleSuccess = (userData, variant) => {
    console.log('Google registration successful:', userData);
    setSuccess("Registration successful! Redirecting...");
    setTimeout(() => {
      // Navigate based on user role
      const role = userData.role || (userData.user && userData.user.role);
      if (role === "student") {
        navigate("/student/index");
      } else if (role === "admin") {
        navigate("/admin/index");
      } else if (role === "teacher") {
        navigate("/teacher/index");
      } else {
        navigate("/");
      }
    }, 1500);
  };

  const handleGoogleError = (errorMessage) => {
    setError(errorMessage);
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) return "";
    
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One lowercase letter");
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One uppercase letter");
    }
    
    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("One number");
    }
    
    // Special character check
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One special character");
    }
    
    if (score === 5) return { strength: "strong", score, feedback: [] };
    if (score >= 3) return { strength: "medium", score, feedback };
    return { strength: "weak", score, feedback };
  };

  const [passwordStrength, setPasswordStrength] = useState({ strength: "", score: 0, feedback: [] });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special handling for contact number with +63 prefix
    if (name === 'contact_num') {
      let digits = (value || '').replace(/\D/g, '');
      // Remove country code if user typed it
      if (digits.startsWith('63')) {
        digits = digits.slice(2);
      }
      // Only last 10 digits
      if (digits.length > 10) {
        digits = digits.slice(-10);
      }
      setFormData(prev => ({ ...prev, contact_num: digits }));
      return;
    }

    // Special handling for province changes - clear city and barangay when province changes
    if (name === 'province') {
      setFormData(prev => ({
        ...prev,
        province: value,
        cityMunicipality: '', // Clear city when province changes
        barangay: '' // Clear barangay when province changes
      }));
      return;
    }

    // Special handling for city changes - clear barangay when city changes
    if (name === 'cityMunicipality') {
      setFormData(prev => ({
        ...prev,
        cityMunicipality: value,
        barangay: '' // Clear barangay when city changes
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If role is manually changed, clear auto-detected role
    if (name === 'role') {
      setAutoDetectedRole("");
    }
  };

  const togglePasswordVisibility = (fieldName) => {
    setPasswordVisible(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const validateForm = () => {
    if (!formData.role) {
      setError("Please select a role");
      return false;
    }
    
    // Check if selected role matches email pattern (only for PSU emails)
    if (autoDetectedRole && formData.role !== autoDetectedRole) {
      setError(`PSU email pattern indicates this should be a ${autoDetectedRole} account. Please select the correct role or use a different email.`);
      return false;
    }
    
    if (!formData.full_name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    
    // Validate email format and domain
    // Only enforce @pampangastateu.edu.ph for Google OAuth users
    // For manual form registration, allow any email domain
    if (!formData.email.includes('@pampangastateu.edu.ph')) {
      // Allow any email domain for manual registration
      // The @pampangastateu.edu.ph requirement is only for Google OAuth
      console.log('Manual registration with non-PSU email allowed:', formData.email);
    }
    
    if (formData.role === "student" && !formData.student_num.trim()) {
      setError("Student number is required for students");
      return false;
    }
    
    if (formData.role === "student" && !formData.program.trim()) {
      setError("Program/Course is required for students");
      return false;
    }
    
    if (formData.role === "teacher" && !formData.program.trim()) {
      setError("Department/Program is required for teachers");
      return false;
    }
    
    if (formData.role === "admin" && !formData.program.trim()) {
      setError("Department/Program is required for admins");
      return false;
    }
    
    if (!formData.contact_num.trim()) {
      setError("Contact number is required");
      return false;
    }
    // Must be exactly 10 digits after +63
    if (!/^\d{10}$/.test(formData.contact_num)) {
      setError("Contact number must be 10 digits after +63");
      return false;
    }
    
    if (!formData.cityMunicipality.trim() || !formData.barangay.trim() || !formData.province.trim()) {
      setError("All address fields are required");
      return false;
    }
    
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (passwordStrength.strength === "weak") {
      setError("Password is too weak. Please ensure your password meets all requirements: at least 8 characters, includes uppercase, lowercase, numbers, and special characters.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!termsAgreed) {
      setError("You must agree to the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data based on role
      const registrationData = {
        role: formData.role,
        full_name: formData.full_name,
        email: formData.email,
        contact_num: `+63${formData.contact_num}`,
        address: `${formData.barangay}, ${formData.cityMunicipality}, ${formData.province}`.trim(),
        password: formData.password
      };

      // Add role-specific fields
      if (formData.role === "student") {
        registrationData.student_num = formData.student_num;
        registrationData.program = formData.program;
        if (formData.section_id) {
          registrationData.section_id = formData.section_id;
        }
        // QR code will be auto-generated by the backend
        registrationData.qr_code = `IDNo: ${formData.student_num}\nFull Name: ${formData.full_name}\nProgram: ${formData.program}`;
      } else if (formData.role === "teacher") {
        registrationData.program = formData.program;
      } else if (formData.role === "admin") {
        registrationData.program = formData.program;
      }

      const response = await apiService.register(registrationData);
      
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
      
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Contact number handling helpers
  const CONTACT_PREFIX = '+63';
  const placeCursorAfterPrefix = () => {
    const input = contactInputRef.current;
    if (!input) return;
    const pos = CONTACT_PREFIX.length;
    input.setSelectionRange(pos, pos);
  };

  const handleContactFocus = () => {
    // Ensure caret is after the +63 prefix
    requestAnimationFrame(placeCursorAfterPrefix);
  };

  const handleContactKeyDown = (e) => {
    const input = e.currentTarget;
    const caretPos = input.selectionStart || 0;
    const selectionLen = (input.selectionEnd || caretPos) - caretPos;
    const digitsLen = formData.contact_num.length;
    // Prevent deleting the prefix
    if ((e.key === 'Backspace' && caretPos <= CONTACT_PREFIX.length) ||
        (e.key === 'Delete' && caretPos < CONTACT_PREFIX.length)) {
      e.preventDefault();
      placeCursorAfterPrefix();
      return;
    }
    // Allow control keys, block non-digits
    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Home','End'];
    if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    // If already at 10 digits and inserting at end with no selection, block extra digits
    const atEnd = caretPos >= input.value.length;
    if (/^\d$/.test(e.key) && digitsLen >= 10 && atEnd && selectionLen === 0) {
      e.preventDefault();
    }
  };

  const handleContactPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    let digits = (text || '').replace(/\D/g, '');
    if (digits.startsWith('63')) {
      digits = digits.slice(2);
    }
    if (digits.length > 10) {
      digits = digits.slice(-10);
    }
    setFormData(prev => ({ ...prev, contact_num: digits }));
    requestAnimationFrame(placeCursorAfterPrefix);
  };

  const handleContactClick = () => {
    const input = contactInputRef.current;
    if (!input) return;
    if ((input.selectionStart || 0) < CONTACT_PREFIX.length) {
      placeCursorAfterPrefix();
    }
  };

  const renderRoleSpecificFields = () => {
    if (formData.role === "student") {
      return (
        <>
          <FormGroup>
            <InputGroup className="input-group-alternative mb-2">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="ni ni-badge" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                placeholder="Enter 10-digit student number"
                type="text"
                name="student_num"
                value={formData.student_num}
                onChange={handleInputChange}
                onInput={e => e.target.value = e.target.value.replace(/[^\d]/g, '')}
                required
                inputMode="numeric"
                pattern="^\d{10}$"
                maxLength={10}
                title="Student number (exact 10 digits)"
              />
            </InputGroup>
            <small className="text-muted">Enter your 10-digit student number</small>
          </FormGroup>
          <FormGroup>
            <InputGroup className="input-group-alternative mb-2">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="ni ni-books" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="select"
                name="program"
                value={formData.program}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Program/Course</option>
                <option value="Bachelor of Science in Information Technology">BSIT - Bachelor of Science in Information Technology</option>
                <option value="Bachelor of Science in Computer Science">BSCS - Bachelor of Science in Computer Science</option>
                <option value="Bachelor of Science in Information Systems">BSIS - Bachelor of Science in Information Systems</option>
                <option value="Associate in Computer Technology">ACT - Associate in Computer Technology</option>
              </Input>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <InputGroup className="input-group-alternative mb-2">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="ni ni-building" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                placeholder="Section ID (Optional)"
                type="text"
                name="section_id"
                value={formData.section_id}
                onChange={handleInputChange}
              />
            </InputGroup>
          </FormGroup>
        </>
      );
    } else if (formData.role === "teacher") {
      return (
        <FormGroup>
          <InputGroup className="input-group-alternative mb-3">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="ni ni-books" />
              </InputGroupText>
            </InputGroupAddon>
            <Input
              type="select"
              name="program"
              value={formData.program}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Department/Program</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Systems">Information Systems</option>
              <option value="Computer Technology">Computer Technology</option>
            </Input>
          </InputGroup>
        </FormGroup>
      );
    } else if (formData.role === "admin") {
      return (
        <FormGroup>
          <InputGroup className="input-group-alternative mb-3">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="ni ni-books" />
              </InputGroupText>
            </InputGroupAddon>
            <Input
              type="select"
              name="program"
              value={formData.program}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Department/Program</option>
              <option value="Program Chairperson">Program Chairperson</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Systems">Information Systems</option>
              <option value="Computer Technology">Computer Technology</option>
            </Input>
          </InputGroup>
        </FormGroup>
      );
    }
    return null;
  };

  return (
    <>
      <Col lg="6" md="8">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-3">
            <div className="text-center mt-2 mb-2">
              <h2>Register</h2>
            </div>
            <div className="text-muted text-center mb-2">
              <small>Sign up with</small>
            </div>
            <div className="btn-wrapper text-center">
              <GoogleOAuthButton
                text="Sign up with Google"
                variant="sign-up"
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={loading}
                className="w-100"
              />
            </div>
          </CardHeader>
          <CardBody className="px-lg-5 py-lg-4">
            <div className="text-center text-muted mb-3">
              <small>Or sign up with credentials</small>
            </div>
            
            {error && <Alert color="danger">{error}</Alert>}
            {success && <Alert color="success">{success}</Alert>}
            
            <Form role="form" onSubmit={handleSubmit}>
              {/* Role Selection Dropdown */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-circle-08" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    type="select"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </Input>
                </InputGroup>
                {autoDetectedRole && (
                  <small className="text-info">
                    <i className="ni ni-bell-55"></i> 
                    Email pattern detected: This appears to be a {autoDetectedRole} account
                  </small>
                )}
              </FormGroup>

              {/* Full Name */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-hat-3" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Full Name"
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </InputGroup>
              </FormGroup>

              {/* Email */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                                     <Input
                     placeholder="Email Address"
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleEmailChange}
                     required
                   />
                 </InputGroup>
                 <small className="text-muted">
                   Any email domain is allowed for manual registration
                 </small>
              </FormGroup>

              {/* Role-specific fields */}
              {renderRoleSpecificFields()}

              {/* Contact Number */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-mobile-button" />
                    </InputGroupText>
                  </InputGroupAddon>
                  {/* Keep Bootstrap styling while enforcing +63 prefix and 10 digits */}
                  <input
                    ref={contactInputRef}
                    className="form-control"
                    type="tel"
                    name="contact_num"
                    value={`${CONTACT_PREFIX}${formData.contact_num}`}
                    onChange={handleInputChange}
                    onFocus={handleContactFocus}
                    onKeyDown={handleContactKeyDown}
                    onClick={handleContactClick}
                    onPaste={handleContactPaste}
                    inputMode="numeric"
                    aria-label="Contact Number"
                    required
                  />
                </InputGroup>
                <small className="text-muted">Starts with +63 and 10 digits (e.g., +639123456789)</small>
              </FormGroup>


              {/* Province */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2" style={{display: 'flex', alignItems: 'stretch'}}>
                  <InputGroupAddon addonType="prepend" style={{display: 'flex', alignItems: 'stretch', height: '48px'}}>
                    <InputGroupText style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                      <i className="ni ni-square-pin" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    type="select"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Province</option>
                    <option value="Pampanga">Pampanga</option>
                  </Input>
                </InputGroup>
              </FormGroup>

              {/* City/Municipality */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2" style={{display: 'flex', alignItems: 'stretch'}}>
                  <InputGroupAddon addonType="prepend" style={{display: 'flex', alignItems: 'stretch', height: '48px'}}>
                    <InputGroupText style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                      <i className="ni ni-building" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Select
                    classNamePrefix="react-select"
                    inputId="register_city"
                    options={formData.province ? cityOptions : []}
                    value={formData.cityMunicipality ? { value: formData.cityMunicipality, label: formData.cityMunicipality } : null}
                    onChange={opt => handleInputChange({ target: { name: 'cityMunicipality', value: opt ? opt.value : '' } })}
                    isDisabled={!formData.province}
                    isSearchable
                    placeholder={formData.province ? "Select City/Municipality" : "Select Province first to continue"}
                    styles={{
                      control: (base) => ({
                        ...base,
                        width: '100%',
                        minWidth: '100%',
                        maxWidth: '100%',
                        height: '48px',
                        minHeight: '48px'
                      }),
                      container: (base) => ({
                        ...base,
                        width: '100%',
                        minWidth: '100%',
                        maxWidth: '100%'
                      })
                    }}
                  />
                </InputGroup>
              </FormGroup>

              {/* Barangay */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2" style={{display: 'flex', alignItems: 'stretch'}}>
                  <InputGroupAddon addonType="prepend" style={{display: 'flex', alignItems: 'stretch', height: '48px'}}>
                    <InputGroupText style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                      <i className="ni ni-map-big" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Select
                    classNamePrefix="react-select"
                    inputId="register_barangay"
                    options={formData.cityMunicipality ? barangayOptions : []}
                    value={formData.barangay ? { value: formData.barangay, label: formData.barangay } : null}
                    onChange={opt => handleInputChange({ target: { name: 'barangay', value: opt ? opt.value : '' } })}
                    isDisabled={!formData.cityMunicipality}
                    isSearchable
                    placeholder={formData.cityMunicipality ? "Select Barangay" : "Select City/Municipality first"}
                    styles={{
                      control: (base) => ({
                        ...base,
                        width: '100%',
                        minWidth: '100%',
                        maxWidth: '100%',
                        height: '48px',
                        minHeight: '48px'
                      }),
                      container: (base) => ({
                        ...base,
                        width: '100%',
                        minWidth: '100%',
                        maxWidth: '100%'
                      })
                    }}
                  />
                </InputGroup>
              </FormGroup>

              {/* Password */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Enter your password"
                    type={passwordVisible.password ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>
                      <i
                        className={`ni ${passwordVisible.password ? "ni-eye" : "ni-eye-slash"}`}
                        onClick={() => togglePasswordVisibility("password")}
                        style={{ cursor: "pointer" }}
                      />
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {passwordStrength.strength && (
                  <div className="mt-1">
                    <small className={`text-${passwordStrength.strength === 'strong' ? 'success' : passwordStrength.strength === 'medium' ? 'warning' : 'danger'}`}>
                      Password strength: {passwordStrength.strength}
                    </small>
                    {passwordStrength.feedback.length > 0 && (
                      <ul className="mt-1 mb-0">
                        {passwordStrength.feedback.map((feedback, index) => (
                          <li key={index} className="text-muted small">{feedback}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </FormGroup>

              {/* Confirm Password */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Confirm your password"
                    type={passwordVisible.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>
                      <i
                        className={`ni ${passwordVisible.confirmPassword ? "ni-eye" : "ni-eye-slash"}`}
                        onClick={() => togglePasswordVisibility("confirmPassword")}
                        style={{ cursor: "pointer" }}
                      />
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </FormGroup>

              {/* Password Requirements Summary */}
              <div className="mb-4 p-3 bg-light rounded border">
                <small className="text-muted font-weight-bold d-block mb-2">
                  <i className="ni ni-info-77 mr-1"></i>
                  Password Requirements:
                </small>
                <div className="row">
                  <div className="col-6">
                    <small className="text-muted d-flex align-items-center mb-1">
                      <i className="ni ni-check-bold text-success mr-2" style={{ fontSize: '0.8rem' }}></i>
                      At least 8 characters
                    </small>
                    <small className="text-muted d-flex align-items-center mb-1">
                      <i className="ni ni-check-bold text-success mr-2" style={{ fontSize: '0.8rem' }}></i>
                      One uppercase letter
                    </small>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-flex align-items-center mb-1">
                      <i className="ni ni-check-bold text-success mr-2" style={{ fontSize: '0.8rem' }}></i>
                      One lowercase letter
                    </small>
                    <small className="text-muted d-flex align-items-center mb-1">
                      <i className="ni ni-check-bold text-success mr-2" style={{ fontSize: '0.8rem' }}></i>
                      One number & special character
                    </small>
                  </div>
                </div>
              </div>

              <Row className="my-4">
                <Col xs="12">
                  <div className="custom-control custom-control-alternative custom-checkbox">
                    <input
                      className="custom-control-input"
                      id="customCheckRegister"
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="customCheckRegister"
                    >
                      <span className="text-muted">
                        I agree with the{" "}
                        <a href="#pablo" onClick={(e) => e.preventDefault()}>
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>
                </Col>
              </Row>
              <div className="text-center">
                <Button 
                  className="mt-4" 
                  color="primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
        <Row className="mt-3">
          <Col xs="6">
            <Link
              className="text-light"
              to="/auth/forgot-password"
            >
              <small>Forgot password?</small>
            </Link>
          </Col>
          <Col className="text-right" xs="6">
            <Link
              className="text-light"
              to="/auth/login"
            >
              <small>Already have an account?</small>
            </Link>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default Register;
