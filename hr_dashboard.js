
let supabase;
let currentStaffIdForExit = null;
let currentCameraStream = null;
let capturedPhotoBlob = null;

// Initialize
async function init() {
    // Fetch config
    const res = await fetch('/api/config');
    const { supabaseUrl, supabaseKey } = await res.json();
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Check Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/index.html';
        return;
    }

    // Role Check
    if (session.user.email.includes('admin')) {
        alert('This portal is for HR staff only. Redirecting to Login.');
        await supabase.auth.signOut();
        window.location.href = '/index.html';
        return;
    }

    document.getElementById('userEmail').textContent = session.user.email;
    document.getElementById('logoutBtn').addEventListener('click', doLogout);

    // Initial Load
    loadStaffList();
    setupRealtime();

    // Event Listeners
    document.getElementById('refreshBtn').addEventListener('click', loadStaffList);
    document.getElementById('searchStaff').addEventListener('input', handleSearch);
    document.getElementById('addStaffForm').addEventListener('submit', handleAddStaff);
    document.getElementById('downloadBtn').addEventListener('click', () => window.location.href = '/api/admin/export-excel');

    // New Feature Listeners
    document.getElementById('stillWorking').addEventListener('change', toggleResignationDate);

    // Camera Listeners
    document.getElementById('startCameraBtn').addEventListener('click', startCamera);
    document.getElementById('captureBtn').addEventListener('click', capturePhoto);
    document.getElementById('stopCameraBtn').addEventListener('click', stopCamera);
    document.getElementById('retakeBtn').addEventListener('click', retakePhoto);

    // Edit Form
    document.getElementById('editStaffForm').addEventListener('submit', handleEditStaff);
}

// === LOGIC: Still Working Toggle ===
function toggleResignationDate(e) {
    const isWorking = e.target.checked;
    const dateGroup = document.getElementById('resignationDateGroup');
    dateGroup.style.display = isWorking ? 'none' : 'block';
    if (isWorking) dateGroup.querySelector('input').value = '';
}

// === LOGIC: Camera ===
async function startCamera() {
    try {
        const video = document.getElementById('cameraVideo');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        currentCameraStream = stream;

        document.getElementById('cameraContainer').style.display = 'block';
        document.getElementById('staffPictureInput').disabled = true; // disable file input while camera active
    } catch (err) {
        alert("Camera Access Denied or Not Available: " + err.message);
    }
}

function stopCamera() {
    if (currentCameraStream) {
        currentCameraStream.getTracks().forEach(track => track.stop());
        currentCameraStream = null;
    }
    document.getElementById('cameraContainer').style.display = 'none';
    document.getElementById('staffPictureInput').disabled = false;
}

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to Blob
    canvas.toBlob((blob) => {
        capturedPhotoBlob = blob;
        // Show Preview
        const previewUrl = URL.createObjectURL(blob);
        document.getElementById('photoPreview').src = previewUrl;
        document.getElementById('previewContainer').style.display = 'flex';

        stopCamera(); // Stop video stream
    }, 'image/jpeg');
}

function retakePhoto() {
    capturedPhotoBlob = null;
    document.getElementById('previewContainer').style.display = 'none';
    startCamera();
}

// === LOGIC: Navigation ===
window.switchView = (viewName) => {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');

    const idx = viewName === 'list' ? 0 : 1;
    document.querySelectorAll('.nav-item')[idx].classList.add('active');

    if (viewName === 'list') loadStaffList();
};

async function doLogout() {
    await supabase.auth.signOut();
    window.location.href = '/index.html';
}

// === LOGIC: Staff List ===
async function loadStaffList() {
    const tbody = document.getElementById('staffTableBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">Loading data...</td></tr>';

    const { data, error } = await supabase
        .from('staff_records')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        tbody.innerHTML = `<tr><td colspan="7" style="color:red">Error: ${error.message}</td></tr>`;
        return;
    }

    renderTable(data);
}

function renderTable(data) {
    const tbody = document.getElementById('staffTableBody');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No staff records found.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(staff => {
        const isExited = staff.exit_date && staff.exit_date !== 'Still Working' && staff.exit_date !== '';
        // Badge styling is handled by CSS classes now
        const statusBadge = isExited
            ? `<span class="status-badge status-exited" title="Exited: ${staff.exit_date}">Exited</span>`
            : `<span class="status-badge status-active">Active</span>`;

        const joined = staff.resumption_date ? new Date(staff.resumption_date).toLocaleDateString() : '-';

        return `
            <tr>
                <td>
                  <img src="${staff.picture_url}" class="avatar" alt="pic" onclick="openImageModal('${staff.picture_url}')" style="cursor:pointer;" title="Click to View">
                </td>
                <td style="font-weight: 500;">
                    ${staff.full_name}
                    <div style="font-size: 0.75rem; color: #64748b; margin-top:2px;">${staff.hiring_officer || ''}</div>
                </td>
                <td>${staff.designation}</td>
                <td>${staff.location}</td>
                <td>${joined}</td>
                <td>${statusBadge}</td>
                <td>
                    <div style="display:flex; gap:5px;">
                        <button class="icon-btn edit" onclick="openEditModal('${staff.id}')" title="Edit Details">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        ${!isExited ? `
                        <button class="icon-btn delete" onclick="openExitModal('${staff.id}', '${staff.full_name}')" title="Mark as Exited">
                            <i class="fa-solid fa-door-open"></i>
                        </button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function handleSearch(e) {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#staffTableBody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// === LOGIC: Add Staff ===
async function handleAddStaff(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const statusEl = document.getElementById('submitStatus');
    const btn = form.querySelector('button[type="submit"]');

    try {
        statusEl.textContent = 'Processing...';
        btn.disabled = true;

        const name = formData.get('fullName');

        // 1. Determine Image Source (File Input OR Camera Blob)
        let fileToUpload = null;
        const fileInput = document.getElementById('staffPictureInput').files[0];

        if (capturedPhotoBlob) {
            fileToUpload = capturedPhotoBlob; // Use camera capture
            // Give it a name
            fileToUpload.name = "webcam_capture.jpg";
        } else if (fileInput) {
            fileToUpload = fileInput;
        } else {
            throw new Error("Please upload a picture or take a photo.");
        }

        // 2. Upload Image
        const fileExt = fileToUpload.name ? fileToUpload.name.split('.').pop() : 'jpg';
        const fileName = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('staff-photos')
            .upload(fileName, fileToUpload);

        if (uploadError) throw new Error('Image upload failed: ' + uploadError.message);

        const { data: { publicUrl } } = supabase.storage.from('staff-photos').getPublicUrl(fileName);

        // 3. Determine Exit Date
        const stillWorking = document.getElementById('stillWorking').checked;
        const exitDate = stillWorking ? '' : formData.get('exitDate');

        // 4. Insert Record
        const { error: dbError } = await supabase
            .from('staff_records')
            .insert([{
                full_name: name,
                resumption_date: formData.get('resumptionDate'),
                location: formData.get('location'),
                designation: formData.get('designation'),
                hiring_officer: formData.get('hiringOfficer'),
                picture_url: publicUrl,
                exit_date: exitDate
            }]);

        if (dbError) throw new Error('Database save failed: ' + dbError.message);

        statusEl.textContent = 'Success!';
        statusEl.style.color = 'green';

        // Reset Logic
        form.reset();
        capturedPhotoBlob = null;
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('resignationDateGroup').style.display = 'none'; // reset toggle

        setTimeout(() => {
            statusEl.textContent = '';
            btn.disabled = false;
            window.switchView('list');
        }, 2000);

    } catch (err) {
        console.error(err);
        statusEl.textContent = err.message;
        statusEl.style.color = 'red';
        btn.disabled = false;
    }
}

// === LOGIC: Edit Staff ===
window.openEditModal = async (id) => {
    // Open Modal first
    document.getElementById('editModal').style.display = 'flex';
    document.getElementById('editStaffId').value = id;

    // Fetch current details
    const { data, error } = await supabase
        .from('staff_records')
        .select('*')
        .eq('id', id)
        .single();

    if (data) {
        document.getElementById('editFullName').value = data.full_name;
        document.getElementById('editDesignation').value = data.designation;
        document.getElementById('editLocation').value = data.location;
        document.getElementById('currentPhotoView').src = data.picture_url;
    }
};

window.closeEditModal = () => {
    document.getElementById('editModal').style.display = 'none';
};

async function handleEditStaff(e) {
    e.preventDefault();
    const id = document.getElementById('editStaffId').value;
    const name = document.getElementById('editFullName').value;
    const designation = document.getElementById('editDesignation').value;
    const location = document.getElementById('editLocation').value;
    const fileInput = document.getElementById('editPhotoInput');

    const updateData = {
        full_name: name,
        designation: designation,
        location: location
    };

    try {
        // If new photo selected, upload it
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `updated_${name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('staff-photos')
                .upload(fileName, file);

            if (uploadError) throw new Error('Image upload failed: ' + uploadError.message);
            const { data: { publicUrl } } = supabase.storage.from('staff-photos').getPublicUrl(fileName);

            updateData.picture_url = publicUrl;
        }

        // Update DB
        const { error } = await supabase.from('staff_records').update(updateData).eq('id', id);
        if (error) throw error;

        closeEditModal();
        loadStaffList();

    } catch (err) {
        alert('Update failed: ' + err.message);
    }
}

// === LOGIC: Exit Staff (Existing) ===
window.openExitModal = (id, name) => {
    currentStaffIdForExit = id;
    document.getElementById('modalStaffName').textContent = name;
    document.getElementById('exitModal').style.display = 'flex';
};
window.closeModal = () => { document.getElementById('exitModal').style.display = 'none'; };
window.confirmExit = async () => {
    const date = document.getElementById('exitDateInput').value;
    if (!date) return alert('Please select a date');
    try {
        const { error } = await supabase.from('staff_records').update({ exit_date: date }).eq('id', currentStaffIdForExit);
        if (error) throw error;
        closeModal(); loadStaffList();
    } catch (err) { alert('Update failed: ' + err.message); }
};

// Realtime
function setupRealtime() {
    supabase.channel('staff_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_records' }, () => { loadStaffList(); })
        .subscribe();
}

// === LOGIC: Image Modal ===
window.openImageModal = (url) => {
    const modal = document.getElementById('imageViewerModal');
    const img = document.getElementById('fullSizeImage');
    const downloadBtn = document.getElementById('downloadImageBtn');

    img.src = url;
    downloadBtn.href = url;
    modal.style.display = 'flex';
};

window.closeImageModal = (e) => {
    // Close if clicked on backdrop (not image)
    if (e.target.id === 'imageViewerModal') {
        document.getElementById('imageViewerModal').style.display = 'none';
    }
};

// Start
init();
