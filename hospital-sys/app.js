import { auth, db } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    writeBatch,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Global State
let currentUser = null;
let currentView = 'analytics';
const listeners = []; // Store cleanup functions for snapshots

// ============================================
// MOCK DATA FOR DEMONSTRATION
// ============================================

const MOCK_DATA = {
    // KPI Summary
    kpis: {
        totalPatients: 1247,
        availableDoctors: 34,
        operationsToday: 12,
        hospitalEarnings: 2847500
    },
    
    // Patient Inflow Statistics (Last 7 days)
    patientInflowStats: [
        { day: 'Mon', count: 45 },
        { day: 'Tue', count: 52 },
        { day: 'Wed', count: 38 },
        { day: 'Thu', count: 61 },
        { day: 'Fri', count: 55 },
        { day: 'Sat', count: 42 },
        { day: 'Sun', count: 35 }
    ],
    
    // Department Occupancy
    departmentOccupancy: [
        { department: 'Cardiology', occupancy: 85, color: '#2563eb' },
        { department: 'Neurology', occupancy: 72, color: '#7c3aed' },
        { department: 'Pediatrics', occupancy: 68, color: '#0891b2' },
        { department: 'Orthopedics', occupancy: 91, color: '#059669' },
        { department: 'General', occupancy: 45, color: '#ea580c' }
    ],
    
    // Patients List
    patients: [
        { id: 'P001', name: 'Rajesh Kumar', age: 45, condition: 'Hypertension', admissionDate: '2025-12-10', status: 'Admitted', department: 'Cardiology' },
        { id: 'P002', name: 'Priya Sharma', age: 32, condition: 'Diabetes Type 2', admissionDate: '2025-12-09', status: 'Admitted', department: 'General' },
        { id: 'P003', name: 'Amit Patel', age: 58, condition: 'Knee Surgery', admissionDate: '2025-12-08', status: 'Discharged', department: 'Orthopedics' },
        { id: 'P004', name: 'Sneha Reddy', age: 28, condition: 'Pregnancy Care', admissionDate: '2025-12-11', status: 'Admitted', department: 'Obstetrics' },
        { id: 'P005', name: 'Vikram Singh', age: 67, condition: 'Stroke Recovery', admissionDate: '2025-12-07', status: 'Admitted', department: 'Neurology' },
        { id: 'P006', name: 'Anita Desai', age: 41, condition: 'Appendicitis', admissionDate: '2025-12-12', status: 'Admitted', department: 'Surgery' },
        { id: 'P007', name: 'Ravi Verma', age: 35, condition: 'Fracture', admissionDate: '2025-12-06', status: 'Discharged', department: 'Orthopedics' },
        { id: 'P008', name: 'Kavita Menon', age: 50, condition: 'Asthma', admissionDate: '2025-12-10', status: 'Admitted', department: 'Respiratory' },
        { id: 'P009', name: 'Suresh Rao', age: 72, condition: 'Heart Surgery', admissionDate: '2025-12-05', status: 'Admitted', department: 'Cardiology' },
        { id: 'P010', name: 'Meera Joshi', age: 29, condition: 'Routine Checkup', admissionDate: '2025-12-12', status: 'Discharged', department: 'General' }
    ],
    
    // Doctors List
    doctors: [
        { id: 'D001', name: 'Dr. Arun Mehta', specialization: 'Cardiologist', availability: 'On-Duty', experience: '15 years', patients: 23 },
        { id: 'D002', name: 'Dr. Sunita Iyer', specialization: 'Neurologist', availability: 'On-Duty', experience: '12 years', patients: 18 },
        { id: 'D003', name: 'Dr. Ramesh Gupta', specialization: 'Orthopedic Surgeon', availability: 'Off-Duty', experience: '20 years', patients: 31 },
        { id: 'D004', name: 'Dr. Priya Nair', specialization: 'Pediatrician', availability: 'On-Duty', experience: '8 years', patients: 27 },
        { id: 'D005', name: 'Dr. Karthik Reddy', specialization: 'General Physician', availability: 'On-Duty', experience: '10 years', patients: 42 },
        { id: 'D006', name: 'Dr. Anjali Deshmukh', specialization: 'Gynecologist', availability: 'On-Duty', experience: '14 years', patients: 19 },
        { id: 'D007', name: 'Dr. Manoj Kumar', specialization: 'Surgeon', availability: 'Off-Duty', experience: '18 years', patients: 15 },
        { id: 'D008', name: 'Dr. Neha Kapoor', specialization: 'Dermatologist', availability: 'On-Duty', experience: '6 years', patients: 12 }
    ],
    
    // Medical Records
    records: [
        { id: 'R001', patientName: 'Rajesh Kumar', date: '2025-12-12', type: 'Blood Test', doctor: 'Dr. Arun Mehta', notes: 'Cholesterol levels high' },
        { id: 'R002', patientName: 'Priya Sharma', date: '2025-12-11', type: 'X-Ray', doctor: 'Dr. Karthik Reddy', notes: 'No abnormalities detected' },
        { id: 'R003', patientName: 'Vikram Singh', date: '2025-12-10', type: 'MRI Scan', doctor: 'Dr. Sunita Iyer', notes: 'Brain scan shows recovery progress' },
        { id: 'R004', patientName: 'Anita Desai', date: '2025-12-12', type: 'Surgery Report', doctor: 'Dr. Manoj Kumar', notes: 'Appendectomy successful' },
        { id: 'R005', patientName: 'Kavita Menon', date: '2025-12-11', type: 'Pulmonary Test', doctor: 'Dr. Karthik Reddy', notes: 'Lung function improving' },
        { id: 'R006', patientName: 'Suresh Rao', date: '2025-12-09', type: 'ECG', doctor: 'Dr. Arun Mehta', notes: 'Heart rhythm stable post-surgery' },
        { id: 'R007', patientName: 'Meera Joshi', date: '2025-12-12', type: 'General Checkup', doctor: 'Dr. Karthik Reddy', notes: 'All vitals normal' },
        { id: 'R008', patientName: 'Amit Patel', date: '2025-12-08', type: 'Post-Op Review', doctor: 'Dr. Ramesh Gupta', notes: 'Recovery on track' }
    ],
    
    // Billing Information
    billing: [
        { invoiceId: 'INV-2025-001', patientName: 'Rajesh Kumar', amount: 45000, date: '2025-12-12', status: 'Paid', method: 'Insurance' },
        { invoiceId: 'INV-2025-002', patientName: 'Priya Sharma', amount: 12500, date: '2025-12-11', status: 'Pending', method: 'Cash' },
        { invoiceId: 'INV-2025-003', patientName: 'Amit Patel', amount: 125000, date: '2025-12-08', status: 'Paid', method: 'Card' },
        { invoiceId: 'INV-2025-004', patientName: 'Sneha Reddy', amount: 85000, date: '2025-12-11', status: 'Pending', method: 'Insurance' },
        { invoiceId: 'INV-2025-005', patientName: 'Vikram Singh', amount: 215000, date: '2025-12-10', status: 'Paid', method: 'Insurance' },
        { invoiceId: 'INV-2025-006', patientName: 'Anita Desai', amount: 65000, date: '2025-12-12', status: 'Pending', method: 'Card' },
        { invoiceId: 'INV-2025-007', patientName: 'Ravi Verma', amount: 35000, date: '2025-12-06', status: 'Paid', method: 'Cash' },
        { invoiceId: 'INV-2025-008', patientName: 'Kavita Menon', amount: 18000, date: '2025-12-10', status: 'Paid', method: 'Insurance' },
        { invoiceId: 'INV-2025-009', patientName: 'Suresh Rao', amount: 325000, date: '2025-12-09', status: 'Pending', method: 'Insurance' },
        { invoiceId: 'INV-2025-010', patientName: 'Meera Joshi', amount: 2500, date: '2025-12-12', status: 'Paid', method: 'Cash' }
    ]
};

// ============================================

// Test Firebase connection immediately
console.log('='.repeat(60));
console.log('🔥 APP.JS LOADED - STARTING INITIALIZATION');
console.log('='.repeat(60));
console.log('Auth object:', auth);
console.log('DB object:', db);
console.log('Current URL:', window.location.href);

// --- Authentication & Routing ---

let authInitialized = false;
let isAuthenticating = false;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const path = window.location.pathname;
    const isLoginPage = path.includes('login.html');
    const isDashboard = path.includes('dashboard.html');
    const isHome = path.endsWith('index.html') || path.endsWith('/') || path === '/';

    console.log('Auth state changed:', {
        user: user ? user.email : 'Not logged in',
        path: path,
        isLoginPage,
        isDashboard,
        isHome
    });

    if (user) {
        console.log('✓ User authenticated:', user.email);
        
        if (isLoginPage && !isAuthenticating) {
            console.log('→ Redirecting from login to dashboard...');
            window.location.replace('dashboard.html');
            return;
        }

        if (isHome) {
            console.log('→ Updating landing page UI');
            updateLandingPageAuthUI(true);
        }

        if (isDashboard) {
            console.log('→ Initializing dashboard');
            if (!authInitialized) {
                authInitialized = true;
                initDashboard();
            }
        }
    } else {
        console.log('✗ User not authenticated');
        authInitialized = false;
        
        if (isDashboard) {
            console.log('→ Redirecting to login');
            window.location.replace('login.html');
            return;
        }
        
        if (isHome) {
            updateLandingPageAuthUI(false);
        }
    }
});

function updateLandingPageAuthUI(isLoggedIn) {
    // Update all action buttons consistently
    const buttons = [
        { id: 'nav-action-btn', loggedInText: 'Dashboard', loggedOutText: 'Get Started' },
        { id: 'hero-action-btn', loggedInText: 'View Dashboard', loggedOutText: 'Get Started Now' },
        { id: 'cta-action-btn', loggedInText: 'Go to Dashboard', loggedOutText: 'Get Started Now' }
    ];

    buttons.forEach(btnConfig => {
        const btn = document.getElementById(btnConfig.id);
        if (btn) {
            if (isLoggedIn) {
                btn.innerHTML = `<i class="fas fa-columns"></i> ${btnConfig.loggedInText}`;
                btn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = 'dashboard.html';
                };
                btn.href = 'dashboard.html';
            } else {
                btn.innerHTML = `<i class="fas fa-sign-in-alt"></i> ${btnConfig.loggedOutText}`;
                btn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = 'login.html';
                };
                btn.href = 'login.html';
            }
        }
    });
}

// Landing Page Logic
const loginModal = document.getElementById('login-modal');
if (loginModal) {
    // Open Modal Triggers are handled in HTML onclick or updateLandingPageAuthUI

    // Close Modal
    const closeBtn = document.getElementById('close-login-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            loginModal.classList.remove('active');
        });
    }

    // Close on outside click
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });
}

// Login/Signup Logic (Global)
const authForm = document.getElementById('auth-form');
console.log('🔍 Looking for auth-form:', authForm);

if (authForm) {
    console.log('✓ Auth form found, setting up event listeners');
    let isSignUp = false;
    const subtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleLink = document.getElementById('auth-toggle-link');
    const toggleText = document.getElementById('auth-toggle-text');
    
    console.log('Form elements:', { subtitle, submitBtn, toggleLink, toggleText });

    if (toggleLink) {
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUp = !isSignUp;

            if (isSignUp) {
                if (subtitle) subtitle.textContent = 'Create your account';
                if (submitBtn) submitBtn.textContent = 'Sign Up';
                if (toggleText) toggleText.textContent = 'Already have an account?';
                toggleLink.textContent = 'Sign In';
            } else {
                if (subtitle) subtitle.textContent = 'Sign In to your account';
                if (submitBtn) submitBtn.textContent = 'Sign In';
                if (toggleText) toggleText.textContent = "Don't have an account?";
                toggleLink.textContent = 'Sign up for free';
            }
        });
    }

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('='.repeat(60));
        console.log('📝 📝 📝 FORM SUBMITTED!');
        console.log('='.repeat(60));
        console.log('Event:', e);
        console.log('Form:', authForm);
        console.log('Time:', new Date().toISOString());
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('auth-error');

        console.log('Form data:', { email, passwordLength: password.length, isSignUp });

        if (errorDiv) {
            errorDiv.classList.add('hidden');
            errorDiv.textContent = '';
        }

        // Basic Validation
        if (password.length < 6) {
            console.warn('⚠️ Password too short');
            showError('Password must be at least 6 characters');
            return;
        }

        console.log('🔐 Attempting authentication...');
        console.log('isSignUp:', isSignUp);
        console.log('Email:', email);
        console.log('Password length:', password.length);
        console.log('Auth object before call:', auth);
        
        isAuthenticating = true;
        
        console.log('Calling Firebase auth function...');
        const promise = isSignUp ?
            createUserWithEmailAndPassword(auth, email, password) :
            signInWithEmailAndPassword(auth, email, password);
        
        console.log('✓ Promise created successfully:', promise);
        console.log('Promise type:', typeof promise);
        console.log('Is Promise?', promise instanceof Promise);

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }

        promise.then(async (userCredential) => {
            console.log('='.repeat(60));
            console.log('✓✓✓ PROMISE THEN BLOCK EXECUTED ✓✓✓');
            console.log('='.repeat(60));
            const user = userCredential.user;
            console.log('✓ ✓ ✓ Authentication SUCCESS!');
            console.log('User:', user.email, user.uid);
            
            if (isSignUp) {
                console.log('📄 Creating user profile in Firestore...');
                try {
                    await setDoc(doc(db, "users", user.uid), {
                        email: user.email,
                        createdAt: new Date().toISOString(),
                        role: 'admin'
                    });
                    console.log('✓ User profile created successfully');
                } catch (err) {
                    console.error('✗ Error creating user profile:', err);
                }
            }
            
            // Immediate redirect to dashboard
            console.log('='.repeat(60));
            console.log('🚀🚀🚀 ABOUT TO REDIRECT 🚀🚀🚀');
            console.log('='.repeat(60));
            console.log('Current location:', window.location.href);
            console.log('Target: dashboard.html');
            
            // Small delay to allow Firestore operations to complete
            setTimeout(() => {
                console.log('⏰ Timeout executing, redirecting now...');
                isAuthenticating = false;
                console.log('Setting window.location.href to dashboard.html');
                window.location.href = 'dashboard.html';
                console.log('After setting location (should not see this)');
            }, 100);
            
        }).catch((error) => {
            console.log('='.repeat(60));
            console.log('✗✗✗ PROMISE CATCH BLOCK EXECUTED ✗✗✗');
            console.log('='.repeat(60));
            isAuthenticating = false;
            console.error('✗ ✗ ✗ Authentication ERROR!');
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error:', error);
            
            let errorMessage = error.message;
            
            // Provide user-friendly error messages
            if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address format';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password';
            } else if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email already registered. Please sign in instead.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password should be at least 6 characters';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            showError(errorMessage);
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
            }
        });

        function showError(msg) {
            if (errorDiv) {
                errorDiv.textContent = msg;
                errorDiv.classList.remove('hidden');
            } else {
                alert(msg);
            }
        }
    });
} else {
    console.error('❌ Auth form NOT found! Check if login.html has id="auth-form"');
}

// Logout Logic
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'login.html';
        });
    });
}

// --- Dashboard Logic ---

function initDashboard() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            currentView = item.dataset.view;
            document.getElementById('page-title').textContent = item.textContent.trim();
            renderView(currentView);
        });
    });

    renderView('analytics');

    // Sidebar Toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (toggleBtn && sidebar && mainContent) {
        toggleBtn.addEventListener('click', () => {
            // For mobile - slide in/out
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('active');
            } else {
                // For desktop - collapse/expand
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            }
        });
    }

    // Brand Link to Overview
    const brandLink = document.getElementById('dashboard-brand-link');
    if (brandLink) {
        brandLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Update Active State
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            const analyticsNav = document.querySelector('.nav-item[data-view="analytics"]');
            if (analyticsNav) analyticsNav.classList.add('active');

            // Render View
            currentView = 'analytics';
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) pageTitle.textContent = 'Analytics';
            renderView('analytics');
        });
    }
}

// Cleanup listeners when switching views
function clearListeners() {
    listeners.forEach(unsubscribe => unsubscribe());
    listeners.length = 0;
}

function renderView(view) {
    clearListeners();
    const appRoot = document.getElementById('app-root');
    appRoot.innerHTML = '<div class="flex-row justify-center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

    switch (view) {
        case 'analytics': renderAnalytics(appRoot); break;
        case 'patients': renderPatientsView(appRoot); break;
        case 'doctors': renderDoctorsView(appRoot); break;
        case 'records': renderRecordsView(appRoot); break;
        case 'billing': renderBillingView(appRoot); break;
        case 'settings': renderSettings(appRoot); break;
    }
}

// --- Views ---

function renderOverview(root) {
    root.innerHTML = `
        <div class="analytics-header" style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">Dashboard Analytics</h2>
            <p style="color: var(--text-muted);">Real-time insights and key performance metrics</p>
        </div>
        
        <!-- Stats Grid -->
        <div class="stats-grid" id="stats-container" style="margin-bottom: 2rem;"></div>
        
        <!-- Charts Section -->
        <div class="charts-section" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; margin-bottom: 2rem;">
            <div class="card">
                <h3 class="font-bold mb-4" style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-chart-pie" style="color: var(--primary);"></i>
                    Patient Status Distribution
                </h3>
                <canvas id="statusChart"></canvas>
            </div>
            <div class="card">
                <h3 class="font-bold mb-4" style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-chart-line" style="color: var(--success);"></i>
                    Revenue by Month
                </h3>
                <canvas id="revenueChart"></canvas>
            </div>
        </div>
        
        <!-- Additional Metrics -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
            <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="opacity: 0.9; font-size: 0.875rem; margin-bottom: 0.5rem;">Avg. Visit Duration</p>
                        <h3 style="font-size: 2rem; font-weight: 700;">45 min</h3>
                    </div>
                    <i class="fas fa-clock fa-2x" style="opacity: 0.8;"></i>
                </div>
            </div>
            
            <div class="card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="opacity: 0.9; font-size: 0.875rem; margin-bottom: 0.5rem;">Patient Satisfaction</p>
                        <h3 style="font-size: 2rem; font-weight: 700;">4.8/5</h3>
                    </div>
                    <i class="fas fa-star fa-2x" style="opacity: 0.8;"></i>
                </div>
            </div>
            
            <div class="card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="opacity: 0.9; font-size: 0.875rem; margin-bottom: 0.5rem;">Bed Occupancy</p>
                        <h3 style="font-size: 2rem; font-weight: 700;">78%</h3>
                    </div>
                    <i class="fas fa-bed fa-2x" style="opacity: 0.8;"></i>
                </div>
            </div>
        </div>
    `;

    // Fetch real-time stats
    const counts = { patients: 0, doctors: 0, records: 0, revenue: 0 };

    ['patients', 'doctors', 'records'].forEach(col => {
        const unsub = onSnapshot(
            collection(db, col), 
            (snap) => {
                counts[col] = snap.size;
                updateStatsUI(counts);
                console.log(`${col} count:`, snap.size);
            },
            (error) => {
                console.error(`Error fetching ${col}:`, error);
                console.error('Error details:', error.code, error.message);
            }
        );
        listeners.push(unsub);
    });

    // Revenue handling
    const unsubBill = onSnapshot(
        collection(db, 'billing'), 
        (snap) => {
            let total = 0;
            snap.forEach(doc => total += Number(doc.data().amount || 0));
            counts.revenue = total;
            updateStatsUI(counts);
            console.log('Billing count:', snap.size, 'Total revenue:', total);
        },
        (error) => {
            console.error('Error fetching billing:', error);
            console.error('Error details:', error.code, error.message);
        }
    );
    listeners.push(unsubBill);

    // Initialize Charts
    setTimeout(() => {
        initializeCharts();
    }, 100);
}

function initializeCharts() {
    // Patient Status Chart
    new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',
        data: {
            labels: ['Critical', 'Stable', 'Recovering', 'Discharged'],
            datasets: [{
                data: [12, 45, 23, 15],
                backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#64748b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            }
        }
    });

    // Revenue Chart
    new Chart(document.getElementById('revenueChart'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue (₹)',
                data: [45000, 52000, 48000, 61000, 58000, 67000],
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderColor: '#2563eb',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Analytics is an alias for Overview
function renderAnalytics(root) {
    renderOverview(root);
}

// ===========================================
// NEW VIEW FUNCTIONS WITH MOCK DATA
// ===========================================

function renderPatientsView(root) {
    root.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                <i class="fas fa-users" style="color: var(--primary); margin-right: 0.5rem;"></i>
                Patients Management
            </h2>
            <p style="color: var(--text-muted); font-size: 0.95rem;">View and manage all patient records</p>
        </div>

        <!-- Search Bar -->
        <div class="card" style="margin-bottom: 1.5rem; padding: 1rem;">
            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px; position: relative;">
                    <i class="fas fa-search" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                    <input type="text" id="patientSearch" placeholder="Search patients by name, condition, or ID..." 
                        style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9375rem;">
                </div>
                <select id="statusFilter" style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9375rem;">
                    <option value="">All Status</option>
                    <option value="Admitted">Admitted</option>
                    <option value="Discharged">Discharged</option>
                </select>
            </div>
        </div>

        <!-- Patients Table -->
        <div class="card" style="overflow-x: auto;">
            <table id="patientsTable" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">ID</th>
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Name</th>
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Age</th>
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Condition</th>
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Department</th>
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Admission Date</th>
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Status</th>
                    </tr>
                </thead>
                <tbody id="patientsTableBody">
                    ${renderPatientsRows(MOCK_DATA.patients)}
                </tbody>
            </table>
        </div>
    `;

    // Attach search and filter listeners
    document.getElementById('patientSearch')?.addEventListener('input', filterPatients);
    document.getElementById('statusFilter')?.addEventListener('change', filterPatients);
}

function renderPatientsRows(patients) {
    if (!patients || patients.length === 0) {
        return '<tr><td colspan="7" style="padding: 2rem; text-align: center; color: var(--text-muted);">No patients found</td></tr>';
    }
    
    return patients.map(patient => `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
            <td style="padding: 1rem; color: var(--text-muted); font-family: monospace; font-size: 0.875rem;">${patient.id}</td>
            <td style="padding: 1rem; font-weight: 500; color: var(--text-main);">${patient.name}</td>
            <td style="padding: 1rem; color: var(--text-muted);">${patient.age}</td>
            <td style="padding: 1rem; color: var(--text-main);">${patient.condition}</td>
            <td style="padding: 1rem;">
                <span style="padding: 0.25rem 0.75rem; background: #eff6ff; color: #2563eb; border-radius: 12px; font-size: 0.8125rem; font-weight: 500;">
                    ${patient.department}
                </span>
            </td>
            <td style="padding: 1rem; color: var(--text-muted); font-size: 0.875rem;">${patient.admissionDate}</td>
            <td style="padding: 1rem;">
                <span style="padding: 0.25rem 0.75rem; background: ${patient.status === 'Admitted' ? '#dcfce7' : '#f3f4f6'}; color: ${patient.status === 'Admitted' ? '#059669' : '#6b7280'}; border-radius: 12px; font-size: 0.8125rem; font-weight: 600;">
                    ${patient.status}
                </span>
            </td>
        </tr>
    `).join('');
}

function filterPatients() {
    const searchTerm = document.getElementById('patientSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    const filtered = MOCK_DATA.patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm) || 
                            patient.condition.toLowerCase().includes(searchTerm) ||
                            patient.id.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || patient.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const tbody = document.getElementById('patientsTableBody');
    if (tbody) {
        tbody.innerHTML = renderPatientsRows(filtered);
    }
}

function renderDoctorsView(root) {
    root.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                <i class="fas fa-user-md" style="color: var(--primary); margin-right: 0.5rem;"></i>
                Doctors Directory
            </h2>
            <p style="color: var(--text-muted); font-size: 0.95rem;">Our expert medical professionals</p>
        </div>

        <!-- Doctors Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
            ${MOCK_DATA.doctors.map(doctor => `
                <div class="card" style="transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 20px 25px -5px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow=''">
                    <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: 700; flex-shrink: 0;">
                            ${doctor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style="flex: 1;">
                            <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">${doctor.name}</h3>
                            <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0.5rem;">${doctor.specialization}</p>
                            <span style="padding: 0.25rem 0.75rem; background: ${doctor.availability === 'On-Duty' ? '#dcfce7' : '#fee2e2'}; color: ${doctor.availability === 'On-Duty' ? '#059669' : '#dc2626'}; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                                <i class="fas fa-circle" style="font-size: 0.5rem; margin-right: 0.25rem;"></i>
                                ${doctor.availability}
                            </span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1.5rem; padding: 1rem 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; margin-bottom: 1rem;">
                        <div>
                            <p style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 0.25rem;">Experience</p>
                            <p style="font-weight: 600; color: var(--text-main);">${doctor.experience}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 0.25rem;">Patients</p>
                            <p style="font-weight: 600; color: var(--text-main);">${doctor.patients}</p>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary w-full" style="font-size: 0.875rem; padding: 0.625rem;">
                        <i class="fas fa-calendar-check" style="margin-right: 0.5rem;"></i>
                        Book Appointment
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function renderRecordsView(root) {
    root.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                <i class="fas fa-file-medical" style="color: var(--primary); margin-right: 0.5rem;"></i>
                Medical Records
            </h2>
            <p style="color: var(--text-muted); font-size: 0.95rem;">Recent medical history and reports</p>
        </div>

        <!-- Records List -->
        <div style="display: grid; gap: 1rem;">
            ${MOCK_DATA.records.map(record => `
                <div class="card" style="transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
                    <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
                        <div style="width: 48px; height: 48px; background: #eff6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-file-medical-alt fa-lg" style="color: #2563eb;"></i>
                        </div>
                        <div style="flex: 1; min-width: 250px;">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                                <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-main);">${record.patientName}</h3>
                                <span style="padding: 0.25rem 0.75rem; background: #f3f4f6; color: var(--text-muted); border-radius: 12px; font-size: 0.75rem; font-weight: 500;">
                                    ${record.id}
                                </span>
                            </div>
                            <div style="display: flex; gap: 2rem; color: var(--text-muted); font-size: 0.875rem; flex-wrap: wrap;">
                                <span><i class="fas fa-stethoscope" style="margin-right: 0.5rem;"></i>${record.type}</span>
                                <span><i class="fas fa-user-md" style="margin-right: 0.5rem;"></i>${record.doctor}</span>
                                <span><i class="fas fa-calendar" style="margin-right: 0.5rem;"></i>${record.date}</span>
                            </div>
                            <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.5rem;">${record.notes}</p>
                        </div>
                        <button class="btn btn-outline" style="flex-shrink: 0;">
                            View Details
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderBillingView(root) {
    const totalRevenue = MOCK_DATA.billing.reduce((sum, b) => sum + b.amount, 0);
    const paidCount = MOCK_DATA.billing.filter(b => b.status === 'Paid').length;
    const pendingCount = MOCK_DATA.billing.filter(b => b.status === 'Pending').length;
    
    root.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                <i class="fas fa-file-invoice-dollar" style="color: var(--primary); margin-right: 0.5rem;"></i>
                Billing & Payments
            </h2>
            <p style="color: var(--text-muted); font-size: 0.95rem;">Financial records and payment status</p>
        </div>

        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div class="card" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; border: none;">
                <p style="opacity: 0.9; font-size: 0.875rem; margin-bottom: 0.5rem;">Total Revenue</p>
                <h3 style="font-size: 1.75rem; font-weight: 700;">₹${(totalRevenue / 100000).toFixed(2)}L</h3>
            </div>
            <div class="card" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border: none;">
                <p style="opacity: 0.9; font-size: 0.875rem; margin-bottom: 0.5rem;">Paid Invoices</p>
                <h3 style="font-size: 1.75rem; font-weight: 700;">${paidCount}</h3>
            </div>
            <div class="card" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; border: none;">
                <p style="opacity: 0.9; font-size: 0.875rem; margin-bottom: 0.5rem;">Pending Invoices</p>
                <h3 style="font-size: 1.75rem; font-weight: 700;">${pendingCount}</h3>
            </div>
        </div>

        <!-- Billing Table -->
        <div class="card" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Invoice ID</th>
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Patient Name</th>
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Amount</th>
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Date</th>
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Payment Method</th>
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Status</th>
                        <th style="padding: 1rem; font-weight: 600; color: var(--text-main);">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${MOCK_DATA.billing.map(bill => `
                        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                            <td style="padding: 1rem; font-family: monospace; font-size: 0.875rem; color: var(--text-muted);">${bill.invoiceId}</td>
                            <td style="padding: 1rem; font-weight: 500; color: var(--text-main);">${bill.patientName}</td>
                            <td style="padding: 1rem; font-weight: 600; color: var(--text-main);">₹${bill.amount.toLocaleString()}</td>
                            <td style="padding: 1rem; color: var(--text-muted); font-size: 0.875rem;">${bill.date}</td>
                            <td style="padding: 1rem;">
                                <span style="padding: 0.25rem 0.75rem; background: #f3f4f6; color: var(--text-muted); border-radius: 12px; font-size: 0.8125rem; font-weight: 500;">
                                    ${bill.method}
                                </span>
                            </td>
                            <td style="padding: 1rem;">
                                <span style="padding: 0.25rem 0.75rem; background: ${bill.status === 'Paid' ? '#dcfce7' : '#fee2e2'}; color: ${bill.status === 'Paid' ? '#059669' : '#dc2626'}; border-radius: 12px; font-size: 0.8125rem; font-weight: 600;">
                                    <i class="fas fa-${bill.status === 'Paid' ? 'check-circle' : 'clock'}"></i>
                                    ${bill.status}
                                </span>
                            </td>
                            <td style="padding: 1rem;">
                                <button class="btn btn-outline" style="font-size: 0.8125rem; padding: 0.375rem 0.75rem;">
                                    <i class="fas fa-download"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function updateStatsUI(counts) {
    const container = document.getElementById('stats-container');
    if (!container) return;

    const stats = [
        { label: 'Total Patients', value: counts.patients, icon: 'user-injured', color: '#0066CC', trend: '+12%' },
        { label: 'Active Doctors', value: counts.doctors, icon: 'user-md', color: '#059669', trend: '+5%' },
        { label: 'Appointments', value: counts.records, icon: 'calendar-check', color: '#f59e0b', trend: '+8%' },
        { label: 'Total Revenue', value: '₹' + counts.revenue.toLocaleString(), icon: 'rupee-sign', color: '#DC2626', trend: '+18%' },
    ];

    container.innerHTML = stats.map(stat => `
        <div class="stat-card" style="position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: ${stat.color}15; border-radius: 50%; transform: translate(30%, -30%);"></div>
            <div class="flex-row justify-between" style="position: relative; z-index: 1;">
                <span class="stat-label">${stat.label}</span>
                <i class="fas fa-${stat.icon}" style="color: ${stat.color}; opacity: 0.8; font-size: 1.5rem;"></i>
            </div>
            <div style="position: relative; z-index: 1;">
                <div class="stat-value" style="margin-bottom: 0.5rem;">${stat.value}</div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: #059669; font-size: 0.875rem; font-weight: 600;">
                        <i class="fas fa-arrow-up"></i> ${stat.trend}
                    </span>
                    <span style="color: var(--text-muted); font-size: 0.75rem;">vs last month</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCollection(root, collectionName, fields) {
    const hasSearch = collectionName === 'patients' || collectionName === 'doctors';

    root.innerHTML = `
        <div class="flex-row justify-between mb-4">
            ${hasSearch ? `
            <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input type="text" id="search-${collectionName}" class="form-input search-input" placeholder="Search ${collectionName}...">
            </div>` : '<div></div>'}
            
            <button onclick="openModal('${collectionName}')" class="btn btn-primary">
                <i class="fas fa-plus"></i> Add New
            </button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        ${fields.map(f => `<th>${f.toUpperCase()}</th>`).join('')}
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody id="table-body"></tbody>
            </table>
        </div>
    `;

    console.log(`Loading collection: ${collectionName}`);
    
    let q;
    try {
        q = query(collection(db, collectionName), orderBy(fields[0]));
    } catch (error) {
        console.warn(`Cannot order by ${fields[0]}, trying without ordering:`, error);
        q = query(collection(db, collectionName));
    }

    const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
            const tbody = document.getElementById('table-body');
            if (!tbody) return;

            console.log(`${collectionName} loaded:`, snapshot.size, 'documents');
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            window.currentCollectionData = docs; // For search filtering

            renderTableRows(tbody, docs, fields, collectionName);
        },
        (error) => {
            console.error(`Error loading ${collectionName}:`, error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            const tbody = document.getElementById('table-body');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="${fields.length + 1}" style="text-align: center; padding: 2rem; color: var(--danger);">
                    <i class="fas fa-exclamation-triangle"></i><br>
                    Database Error: ${error.message}<br>
                    <small>Check console for details</small>
                </td></tr>`;
            }
        }
    );
    listeners.push(unsubscribe);

    // Search Handler
    if (hasSearch) {
        const searchInput = document.getElementById(`search-${collectionName}`);
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = window.currentCollectionData.filter(item =>
                fields.some(key => String(item[key]).toLowerCase().includes(term))
            );
            renderTableRows(document.getElementById('table-body'), filtered, fields, collectionName);
        });
    }
}

function renderTableRows(tbody, docs, fields, collectionName) {
    tbody.innerHTML = docs.map(doc => `
        <tr>
            ${fields.map(f => `<td>${doc[f] || '-'}</td>`).join('')}
            <td>
                <button onclick="editItem('${collectionName}', '${doc.id}')" class="btn btn-secondary btn-sm" style="margin-right: 5px;">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteItem('${collectionName}', '${doc.id}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderSettings(root) {
    root.innerHTML = `
        <div class="card max-w-lg">
            <h3 class="font-bold mb-4">System Settings</h3>
            <p class="mb-4 text-muted">Use this to populate the database with sample data for testing.</p>
            <button onclick="generateSampleData()" class="btn btn-secondary">
                <i class="fas fa-database"></i> Generate Sample Data
            </button>
        </div>
    `;
}

// --- CRUD Operations ---

// Global Access for HTML Onclick
window.openModal = (type, editId = null) => {
    const modal = document.getElementById('modal-overlay');
    const form = document.getElementById('modal-form');
    const fieldsDiv = document.getElementById('modal-fields');
    const title = document.getElementById('modal-title');

    modal.classList.add('active');
    title.textContent = editId ? `Edit ${type.slice(0, -1)}` : `Add New ${type.slice(0, -1)}`;
    form.dataset.type = type;
    form.dataset.editId = editId || '';

    // Define fields based on type
    const schemas = {
        patients: [
            { id: 'name', type: 'text', label: 'Full Name' },
            { id: 'age', type: 'number', label: 'Age' },
            { id: 'condition', type: 'text', label: 'Condition' },
            { id: 'phone', type: 'tel', label: 'Phone' }
        ],
        doctors: [
            { id: 'name', type: 'text', label: 'Doctor Name' },
            { id: 'specialty', type: 'text', label: 'Specialty' },
            { id: 'email', type: 'email', label: 'Email' }
        ],
        records: [
            { id: 'patientId', type: 'text', label: 'Patient Name/ID' },
            { id: 'date', type: 'date', label: 'Date' },
            { id: 'type', type: 'text', label: 'Type (Checkup, Surgery)' },
            { id: 'notes', type: 'text', label: 'Notes' }
        ],
        billing: [
            { id: 'patientId', type: 'text', label: 'Patient Name/ID' },
            { id: 'amount', type: 'number', label: 'Amount (₹)' },
            { id: 'status', type: 'select', label: 'Status', options: ['Paid', 'Pending', 'Overdue'] },
            { id: 'date', type: 'date', label: 'Date' }
        ]
    };

    const schema = schemas[type];
    fieldsDiv.innerHTML = schema.map(field => `
        <div class="form-group">
            <label class="form-label">${field.label}</label>
            ${field.type === 'select' ? `
                <select id="input-${field.id}" class="form-input">
                    ${field.options.map(o => `<option value="${o}">${o}</option>`).join('')}
                </select>
            ` : `
                <input type="${field.type}" id="input-${field.id}" class="form-input" required>
            `}
        </div>
    `).join('');

    // Pre-fill if editing
    if (editId && window.currentCollectionData) {
        const item = window.currentCollectionData.find(d => d.id === editId);
        if (item) {
            schema.forEach(field => {
                const el = document.getElementById(`input-${field.id}`);
                if (el) el.value = item[field.id];
            });
        }
    }
};

window.closeModal = () => {
    document.getElementById('modal-overlay').classList.remove('active');
};

window.deleteItem = async (col, id) => {
    if (confirm('Are you sure you want to delete this record?')) {
        try {
            console.log(`Deleting document from ${col} with id:`, id);
            await deleteDoc(doc(db, col, id));
            console.log('Delete successful');
        } catch (e) {
            console.error('Delete error:', e);
            alert('Error deleting: ' + e.message + '\nCheck console for details');
        }
    }
};

window.editItem = (col, id) => {
    window.openModal(col, id);
};

window.generateSampleData = async () => {
    try {
        console.log('Generating sample data...');
        const batch = writeBatch(db);

        // Sample Patients
        const pRef = doc(collection(db, 'patients'));
        batch.set(pRef, { name: 'John Doe', age: 45, condition: 'Flu', phone: '555-0101' });

        // Sample Doctor
        const dRef = doc(collection(db, 'doctors'));
        batch.set(dRef, { name: 'Dr. Sarah Smith', specialty: 'Cardiology', email: 'sarah@medicore.com' });

        // Sample Record
        const rRef = doc(collection(db, 'records'));
        batch.set(rRef, { patientId: 'John Doe', date: '2025-12-12', type: 'Checkup', notes: 'Regular checkup' });

        // Sample Bill
        const bRef = doc(collection(db, 'billing'));
        batch.set(bRef, { patientId: 'John Doe', amount: 1500, status: 'Pending', date: '2025-12-12' });

        await batch.commit();
        console.log('Sample data generated successfully');
        alert('Sample data added successfully!');
    } catch (error) {
        console.error('Error generating sample data:', error);
        alert('Error generating sample data: ' + error.message + '\nCheck console for details');
    }
};

// Handle Form Submit
const modalForm = document.getElementById('modal-form');
if (modalForm) {
    modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const type = modalForm.dataset.type;
        const editId = modalForm.dataset.editId;
        const inputs = modalForm.querySelectorAll('input, select');
        const data = {};

        console.log('Form submission for:', type, editId ? '(edit)' : '(new)');

        // Validation
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) isValid = false;
            // Negative check for numbers
            if (input.type === 'number' && Number(input.value) < 0) {
                alert('Values cannot be negative');
                isValid = false;
            }
            const key = input.id.replace('input-', '');
            data[key] = input.value;
        });

        if (!isValid) {
            console.warn('Form validation failed');
            return;
        }

        console.log('Data to save:', data);

        try {
            if (editId) {
                console.log('Updating document:', type, editId);
                await updateDoc(doc(db, type, editId), data);
                console.log('Update successful');
            } else {
                console.log('Adding new document to:', type);
                const docRef = await addDoc(collection(db, type), data);
                console.log('Document added with ID:', docRef.id);
            }
            window.closeModal();
        } catch (error) {
            console.error('Error saving data:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            alert('Error saving: ' + error.message + '\n\nCheck browser console for details');
        }
    });
}