// ============================================
// DASHBOARD VIEWS MODULE
// Complete implementation for all dashboard sections
// ============================================

import { MOCK_DATA } from './app.js';

// ===========================================
// ANALYTICS / OVERVIEW VIEW
// ===========================================
export function renderAnalytics(root) {
    root.innerHTML = `
        <div class="analytics-header" style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                <i class="fas fa-chart-line" style="color: var(--primary); margin-right: 0.5rem;"></i>
                Dashboard Analytics
            </h2>
            <p style="color: var(--text-muted); font-size: 0.95rem;">Real-time insights and key performance metrics for MediCore Hospital</p>
        </div>
        
        <!-- KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
            ${renderKPICards()}
        </div>
        
        <!-- Charts Section -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
            <div class="card">
                <h3 class="font-bold mb-4" style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-main);">
                    <i class="fas fa-chart-line" style="color: var(--primary);"></i>
                    Patient Inflow Statistics
                    <span style="margin-left: auto; font-size: 0.75rem; font-weight: 500; color: var(--text-muted);">Last 7 Days</span>
                </h3>
                <canvas id="inflowChart" style="max-height: 300px;"></canvas>
            </div>
            
            <div class="card">
                <h3 class="font-bold mb-4" style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-main);">
                    <i class="fas fa-chart-pie" style="color: var(--success);"></i>
                    Department Occupancy
                    <span style="margin-left: auto; font-size: 0.75rem; font-weight: 500; color: var(--text-muted);">Current Status</span>
                </h3>
                <canvas id="occupancyChart" style="max-height: 300px;"></canvas>
            </div>
        </div>
        
        <!-- Additional Metrics -->
        ${renderAdditionalMetrics()}
    `;

    setTimeout(() => initializeAnalyticsCharts(), 100);
}

function renderKPICards() {
    const kpis = [
        {
            title: 'Total Patients',
            value: MOCK_DATA.kpis.totalPatients.toLocaleString(),
            icon: 'users',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            trend: '+12%'
        },
        {
            title: 'Available Doctors',
            value: MOCK_DATA.kpis.availableDoctors,
            icon: 'user-md',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            trend: 'Active'
        },
        {
            title: 'Operations Today',
            value: MOCK_DATA.kpis.operationsToday,
            icon: 'procedures',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            trend: 'Today'
        },
        {
            title: 'Hospital Earnings',
            value: `₹${(MOCK_DATA.kpis.hospitalEarnings / 100000).toFixed(1)}L`,
            icon: 'rupee-sign',
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            trend: '+8%'
        }
    ];

    return kpis.map(kpi => `
        <div class="card" style="background: ${kpi.gradient}; color: white; border: none; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div style="background: rgba(255,255,255,0.2); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-${kpi.icon} fa-lg"></i>
                </div>
                <span style="background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${kpi.trend}</span>
            </div>
            <p style="opacity: 0.9; font-size: 0.875rem; margin-bottom: 0.5rem;">${kpi.title}</p>
            <h3 style="font-size: 2rem; font-weight: 700;">${kpi.value}</h3>
        </div>
    `).join('');
}

function renderAdditionalMetrics() {
    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            <div class="card" style="border-left: 4px solid #2563eb;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0.5rem;">Avg. Visit Duration</p>
                        <h3 style="font-size: 1.75rem; font-weight: 700; color: var(--text-main);">45 min</h3>
                        <span style="color: #059669; font-size: 0.75rem; font-weight: 600;">
                            <i class="fas fa-arrow-up"></i> 5% vs last week
                        </span>
                    </div>
                    <div style="width: 56px; height: 56px; background: #eff6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-clock fa-2x" style="color: #2563eb;"></i>
                    </div>
                </div>
            </div>
            
            <div class="card" style="border-left: 4px solid #7c3aed;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0.5rem;">Patient Satisfaction</p>
                        <h3 style="font-size: 1.75rem; font-weight: 700; color: var(--text-main);">4.8/5</h3>
                        <span style="color: #059669; font-size: 0.75rem; font-weight: 600;">
                            <i class="fas fa-arrow-up"></i> Excellent rating
                        </span>
                    </div>
                    <div style="width: 56px; height: 56px; background: #faf5ff; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-star fa-2x" style="color: #7c3aed;"></i>
                    </div>
                </div>
            </div>
            
            <div class="card" style="border-left: 4px solid #0891b2;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0.5rem;">Bed Occupancy</p>
                        <h3 style="font-size: 1.75rem; font-weight: 700; color: var(--text-main);">78%</h3>
                        <span style="color: #d97706; font-size: 0.75rem; font-weight: 600;">
                            <i class="fas fa-minus"></i> 2% vs yesterday
                        </span>
                    </div>
                    <div style="width: 56px; height: 56px; background: #ecfeff; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-bed fa-2x" style="color: #0891b2;"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initializeAnalyticsCharts() {
    // Patient Inflow Line Chart
    const inflowChart = document.getElementById('inflowChart');
    if (inflowChart && typeof Chart !== 'undefined') {
        new Chart(inflowChart, {
            type: 'line',
            data: {
                labels: MOCK_DATA.patientInflowStats.map(d => d.day),
                datasets: [{
                    label: 'Patient Count',
                    data: MOCK_DATA.patientInflowStats.map(d => d.count),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#2563eb',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { color: '#64748b' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748b' }
                    }
                }
            }
        });
    }

    // Department Occupancy Doughnut Chart
    const occupancyChart = document.getElementById('occupancyChart');
    if (occupancyChart && typeof Chart !== 'undefined') {
        new Chart(occupancyChart, {
            type: 'doughnut',
            data: {
                labels: MOCK_DATA.departmentOccupancy.map(d => d.department),
                datasets: [{
                    data: MOCK_DATA.departmentOccupancy.map(d => d.occupancy),
                    backgroundColor: MOCK_DATA.departmentOccupancy.map(d => d.color),
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            font: { size: 13 },
                            color: '#1e293b',
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '% occupied';
                            }
                        }
                    }
                }
            }
        });
    }
}

// ===========================================
// PATIENTS VIEW
// ===========================================
export function renderPatients(root) {
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
            <div style="display: flex; gap: 1rem; align-items: center;">
                <div style="flex: 1; position: relative;">
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

// ===========================================
// DOCTORS VIEW
// ===========================================
export function renderDoctors(root) {
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

// ===========================================
// RECORDS VIEW
// ===========================================
export function renderRecords(root) {
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
                    <div style="display: flex; align-items: center; gap: 1.5rem;">
                        <div style="width: 48px; height: 48px; background: #eff6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-file-medical-alt fa-lg" style="color: #2563eb;"></i>
                        </div>
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                                <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-main);">${record.patientName}</h3>
                                <span style="padding: 0.25rem 0.75rem; background: #f3f4f6; color: var(--text-muted); border-radius: 12px; font-size: 0.75rem; font-weight: 500;">
                                    ${record.id}
                                </span>
                            </div>
                            <div style="display: flex; gap: 2rem; color: var(--text-muted); font-size: 0.875rem;">
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

// ===========================================
// BILLING VIEW
// ===========================================
export function renderBilling(root) {
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
                <h3 style="font-size: 1.75rem; font-weight: 700;">₹${(MOCK_DATA.billing.reduce((sum, b) => sum + b.amount, 0) / 100000).toFixed(2)}L</h3>
            </div>
            <div class="card" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border: none;">
                <p style="opacity: 0.9; font-size: 0.875rem; margin-bottom: 0.5rem;">Paid Invoices</p>
                <h3 style="font-size: 1.75rem; font-weight: 700;">${MOCK_DATA.billing.filter(b => b.status === 'Paid').length}</h3>
            </div>
            <div class="card" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; border: none;">
                <p style="opacity: 0.9; font-size: 0.875rem; margin-bottom: 0.5rem;">Pending Invoices</p>
                <h3 style="font-size: 1.75rem; font-weight: 700;">${MOCK_DATA.billing.filter(b => b.status === 'Pending').length}</h3>
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
