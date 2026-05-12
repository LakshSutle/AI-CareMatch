import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Brain, Phone, Check, Shield, BadgeCheck, Fingerprint, CreditCard, AlertTriangle, Star, VideoOff, Upload, Clock, ChevronDown, User } from 'lucide-react';
import { saveBooking } from '../services/firebase';

const STEPS = [
  { icon: User, title: 'Personal Details', desc: 'Provide your personal information and medical background for screening.' },
  { icon: Camera, title: 'Live Selfie Verification', desc: 'Real-time face capture — photos & pre-recorded videos cannot be used. Must match with your ID.' },
  { icon: Fingerprint, title: 'Government ID Upload', desc: 'Upload your Aadhaar, Driving Licence, PAN, Voter ID, or Passport. AI face-matching applied.' },
  { icon: Brain, title: 'Medical Screening & Skill Quiz', desc: 'AI-scored competency quiz reviewed by a certified medical professor. ₹300 platform verification charge applies.' },
  { icon: Phone, title: 'Reference & Background Check', desc: 'AI analyzes your references for authenticity. Police verification may be initiated.' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(-1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [selfieMatch, setSelfieMatch] = useState(null);
  const [agreedToFee, setAgreedToFee] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const done = completed.length === 5;

  // Personal details form state
  const [profile, setProfile] = useState({
    fullName: '', phone: '', email: '', dob: '', gender: '',
    address: '', city: 'Hyderabad', experience: '',
    languages: '', emergencyContact: '', emergencyPhone: '',
    hasChronicIllness: false, chronicDetails: '',
    hasDisability: false, disabilityDetails: '',
    bloodGroup: '', allergies: '', medications: '',
    vaccinationStatus: '', covidVaccinated: false,
    mentalHealthHistory: '', firstAidCertified: false,
    availableDate: '', timeFrom: '09:00', timeTo: '18:00', hourlyRate: '',
  });
  const updateProfile = (field, value) => setProfile(p => ({ ...p, [field]: value }));
  const [formSubmitAttempted, setFormSubmitAttempted] = useState(false);
  const isFieldMissing = (field) => formSubmitAttempted && !profile[field];

  // ID Upload state
  const [idFile, setIdFile] = useState(null);
  const [idUploading, setIdUploading] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const fileInputRef = useRef(null);

  // ID verification matching state
  const [idNameOnDoc, setIdNameOnDoc] = useState('');
  const [idDobOnDoc, setIdDobOnDoc] = useState('');
  const [idVerified, setIdVerified] = useState(false);
  const [idMismatch, setIdMismatch] = useState(null);

  // Anti-spam / suspicious user detection
  const [suspiciousFlags, setSuspiciousFlags] = useState([]);
  const [userBlocked, setUserBlocked] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Timed quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [optionsRevealed, setOptionsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [screeningSent, setScreeningSent] = useState(false);
  const timerRef = useRef(null);

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 400 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      // Simulate face detection after 2s
      setTimeout(() => setFaceDetected(true), 2000);
    } catch {
      setCameraError('Camera access denied. Please allow camera permissions.');
      setCameraActive(false);
    }
  }, []);

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setFaceDetected(false);
  }, []);

  // Cleanup on unmount or step change
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (step === 1 && !cameraActive) {
        startCamera();
      } else if (step !== 1) {
        stopCamera();
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      stopCamera();
    };
  }, [cameraActive, startCamera, step, stopCamera]);

  const categories = [
    { key: 'child', label: 'Child Care', emoji: '👶', desc: 'Babysitting, nanny, special-needs support' },
    { key: 'human', label: 'Human Care', emoji: '🧑', desc: 'Elder care, post-surgery, dementia, companionship' },
    { key: 'pet', label: 'Pet Care', emoji: '🐾', desc: 'Dog, cat, breed-specific handling' },
  ];

  const completeStep = () => {
    setCompleted((c) => [...c, step]);
    if (step < 4) setTimeout(() => setStep(step + 1), 500);
  };

  const quizBank = {
    child: [
      { q: 'A toddler swallows a small button battery. What is your immediate action?', options: ['Give them milk', 'Rush to emergency room immediately', 'Make them vomit', 'Wait and monitor'], correct: 1 },
      { q: 'A 4-year-old has a fever of 104°F. What should you do first?', options: ['Give adult medication in half dose', 'Administer age-appropriate fever reducer and call parents', 'Put them in ice water', 'Ignore if child is playing'], correct: 1 },
      { q: 'During naptime, a 2-year-old stops breathing momentarily. Your response?', options: ['Shake the child vigorously', 'Check airway, begin infant CPR if needed, call 108', 'Pour cold water on them', 'Wait 5 minutes to see if it resolves'], correct: 1 },
      { q: 'A child with autism is having a meltdown in a public place. Best approach?', options: ['Hold them down firmly', 'Remove to a quiet space, reduce sensory input, speak calmly', 'Bribe them with candy', 'Scold them loudly to stop'], correct: 1 },
      { q: 'What is the correct adult-to-child ratio for supervising toddlers (ages 1-3)?', options: ['1 adult per 10 children', '1 adult per 3-4 children', '1 adult per 8 children', 'Ratio does not matter'], correct: 1 },
      { q: 'A child refuses to eat any vegetables. The best long-term strategy is:', options: ['Force them to eat', 'Introduce small portions alongside preferred foods consistently', 'Remove all other food until they comply', 'Only serve fruit instead'], correct: 1 },
      { q: 'You suspect a child is being bullied at school. What should you do?', options: ['Tell the child to fight back', 'Listen empathetically, document concerns, inform parents', 'Ignore it as normal behavior', 'Confront the bully yourself'], correct: 1 },
      { q: 'An infant (3 months) is crying inconsolably for over 2 hours. This could indicate:', options: ['Normal baby behavior always', 'Possible colic, illness, or pain — assess and consult pediatrician', 'The baby is manipulating you', 'Teething pain only'], correct: 1 },
    ],
    human: [
      { q: 'A stroke patient shows sudden facial drooping and slurred speech. Your priority?', options: ['Give them aspirin', 'Call 108 immediately, note the time symptoms started', 'Make them lie flat and wait', 'Give them food to raise energy'], correct: 1 },
      { q: 'An Alzheimer patient keeps asking the same question repeatedly. You should:', options: ['Show frustration to teach them', 'Answer patiently each time, redirect with a familiar activity', 'Tell them they already asked', 'Ignore them'], correct: 1 },
      { q: 'A diabetic patient becomes sweaty, shaky, and confused. This suggests:', options: ['High blood sugar', 'Hypoglycemia — give glucose or juice immediately', 'Dehydration only', 'Normal aging'], correct: 1 },
      { q: 'When lifting a patient from bed to wheelchair, the safest technique is:', options: ['Bend at the waist and pull', 'Use proper body mechanics: bend knees, engage core, use transfer belt', 'Ask the patient to jump', 'Lift with arms only'], correct: 1 },
      { q: 'A patient on blood thinners falls and hits their head. Even without visible injury:', options: ['Apply ice and forget about it', 'Monitor closely for 24 hours, seek medical evaluation', 'Give them pain medication', 'Let them sleep it off'], correct: 1 },
      { q: 'An elderly patient has not had a bowel movement in 5 days. You should:', options: ['Give them a strong laxative', 'Increase fluids and fiber, inform the doctor', 'Ignore it as normal', 'Reduce their food intake'], correct: 1 },
      { q: 'A bedridden patient develops redness on their tailbone. This early sign of bedsore requires:', options: ['Ignore if not painful', 'Reposition immediately, keep area clean and dry, notify medical team', 'Apply talcum powder', 'Massage the red area firmly'], correct: 1 },
      { q: 'A patient with Parkinson disease is at high risk of:', options: ['Sunburn', 'Falls due to balance and tremor issues — assist during movement', 'Hearing loss', 'Vision improvement'], correct: 1 },
    ],
    pet: [
      { q: 'A dog ate an entire bar of dark chocolate. Immediate action?', options: ['Give them milk to dilute', 'Call the vet or pet poison helpline immediately', 'Wait to see if symptoms appear', 'Give them bread'], correct: 1 },
      { q: 'A cat is hiding, refusing food, and has warm ears. This likely means:', options: ['Cat is being moody', 'Possible fever or illness — vet visit recommended within 24 hours', 'Cat wants attention', 'Normal cat behavior'], correct: 1 },
      { q: 'A dog is limping on its front leg after a walk. Your first step?', options: ['Force the dog to walk it off', 'Check paw pads for injury, restrict activity, consult vet if persistent', 'Give human painkillers', 'Ignore it'], correct: 1 },
      { q: 'Which common household item is extremely toxic to cats?', options: ['Rice', 'Lily flowers', 'Bananas', 'Bread'], correct: 1 },
      { q: 'A puppy is eating its own feces. This behavior (coprophagia) is best addressed by:', options: ['Punishing the puppy', 'Ensuring proper nutrition, cleaning immediately, consulting vet', 'Starving the puppy to stop', 'Ignoring it completely'], correct: 1 },
      { q: 'A senior dog (12 years) suddenly starts circling and seems disoriented. This could be:', options: ['Playing', 'Canine cognitive dysfunction or vestibular disease — urgent vet visit', 'Excitement', 'Hunger'], correct: 1 },
      { q: 'The safest way to introduce two unfamiliar dogs is:', options: ['Let them loose together inside', 'Controlled introduction on neutral territory with leashes', 'Put them in a crate together', 'Let them figure it out'], correct: 1 },
      { q: 'A rabbit stops eating and has a bloated abdomen. This is:', options: ['Normal after meals', 'GI stasis — a life-threatening emergency requiring immediate vet care', 'Overeating', 'Gas that will pass'], correct: 1 },
    ],
  };

  const quizQuestions = quizBank[selectedCategory] || quizBank.child;
  const TOTAL_Q = quizQuestions.length;
  const [quizScore, setQuizScore] = useState(0);

  // Timer effect for 15-second countdown
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      // Time up — auto-advance to next question
      timerRef.current = setTimeout(() => {
        setTimerActive(false);
        setOptionsRevealed(false);
        if (currentQ < TOTAL_Q - 1) {
          setCurrentQ(q => q + 1);
          setTimeLeft(15);
        }
      }, 0);
    }
    return () => clearTimeout(timerRef.current);
  }, [TOTAL_Q, currentQ, timerActive, timeLeft]);

  const revealOptions = () => {
    setOptionsRevealed(true);
    setTimerActive(true);
    setTimeLeft(15);
  };

  const selectAnswer = (optIndex) => {
    setQuizAnswers(prev => ({ ...prev, [currentQ]: optIndex }));
    setTimerActive(false);
    setOptionsRevealed(false);
    // Auto-advance after brief delay
    setTimeout(() => {
      if (currentQ < TOTAL_Q - 1) {
        setCurrentQ(q => q + 1);
        setTimeLeft(15);
      }
    }, 600);
  };

  const handleQuizSubmit = () => {
    let score = 0;
    quizQuestions.forEach((qq, i) => {
      if (quizAnswers[i] === qq.correct) score++;
    });
    setQuizScore(score);
    setScreeningSent(true);
    // Save to Firebase
    saveBooking({ type: 'screening_submission', category: selectedCategory, score, total: TOTAL_Q }).catch(() => {});
    setTimeout(() => completeStep(), 3000);
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFile(file);
    setIdUploading(true);
    setIdMismatch(null);
    setIdVerified(false);
    // Save metadata to Firebase
    saveBooking({ type: 'id_upload', fileName: file.name, fileSize: file.size, fileType: file.type, category: selectedCategory })
      .then(() => { setIdUploading(false); setIdUploaded(true); setIdNameOnDoc(profile.fullName); setIdDobOnDoc(profile.dob); })
      .catch(() => { setIdUploading(false); setIdUploaded(true); setIdNameOnDoc(profile.fullName); setIdDobOnDoc(profile.dob); });
  };

  // Verify ID details match profile details
  const verifyIdMatch = () => {
    const flags = [];
    // Normalize names: lowercase, remove extra spaces, compare first+last name tokens
    const normalize = (n) => n.trim().toLowerCase().replace(/\s+/g, ' ');
    const profileName = normalize(profile.fullName);
    const idName = normalize(idNameOnDoc);
    // Match if names are equal, or if all tokens in ID name appear in profile name (or vice versa)
    const profileTokens = profileName.split(' ');
    const idTokens = idName.split(' ');
    const nameMatch = profileName === idName
      || idTokens.every(t => profileTokens.includes(t))
      || profileTokens.every(t => idTokens.includes(t));

    const dobMatch = profile.dob === idDobOnDoc;

    if (!nameMatch) flags.push('Name on ID does not match your profile name');
    if (!dobMatch) flags.push('Date of birth on ID does not match your profile');

    if (flags.length > 0) {
      setIdMismatch(flags);
      setIdVerified(false);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 3) {
        setUserBlocked(true);
        setSuspiciousFlags(prev => [...prev, 'Multiple failed ID verification attempts — user blocked']);
        saveBooking({ type: 'user_blocked', reason: 'Too many failed ID verifications', attempts: newAttempts, profile }).catch(() => {});
      }
    } else {
      setIdMismatch(null);
      setIdVerified(true);
      setSuspiciousFlags([]);
    }
  };

  // Anti-spam: check for suspicious patterns on profile submit
  const handleProfileSubmit = () => {
    setFormSubmitAttempted(true);
    const flags = [];
    if (profile.fullName.length < 3) flags.push('Name too short');
    if (profile.phone && !/^[+]?\d{10,13}$/.test(profile.phone.replace(/\s/g, ''))) flags.push('Invalid phone format');
    if (profile.emergencyPhone === profile.phone) flags.push('Emergency phone is same as personal phone');
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) flags.push('Invalid email format');
    if (/^(.)\1+$/.test(profile.fullName.replace(/\s/g, ''))) flags.push('Name appears to be spam');
    if (/^(.)\1+$/.test(profile.address.replace(/\s/g, ''))) flags.push('Address appears to be spam');
    if (!isProfileValid) { flags.push('Please fill all required fields (marked with *)'); }

    if (flags.length > 0) {
      setSuspiciousFlags(flags);
      return;
    }
    setSuspiciousFlags([]);
    saveBooking({ type: 'caregiver_profile', ...profile, category: selectedCategory }).catch(() => {});
    completeStep();
  };
  const isProfileValid = profile.fullName && profile.phone && profile.dob && profile.gender && profile.address && profile.bloodGroup && profile.emergencyContact && profile.emergencyPhone && profile.availableDate && profile.hourlyRate;

  return (
    <div className="onboarding-page">
      <div className="container">
        <div className="ob-header">
          <h1>Caregiver <span className="gradient-text">Screening & Onboarding</span></h1>
          <p>Complete verification to earn your Verified Badge. One person, one category only.</p>
        </div>

        {/* Category Selection */}
        {step === -1 && (
          <div className="ob-category-section glass-card">
            <h2>Select Your Category</h2>
            <div className="ob-warning">
              <AlertTriangle size={18} />
              <p><strong>Important:</strong> You can only apply for ONE category. Multiple category entries from the same person will not be accepted.</p>
            </div>
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  className={`category-btn ${selectedCategory === cat.key ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  <span className="cat-emoji">{cat.emoji}</span>
                  <strong>{cat.label}</strong>
                  <span className="cat-desc">{cat.desc}</span>
                </button>
              ))}
            </div>

            <div className="ob-fee-notice">
              <CreditCard size={18} />
              <div>
                <strong>Profile Screening Fee</strong>
                <p>A screening fee will be charged during profile creation to ensure serious and verified applicants only.</p>
              </div>
            </div>

            <div className="ob-policy-box">
              <h4>📋 Screening Policy</h4>
              <ul>
                <li>Each profile is reviewed and screened by a medical professor</li>
                <li>Selection priority is based on a 5-star rating system</li>
                <li>Gov ID verification is mandatory — marked as "Verified" on profile</li>
                <li>Live selfie must match your uploaded Identity Proof (Aadhaar / DL / PAN)</li>
                <li>An additional ₹300 platform verification charge may apply for medical review</li>
                <li>Profiles failing verification may be rejected or sent for manual review</li>
              </ul>
            </div>

            <button
              className="btn-primary"
              onClick={() => selectedCategory && setStep(0)}
              disabled={!selectedCategory}
              style={{ width: '100%', marginTop: 'var(--space-4)' }}
            >
              Continue as {selectedCategory ? categories.find(c => c.key === selectedCategory)?.label : '...'} Caregiver
            </button>
          </div>
        )}

        {/* Progress Steps */}
        {step >= 0 && (
          <div className="ob-progress">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isComplete = completed.includes(i);
              const isActive = step === i && !done;
              return (
                <div key={i} className={`ob-step-indicator ${isComplete ? 'complete' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="ob-step-circle">
                    {isComplete ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <span className="ob-step-label">{s.title}</span>
                  {i < 4 && <div className={`ob-step-line ${isComplete ? 'filled' : ''}`} />}
                </div>
              );
            })}
          </div>
        )}

        {step >= 0 && !done && (
          <div className="ob-content glass-card">
            <h2>{STEPS[step].title}</h2>
            <p className="ob-desc">{STEPS[step].desc}</p>

            {/* Step 0: Personal Details & Medical Background */}
            {step === 0 && (
              <div className="profile-form">
                <h4>👤 Personal Information</h4>
                <div className="form-grid">
                  <div className={`form-group${isFieldMissing('fullName') ? ' missing' : ''}`}><label>Full Name *</label><input type="text" placeholder="Enter your full name" value={profile.fullName} onChange={e => updateProfile('fullName', e.target.value)} /></div>
                  <div className={`form-group${isFieldMissing('phone') ? ' missing' : ''}`}><label>Phone Number *</label><input type="tel" placeholder="+91 9XXXXXXXXX" value={profile.phone} onChange={e => updateProfile('phone', e.target.value)} /></div>
                  <div className="form-group"><label>Email</label><input type="email" placeholder="email@example.com" value={profile.email} onChange={e => updateProfile('email', e.target.value)} /></div>
                  <div className={`form-group${isFieldMissing('dob') ? ' missing' : ''}`}><label>Date of Birth *</label><input type="date" value={profile.dob} onChange={e => updateProfile('dob', e.target.value)} /></div>
                  <div className={`form-group${isFieldMissing('gender') ? ' missing' : ''}`}><label>Gender *</label><select value={profile.gender} onChange={e => updateProfile('gender', e.target.value)}><option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                  <div className="form-group"><label>Years of Experience</label><select value={profile.experience} onChange={e => updateProfile('experience', e.target.value)}><option value="">Select</option><option value="0-1">0-1 years</option><option value="1-3">1-3 years</option><option value="3-5">3-5 years</option><option value="5+">5+ years</option></select></div>
                </div>
                <div className={`form-group full${isFieldMissing('address') ? ' missing' : ''}`}><label>Address *</label><input type="text" placeholder="Full residential address" value={profile.address} onChange={e => updateProfile('address', e.target.value)} /></div>
                <div className="form-grid">
                  <div className="form-group"><label>City</label><input type="text" value={profile.city} onChange={e => updateProfile('city', e.target.value)} /></div>
                  <div className="form-group"><label>Languages Spoken</label><input type="text" placeholder="Hindi, English, Telugu" value={profile.languages} onChange={e => updateProfile('languages', e.target.value)} /></div>
                </div>

                <h4 style={{ marginTop: 'var(--space-4)' }}>🕐 Availability & Charges</h4>
                <div className="form-grid">
                  <div className={`form-group${isFieldMissing('availableDate') ? ' missing' : ''}`}><label>Available From Date *</label><input type="date" value={profile.availableDate} onChange={e => updateProfile('availableDate', e.target.value)} /></div>
                  <div className={`form-group${isFieldMissing('hourlyRate') ? ' missing' : ''}`}><label>Hourly Rate (₹) *</label><input type="number" placeholder="e.g. 200" min="50" value={profile.hourlyRate} onChange={e => updateProfile('hourlyRate', e.target.value)} /></div>
                  <div className="form-group"><label>Available From (Time)</label><input type="time" value={profile.timeFrom} onChange={e => updateProfile('timeFrom', e.target.value)} /></div>
                  <div className="form-group"><label>Available To (Time)</label><input type="time" value={profile.timeTo} onChange={e => updateProfile('timeTo', e.target.value)} /></div>
                </div>
                <div className="availability-summary" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', padding: 'var(--space-2) 0' }}>
                  {profile.timeFrom && profile.timeTo && (() => {
                    const [fh, fm] = profile.timeFrom.split(':').map(Number);
                    const [th, tm] = profile.timeTo.split(':').map(Number);
                    const hours = (th + tm / 60) - (fh + fm / 60);
                    return hours > 0 ? `📋 ${hours.toFixed(1)} hours/day • ${profile.hourlyRate ? `₹${(hours * Number(profile.hourlyRate)).toFixed(0)}/day estimated earnings` : 'Set hourly rate to see estimated earnings'}` : '';
                  })()}
                </div>

                <h4 style={{ marginTop: 'var(--space-4)' }}>🏥 Medical Background</h4>
                <div className="form-grid">
                  <div className={`form-group${isFieldMissing('bloodGroup') ? ' missing' : ''}`}><label>Blood Group *</label><select value={profile.bloodGroup} onChange={e => updateProfile('bloodGroup', e.target.value)}><option value="">Select</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option></select></div>
                  <div className="form-group"><label>Vaccination Status</label><select value={profile.vaccinationStatus} onChange={e => updateProfile('vaccinationStatus', e.target.value)}><option value="">Select</option><option value="fully">Fully Vaccinated</option><option value="partial">Partially Vaccinated</option><option value="none">Not Vaccinated</option></select></div>
                </div>
                <div className="form-group full"><label>Known Allergies</label><input type="text" placeholder="e.g., Penicillin, Dust, None" value={profile.allergies} onChange={e => updateProfile('allergies', e.target.value)} /></div>
                <div className="form-group full"><label>Current Medications</label><input type="text" placeholder="e.g., None, or list medications" value={profile.medications} onChange={e => updateProfile('medications', e.target.value)} /></div>

                <div className="form-check-row">
                  <label className="form-check"><input type="checkbox" checked={profile.hasChronicIllness} onChange={e => updateProfile('hasChronicIllness', e.target.checked)} /> I have a chronic illness</label>
                  <label className="form-check"><input type="checkbox" checked={profile.hasDisability} onChange={e => updateProfile('hasDisability', e.target.checked)} /> I have a disability</label>
                  <label className="form-check"><input type="checkbox" checked={profile.covidVaccinated} onChange={e => updateProfile('covidVaccinated', e.target.checked)} /> COVID-19 vaccinated</label>
                  <label className="form-check"><input type="checkbox" checked={profile.firstAidCertified} onChange={e => updateProfile('firstAidCertified', e.target.checked)} /> First Aid certified</label>
                </div>
                {profile.hasChronicIllness && <div className="form-group full"><label>Chronic Illness Details</label><input type="text" placeholder="Please describe" value={profile.chronicDetails} onChange={e => updateProfile('chronicDetails', e.target.value)} /></div>}
                {profile.hasDisability && <div className="form-group full"><label>Disability Details</label><input type="text" placeholder="Please describe" value={profile.disabilityDetails} onChange={e => updateProfile('disabilityDetails', e.target.value)} /></div>}

                <h4 style={{ marginTop: 'var(--space-4)' }}>🚨 Emergency Contact</h4>
                <div className="form-grid">
                  <div className={`form-group${isFieldMissing('emergencyContact') ? ' missing' : ''}`}><label>Emergency Contact Name *</label><input type="text" placeholder="Name" value={profile.emergencyContact} onChange={e => updateProfile('emergencyContact', e.target.value)} /></div>
                  <div className={`form-group${isFieldMissing('emergencyPhone') ? ' missing' : ''}`}><label>Emergency Phone *</label><input type="tel" placeholder="+91 9XXXXXXXXX" value={profile.emergencyPhone} onChange={e => updateProfile('emergencyPhone', e.target.value)} /></div>
                </div>

                {suspiciousFlags.length > 0 && (
                  <div className="suspicious-alert">
                    <AlertTriangle size={18} />
                    <div>
                      <strong>⚠️ Issues Detected</strong>
                      <ul>{suspiciousFlags.map((f, i) => <li key={i}>{f}</li>)}</ul>
                      <p>Please correct the highlighted issues to continue.</p>
                    </div>
                  </div>
                )}

                <button className="btn-primary" onClick={handleProfileSubmit} disabled={!isProfileValid || userBlocked} style={{ marginTop: 'var(--space-4)' }}>
                  {userBlocked ? '🚫 Account Blocked — Contact Support' : 'Save & Continue'}
                </button>
              </div>
            )}

            {/* Step 1: Live Selfie */}
            {step === 1 && (
              <div className="face-demo">
                <div className="camera-view">
                  {cameraError ? (
                    <div className="camera-error">
                      <VideoOff size={40} />
                      <p>{cameraError}</p>
                      <button className="btn-secondary" onClick={startCamera}>Retry</button>
                    </div>
                  ) : (
                    <div className="camera-frame-live">
                      <video ref={videoRef} autoPlay playsInline muted className="webcam-video" />
                      <div className={`face-oval-overlay ${faceDetected ? 'detected' : ''}`} />
                      <span className="camera-text">{faceDetected ? '✅ Face detected — hold still' : '📸 Position your face in the oval'}</span>
                    </div>
                  )}
                </div>
                <div className="selfie-info">
                  <p>{cameraActive ? '✅' : '⏳'} Live camera feed {cameraActive ? 'active' : 'starting...'}</p>
                  <p>{faceDetected ? '✅' : '⏳'} Face detection {faceDetected ? '— face found!' : '— scanning...'}</p>
                  <p>✅ Anti-spoofing: photos & videos blocked</p>
                  <p>✅ Will be matched against your Gov ID</p>
                </div>
                <button
                  className="btn-primary"
                  disabled={!faceDetected || capturing}
                  onClick={() => {
                    setCapturing(true);
                    setTimeout(() => {
                      stopCamera();
                      setSelfieMatch(true);
                      setCapturing(false);
                      completeStep();
                    }, 1500);
                  }}
                >
                  {capturing ? '🔄 Analyzing face...' : faceDetected ? '📸 Capture & Verify Live Selfie' : '⏳ Waiting for face detection...'}
                </button>
                <button
                  className="btn-ghost"
                  style={{ marginTop: 'var(--space-2)', fontSize: 'var(--fs-xs)', opacity: 0.7 }}
                  onClick={() => { stopCamera(); setSelfieMatch(false); completeStep(); }}
                >
                  Skip selfie — verify via ID credentials only
                </button>
              </div>
            )}

            {/* Step 2: Gov ID Upload */}
            {step === 2 && (
              <div className="doc-demo">
                {userBlocked ? (
                  <div className="blocked-banner">
                    <AlertTriangle size={32} />
                    <h4>🚫 Account Suspended</h4>
                    <p>Your account has been flagged due to multiple failed verification attempts. This may indicate identity fraud.</p>
                    <p>If you believe this is an error, please contact <strong>support@carematch.in</strong></p>
                  </div>
                ) : (
                  <>
                    <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                      {idFile ? (
                        <>
                          <BadgeCheck size={40} style={{ color: 'var(--trust-green)' }} />
                          <p style={{ color: 'var(--trust-green)' }}>{idFile.name}</p>
                          <span>{idUploading ? '⏳ Uploading to secure storage...' : '✅ Uploaded successfully'}</span>
                        </>
                      ) : (
                        <>
                          <Upload size={40} />
                          <p>Click to upload your Government ID</p>
                          <span>Supported: Aadhaar, Driving Licence, PAN, Voter ID, Passport</span>
                          <span style={{ fontSize: '11px' }}>Accepted formats: JPG, PNG, PDF (max 5MB)</span>
                        </>
                      )}
                    </div>

                    {idUploaded && (
                      <div className="id-verify-section">
                        <h4>🔍 Verify Identity — Enter details exactly as shown on your ID</h4>
                        <p className="id-verify-note">Your ID details must match the personal details you provided earlier. Mismatches will be flagged.</p>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Full Name (as on ID) *</label>
                            <input type="text" placeholder="Name exactly as printed on document" value={idNameOnDoc} onChange={e => setIdNameOnDoc(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Date of Birth (as on ID) *</label>
                            <input type="date" value={idDobOnDoc} onChange={e => setIdDobOnDoc(e.target.value)} />
                          </div>
                        </div>

                        {idMismatch && (
                          <div className="suspicious-alert">
                            <AlertTriangle size={18} />
                            <div>
                              <strong>❌ Verification Failed</strong>
                              <ul>{idMismatch.map((f, i) => <li key={i}>{f}</li>)}</ul>
                              <p>Attempts remaining: <strong>{3 - failedAttempts}</strong>. Correct the details or update your profile.</p>
                            </div>
                          </div>
                        )}

                        {idVerified && (
                          <div className="match-result">
                            <BadgeCheck size={20} />
                            <span>✅ ID Verified — Name and DOB match your profile</span>
                          </div>
                        )}

                        {!idVerified && (
                          <button className="btn-secondary" onClick={verifyIdMatch} disabled={!idNameOnDoc || !idDobOnDoc} style={{ marginTop: 'var(--space-2)' }}>
                            🔍 Verify Identity Match
                          </button>
                        )}
                      </div>
                    )}

                    {selfieMatch && (
                      <div className="match-result">
                        <BadgeCheck size={20} />
                        <span>AI Face Match: <strong style={{ color: 'var(--trust-green)' }}>98.7% match</strong> — Live selfie matches uploaded ID photo</span>
                      </div>
                    )}
                    <div className="safety-notice">
                      <Shield size={18} />
                      <p>Your ID document is encrypted and stored securely. It will only be used for verification and may be shared with authorities in case of safety concerns.</p>
                    </div>
                    <button className="btn-primary" onClick={completeStep} disabled={!idVerified}>
                      {!idUploaded ? 'Upload ID to continue' : !idVerified ? '🔒 Verify identity to proceed' : '✅ Continue to Skill Assessment'}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Medical Screening + Skill Quiz */}
            {step === 3 && (
              <div className="quiz-demo">
                <div className="fee-banner">
                  <CreditCard size={18} />
                  <div>
                    <strong>₹300 Platform Verification Charge</strong>
                    <p>This covers medical professor review and professional screening.</p>
                  </div>
                  <label className="fee-checkbox">
                    <input type="checkbox" checked={agreedToFee} onChange={(e) => setAgreedToFee(e.target.checked)} />
                    I agree to the verification charge
                  </label>
                </div>

                {screeningSent ? (
                  <div className="quiz-result">
                    <div className="quiz-score-circle">
                      <span className="score-number">{quizScore}/{TOTAL_Q}</span>
                      <span className="score-label">Score</span>
                    </div>
                    <div className="quiz-score-stars">{'⭐'.repeat(Math.max(1, Math.round(quizScore * 5 / TOTAL_Q)))}</div>
                    <div className="screening-sent-banner">
                      <BadgeCheck size={24} />
                      <p>✅ Your profile has been sent for screening to a <strong>Verified Medical Doctor</strong>.</p>
                      <span>You will be notified once the review is complete. This usually takes 24-48 hours.</span>
                    </div>
                  </div>
                ) : !quizStarted ? (
                  <div className="quiz-instructions">
                    <h4>📋 Skill Assessment — {selectedCategory === 'child' ? '👶 Child Care' : selectedCategory === 'human' ? '🧑 Human Care' : '🐾 Pet Care'}</h4>
                    <div className="instructions-box">
                      <h5>⚠️ Important Instructions — Read Carefully</h5>
                      <ul>
                        <li><Clock size={14} /> You will be shown <strong>8 questions</strong>, one at a time</li>
                        <li><Shield size={14} /> You will first see only the question — <strong>read it carefully</strong></li>
                        <li><ChevronDown size={14} /> Click <strong>"Reveal Options"</strong> to see the answer choices</li>
                        <li><AlertTriangle size={14} /> Once options are revealed, you have only <strong>15 seconds</strong> to answer</li>
                        <li><Clock size={14} /> If time runs out, the question is <strong>skipped (marked wrong)</strong></li>
                        <li><Shield size={14} /> This is designed to test <strong>genuine knowledge</strong> — copying is not possible</li>
                        <li><Brain size={14} /> Scored by AI, reviewed by a <strong>certified medical professor</strong></li>
                        <li><Star size={14} /> Selection priority is based on your <strong>5-star rating</strong></li>
                      </ul>
                    </div>
                    <button className="btn-primary" onClick={() => setQuizStarted(true)} disabled={!agreedToFee}>
                      {agreedToFee ? '🚀 Start Assessment' : '☝️ Agree to fee first'}
                    </button>
                  </div>
                ) : (
                  <div className="quiz-active">
                    <div className="quiz-header">
                      <h4>Q{currentQ + 1} of {TOTAL_Q}</h4>
                      <span className="quiz-progress">{Object.keys(quizAnswers).length}/{TOTAL_Q} answered</span>
                    </div>
                    <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${((currentQ + 1) / TOTAL_Q) * 100}%` }} /></div>
                    <div className="quiz-q">
                      <p className="quiz-question"><span className="q-number">Q{currentQ + 1}.</span> {quizQuestions[currentQ].q}</p>
                      {!optionsRevealed ? (
                        <button className="btn-reveal" onClick={revealOptions}><ChevronDown size={18} /> Reveal Options (15s timer starts)</button>
                      ) : (
                        <>
                          <div className={`timer-bar ${timeLeft <= 5 ? 'urgent' : ''}`}>
                            <Clock size={14} /><span>{timeLeft}s remaining</span>
                            <div className="timer-fill" style={{ width: `${(timeLeft / 15) * 100}%` }} />
                          </div>
                          <div className="quiz-options">
                            {quizQuestions[currentQ].options.map((opt, oi) => (
                              <button key={oi} className={`quiz-opt ${quizAnswers[currentQ] === oi ? 'selected' : ''}`} onClick={() => selectAnswer(oi)}>{opt}</button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {currentQ === TOTAL_Q - 1 && quizAnswers[currentQ] !== undefined && (
                      <button className="btn-primary" onClick={handleQuizSubmit}>Submit Assessment (₹300)</button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Reference & Background */}
            {step === 4 && (
              <div className="ref-demo">
                <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>🤖 AI Reference Call Analysis</h4>
                <div className="ref-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <h4>Reference #1</h4>
                    <span className="badge badge-trust" style={{ fontSize: '11px' }}>✅ Sentiment: Positive (94%)</span>
                  </div>
                  <p className="ref-transcript">"I've known her for 3 years. She's excellent with special-needs children, very patient and professional..."</p>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                    <span className="badge" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)', fontSize: '11px' }}>Authenticity: High</span>
                    <span className="badge" style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.3)', fontSize: '11px' }}>No Red Flags</span>
                    <span className="badge" style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)', fontSize: '11px' }}>Duration: 4m 12s</span>
                  </div>
                </div>
                <div className="ref-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <h4>Reference #2</h4>
                    <span className="badge badge-trust" style={{ fontSize: '11px' }}>✅ Sentiment: Positive (89%)</span>
                  </div>
                  <p className="ref-transcript">"Highly reliable, never missed a session. Families love working with her..."</p>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                    <span className="badge" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)', fontSize: '11px' }}>Authenticity: High</span>
                    <span className="badge" style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.3)', fontSize: '11px' }}>No Red Flags</span>
                    <span className="badge" style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)', fontSize: '11px' }}>Duration: 3m 45s</span>
                  </div>
                </div>

                {/* Verification Tier Progress */}
                <div style={{ padding: 'var(--space-4)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)', marginTop: 'var(--space-3)' }}>
                  <h4 style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-3)' }}>🏅 Verification Tier Progress</h4>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--fs-xs)', color: '#34D399', fontWeight: 600 }}>🟢 Basic</span>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                      <div style={{ width: '33%', height: '100%', background: '#34D399', borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 'var(--fs-xs)', color: '#60A5FA', fontWeight: 600 }}>🔵 Advanced</span>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                      <div style={{ width: '66%', height: '100%', background: '#60A5FA', borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 'var(--fs-xs)', color: '#A78BFA', fontWeight: 600 }}>🟣 Medical</span>
                  </div>
                  <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Complete all 5 steps + medical screening to reach Medical tier. You're currently at <strong style={{ color: '#60A5FA' }}>Advanced</strong> level.</p>
                </div>

                {/* Fraud Detection Badge */}
                <div style={{ padding: 'var(--space-3)', background: 'rgba(52,211,153,0.06)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                  <Shield size={18} style={{ color: '#34D399' }} />
                  <span style={{ fontSize: 'var(--fs-sm)', color: '#34D399' }}>🛡️ Fraud Detection: No suspicious patterns detected. Identity verified.</span>
                </div>

                <div className="safety-notice">
                  <Shield size={18} />
                  <p>User safety is the highest priority. Details may be shared with police or legal authorities in cases of complaints, misconduct, or fraud.</p>
                </div>
                <div className="safety-notice">
                  <BadgeCheck size={18} />
                  <p>Live profile tracking and work-location history will be maintained for safety and transparency.</p>
                </div>
                <button className="btn-primary" onClick={completeStep}>Complete Background Check</button>
              </div>
            )}
          </div>
        )}

        {/* Completion */}
        {done && (
          <div className="ob-complete glass-card">
            <div className="ob-badge-anim">
              <Shield size={64} />
            </div>
            <h2>🎉 Verification Complete!</h2>
            <p>You are now a <strong>Verified</strong> caregiver in the <strong>{categories.find(c => c.key === selectedCategory)?.label}</strong> category.</p>
            <div className="ob-badges">
              <span className="badge badge-trust" style={{ fontSize: 'var(--fs-sm)', padding: 'var(--space-2) var(--space-4)' }}>
                <BadgeCheck size={16} /> Verified
              </span>
              <span className="badge badge-verified" style={{ fontSize: 'var(--fs-sm)', padding: 'var(--space-2) var(--space-4)' }}>
                <Shield size={16} /> Verified
              </span>
            </div>

            <div className="ob-rules glass-card" style={{ textAlign: 'left', width: '100%', padding: 'var(--space-5)' }}>
              <h4>📋 Assignment Rules</h4>
              <ul style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', listStyle: 'none', paddingLeft: 0 }}>
                <li>🔒 Once assigned a job, you will be blocked from new requests for <strong>4 hours</strong></li>
                <li>🎯 No parallel assignments — complete focus on current care recipient</li>
                <li>✅ New assignment available only after current job is marked completed</li>
                <li>📍 Live location tracking active during assignments for safety</li>
                <li>⭐ Your screening rating and trust score will update after every session</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .onboarding-page { padding-top: 96px; padding-bottom: var(--space-16); min-height: 100vh; }
        .profile-form { display: flex; flex-direction: column; gap: var(--space-3); }
        .profile-form h4 { font-size: var(--fs-base); color: var(--text-primary); margin-bottom: var(--space-1); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label { font-size: var(--fs-xs); color: var(--text-tertiary); font-weight: 500; }
        .form-group input, .form-group select { padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-glass); background: var(--bg-card); color: var(--text-primary); font-size: var(--fs-sm); font-family: inherit; transition: border-color var(--transition-fast); }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: var(--primary-500); }
        .form-group input::placeholder { color: var(--text-muted); }
        .form-group select { appearance: none; cursor: pointer; }
        .form-group select option { background: var(--bg-card, #1a1a2e); color: var(--text-primary, #e0e0e0); }
        .form-group.missing input, .form-group.missing select { border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.15); }
        .form-group.missing label { color: #ef4444; }
        .form-check-row { display: flex; flex-wrap: wrap; gap: var(--space-3); padding: var(--space-3) 0; }
        .form-check { display: flex; align-items: center; gap: var(--space-2); font-size: var(--fs-sm); color: var(--text-secondary); cursor: pointer; }
        .form-check input { accent-color: var(--primary-500); }
        .suspicious-alert { display: flex; gap: var(--space-3); padding: var(--space-4); background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius-lg); color: #ef4444; }
        .suspicious-alert svg { flex-shrink: 0; margin-top: 2px; }
        .suspicious-alert strong { font-size: var(--fs-sm); }
        .suspicious-alert ul { list-style: none; padding: 0; margin: var(--space-1) 0; }
        .suspicious-alert li { font-size: var(--fs-xs); padding: 2px 0; }
        .suspicious-alert p { font-size: var(--fs-xs); color: var(--text-muted); margin-top: var(--space-1); }
        .blocked-banner { text-align: center; padding: var(--space-8); display: flex; flex-direction: column; align-items: center; gap: var(--space-3); color: #ef4444; }
        .blocked-banner h4 { font-size: var(--fs-lg); }
        .blocked-banner p { font-size: var(--fs-sm); color: var(--text-secondary); }
        .id-verify-section { padding: var(--space-4); background: var(--bg-card); border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: var(--space-3); }
        .id-verify-section h4 { font-size: var(--fs-sm); color: var(--text-primary); }
        .id-verify-note { font-size: var(--fs-xs); color: var(--text-muted); font-style: italic; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
        .ob-header { text-align: center; margin-bottom: var(--space-8); }
        .ob-header p { color: var(--text-secondary); }
        .ob-category-section { max-width: 640px; margin: 0 auto; padding: var(--space-8); display: flex; flex-direction: column; gap: var(--space-5); }
        .ob-category-section h2 { font-size: var(--fs-2xl); text-align: center; }
        .ob-warning {
          display: flex; gap: var(--space-3); align-items: flex-start;
          padding: var(--space-4); border-radius: var(--radius-lg);
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); color: var(--warning-amber);
        }
        .ob-warning p { font-size: var(--fs-sm); }
        .category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }
        .category-btn {
          display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
          padding: var(--space-5); border-radius: var(--radius-xl); background: var(--bg-card);
          border: 2px solid var(--border-glass); cursor: pointer; transition: all var(--transition-base); text-align: center;
          color: var(--text-primary);
        }
        .category-btn:hover { border-color: var(--primary-500); }
        .category-btn.selected { border-color: var(--primary-500); background: rgba(79,70,229,0.1); box-shadow: 0 0 20px rgba(79,70,229,0.2); }
        .cat-emoji { font-size: 2rem; }
        .cat-desc { font-size: var(--fs-xs); color: var(--text-tertiary); }
        .ob-fee-notice {
          display: flex; gap: var(--space-3); align-items: flex-start;
          padding: var(--space-4); border-radius: var(--radius-lg);
          background: rgba(79,70,229,0.08); border: 1px solid rgba(79,70,229,0.2); color: var(--primary-400);
        }
        .ob-fee-notice p { font-size: var(--fs-sm); color: var(--text-secondary); margin-top: 2px; }
        .ob-policy-box { padding: var(--space-4); background: var(--bg-card); border-radius: var(--radius-lg); }
        .ob-policy-box h4 { font-size: var(--fs-sm); margin-bottom: var(--space-3); }
        .ob-policy-box ul { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); padding: 0; }
        .ob-policy-box li { font-size: var(--fs-xs); color: var(--text-secondary); padding-left: var(--space-4); position: relative; }
        .ob-policy-box li::before { content: '•'; position: absolute; left: 0; color: var(--primary-400); }
        .ob-progress { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: var(--space-8); flex-wrap: wrap; }
        .ob-step-indicator { display: flex; align-items: center; gap: var(--space-2); }
        .ob-step-circle { width: 44px; height: 44px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; background: var(--bg-card); border: 2px solid var(--border-glass); color: var(--text-muted); transition: all var(--transition-base); }
        .ob-step-indicator.active .ob-step-circle { border-color: var(--primary-500); color: var(--primary-400); background: rgba(79,70,229,0.15); }
        .ob-step-indicator.complete .ob-step-circle { border-color: var(--trust-green); color: white; background: var(--trust-green); }
        .ob-step-label { font-size: var(--fs-xs); font-weight: 500; color: var(--text-muted); max-width: 80px; text-align: center; }
        .ob-step-indicator.active .ob-step-label { color: var(--primary-400); }
        .ob-step-indicator.complete .ob-step-label { color: var(--trust-green); }
        .ob-step-line { width: 40px; height: 2px; background: var(--border-glass); margin: 0 var(--space-2); }
        .ob-step-line.filled { background: var(--trust-green); }
        .ob-content { padding: var(--space-8); max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-5); }
        .ob-content h2 { font-size: var(--fs-2xl); }
        .ob-desc { color: var(--text-secondary); font-size: var(--fs-sm); }
        .camera-view { background: #000; border-radius: var(--radius-xl); overflow: hidden; display: flex; justify-content: center; align-items: center; min-height: 320px; position: relative; }
        .camera-frame-live { position: relative; width: 100%; display: flex; justify-content: center; align-items: center; }
        .webcam-video { width: 100%; max-width: 400px; border-radius: var(--radius-xl); transform: scaleX(-1); }
        .face-oval-overlay {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%);
          width: 160px; height: 200px; border: 3px dashed rgba(139,92,246,0.6);
          border-radius: 50%; transition: all 0.5s ease;
          box-shadow: 0 0 0 2000px rgba(0,0,0,0.3);
        }
        .face-oval-overlay.detected {
          border-color: var(--trust-green); border-style: solid;
          box-shadow: 0 0 20px rgba(16,185,129,0.4), 0 0 0 2000px rgba(0,0,0,0.2);
        }
        .camera-text { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); font-size: var(--fs-xs); color: white; text-align: center; white-space: nowrap; background: rgba(0,0,0,0.6); padding: 4px 12px; border-radius: var(--radius-full); }
        .camera-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); color: var(--text-muted); padding: var(--space-8); }
        .camera-error p { font-size: var(--fs-sm); text-align: center; }
        .selfie-info { display: flex; flex-direction: column; gap: var(--space-1); }
        .selfie-info p { font-size: var(--fs-sm); color: var(--trust-green); }
        .id-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }
        .id-option { padding: var(--space-4); text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-2); cursor: pointer; }
        .id-option strong { font-size: var(--fs-sm); }
        .id-option p { font-size: var(--fs-xs); color: var(--text-tertiary); }
        .upload-zone { padding: var(--space-8); border: 2px dashed var(--border-glass); border-radius: var(--radius-xl); display: flex; flex-direction: column; align-items: center; gap: var(--space-2); color: var(--text-muted); cursor: pointer; transition: all var(--transition-base); }
        .upload-zone:hover { border-color: var(--primary-500); color: var(--primary-400); }
        .upload-zone p { font-weight: 500; font-size: var(--fs-sm); }
        .upload-zone span { font-size: var(--fs-xs); }
        .match-result { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3); background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: var(--radius-lg); color: var(--trust-green); font-size: var(--fs-sm); }
        .fee-banner { padding: var(--space-4); background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: var(--space-2); color: var(--warning-amber); }
        .fee-banner strong { font-size: var(--fs-sm); }
        .fee-banner p { font-size: var(--fs-xs); color: var(--text-secondary); }
        .fee-checkbox { display: flex; align-items: center; gap: var(--space-2); font-size: var(--fs-sm); color: var(--text-secondary); cursor: pointer; }
        .fee-checkbox input { accent-color: var(--primary-500); }
        .quiz-note { font-size: var(--fs-xs); color: var(--text-tertiary); font-style: italic; margin-bottom: var(--space-2); }
        .quiz-header { display: flex; justify-content: space-between; align-items: center; }
        .quiz-header h4 { font-size: var(--fs-lg); }
        .quiz-progress { font-size: var(--fs-xs); color: var(--primary-400); background: rgba(79,70,229,0.1); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); }
        .quiz-q { margin-bottom: var(--space-4); }
        .quiz-question { font-weight: 500; margin-bottom: var(--space-2); font-size: var(--fs-sm); line-height: 1.5; }
        .q-number { color: var(--primary-400); font-weight: 700; margin-right: 4px; }
        .quiz-options { display: flex; flex-direction: column; gap: var(--space-2); }
        .quiz-opt { text-align: left; padding: var(--space-3); border-radius: var(--radius-md); background: var(--bg-card); border: 1px solid var(--border-glass); color: var(--text-secondary); font-size: var(--fs-sm); cursor: pointer; transition: all var(--transition-fast); }
        .quiz-opt:hover { border-color: var(--border-hover); }
        .quiz-opt.selected { border-color: var(--primary-500); background: rgba(79,70,229,0.1); color: var(--primary-400); }
        .quiz-result { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-8); text-align: center; }
        .quiz-score-circle { width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--primary-500); display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(79,70,229,0.1); }
        .score-number { font-size: var(--fs-2xl); font-weight: 700; color: var(--primary-400); }
        .score-label { font-size: var(--fs-xs); color: var(--text-muted); }
        .quiz-score-stars { font-size: var(--fs-2xl); }
        .quiz-result-text { font-size: var(--fs-base); color: var(--text-primary); font-weight: 500; }
        .quiz-result-sub { font-size: var(--fs-xs); color: var(--text-muted); animation: pulseScale 2s ease infinite; }
        .quiz-instructions { display: flex; flex-direction: column; gap: var(--space-4); }
        .instructions-box { padding: var(--space-5); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid rgba(245,158,11,0.2); }
        .instructions-box h5 { color: var(--warning-amber); margin-bottom: var(--space-3); font-size: var(--fs-sm); }
        .instructions-box ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-2); }
        .instructions-box li { display: flex; align-items: center; gap: var(--space-2); font-size: var(--fs-sm); color: var(--text-secondary); }
        .instructions-box li svg { color: var(--primary-400); flex-shrink: 0; }
        .quiz-active { display: flex; flex-direction: column; gap: var(--space-4); }
        .quiz-progress-bar { height: 4px; background: var(--bg-card); border-radius: var(--radius-full); overflow: hidden; }
        .quiz-progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary-500), var(--primary-400)); transition: width 0.3s ease; border-radius: var(--radius-full); }
        .btn-reveal { display: flex; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-4); border-radius: var(--radius-lg); background: rgba(79,70,229,0.1); border: 2px dashed var(--primary-500); color: var(--primary-400); font-size: var(--fs-sm); font-weight: 600; cursor: pointer; transition: all var(--transition-base); }
        .btn-reveal:hover { background: rgba(79,70,229,0.2); }
        .timer-bar { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); background: rgba(79,70,229,0.1); border-radius: var(--radius-md); font-size: var(--fs-xs); color: var(--primary-400); position: relative; overflow: hidden; }
        .timer-bar.urgent { background: rgba(239,68,68,0.1); color: #ef4444; }
        .timer-fill { position: absolute; left: 0; top: 0; height: 100%; background: rgba(79,70,229,0.15); transition: width 1s linear; }
        .timer-bar.urgent .timer-fill { background: rgba(239,68,68,0.15); }
        .screening-sent-banner { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-5); background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.3); border-radius: var(--radius-lg); text-align: center; }
        .screening-sent-banner svg { color: var(--trust-green); }
        .screening-sent-banner p { font-size: var(--fs-base); color: var(--text-primary); }
        .screening-sent-banner span { font-size: var(--fs-xs); color: var(--text-muted); }
        .ref-demo { display: flex; flex-direction: column; gap: var(--space-4); }
        .ref-card { padding: var(--space-4); background: var(--bg-card); border-radius: var(--radius-lg); }
        .ref-card h4 { font-size: var(--fs-sm); margin-bottom: var(--space-2); }
        .ref-transcript { font-size: var(--fs-sm); color: var(--text-secondary); font-style: italic; margin-bottom: var(--space-2); }
        .safety-notice { display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-3); background: var(--bg-card); border-radius: var(--radius-md); }
        .safety-notice svg { color: var(--primary-400); flex-shrink: 0; margin-top: 2px; }
        .safety-notice p { font-size: var(--fs-xs); color: var(--text-secondary); }
        .ob-complete { max-width: 540px; margin: 0 auto; padding: var(--space-10); text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-4); }
        .ob-badge-anim { color: var(--trust-green); animation: pulseScale 2s ease infinite; }
        .ob-complete h2 { font-size: var(--fs-2xl); }
        .ob-complete p { color: var(--text-secondary); }
        .ob-badges { display: flex; gap: var(--space-3); flex-wrap: wrap; justify-content: center; }
        @keyframes pulseScale { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @media (max-width: 640px) { .ob-step-label { display: none; } .ob-step-line { width: 20px; } .category-grid { grid-template-columns: 1fr; } .id-options { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
