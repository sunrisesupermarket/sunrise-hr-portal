
// Initialize Supabase Client (Exposed via CDN on window)
// Since we don't have a build step for frontend, we need the user to input keys or fetch them from an endpoint.
// However, exposing keys on frontend usually requires Anon Key. 
// We will fetch the configuration from a public endpoint for convenience or hardcode placeholders if needed.
// IMPORTANT: For this specific setup, since we are doing a quick migration, I'll assume we can fetch config from the server or use the Anon key if the user provides it.
// To make it simple, we will fetch the 'public' config from our own server endpoint.

let supabase;

async function init() {
    try {
        // Fetch public config (Supabase URL and Anon Key)
        const response = await fetch('/api/config');
        const config = await response.json();

        if (!config.supabaseUrl || !config.supabaseKey) {
            console.error('Supabase configuration missing');
            return;
        }

        supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);

        // Check if on login page or dashboard
        if (document.getElementById('loginForm')) {
            setupLogin();
        } else if (document.getElementById('staffTable')) {
            setupDashboard();
        }
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
}

function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            window.location.href = 'dashboard.html';
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        errorMessage.style.display = 'none';

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        } else {
            window.location.href = 'dashboard.html';
        }
    });
}

function setupDashboard() {
    const tableBody = document.getElementById('tableBody');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmailSpan = document.getElementById('userEmail');
    const exportBtn = document.getElementById('exportBtn');

    // Check Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            window.location.href = 'login.html';
        } else {
            userEmailSpan.textContent = session.user.email;
            fetchStaffData();
        }
    });

    // Logout
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });

    // Export
    exportBtn.addEventListener('click', async () => {
        window.location.href = '/api/admin/export-excel';
    });

    async function fetchStaffData() {
        // We can fetch directly from Supabase client-side if we set up RLS policies correctly.
        // Or we can fetch via our server API. 
        // Let's use Supabase client-side for simplicity as per the requirement.

        const { data, error } = await supabase
            .from('staff_records')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            tableBody.innerHTML = `<tr><td colspan="7" style="color: red; text-align: center;">Error loading data: ${error.message}</td></tr>`;
            return;
        }

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No records found.</td></tr>`;
            return;
        }

        tableBody.innerHTML = data.map(staff => `
            <tr>
                <td><img src="${staff.picture_url}" alt="${staff.full_name}" class="staff-img" onclick="window.open('${staff.picture_url}', '_blank')"></td>
                <td>${staff.full_name}</td>
                <td>${staff.resumption_date || '-'}</td>
                <td>${staff.location || '-'}</td>
                <td>${staff.designation || '-'}</td>
                <td>${staff.hiring_officer || '-'}</td>
                <td>${staff.exit_date || '-'}</td>
            </tr>
        `).join('');
    }
}

// Start
init();
