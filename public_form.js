
let supabase;
let currentCameraStream = null;
let capturedPhotoBlob = null;

// Initialize
async function init() {
    // Fetch config
    const res = await fetch('/api/config');
    const { supabaseUrl, supabaseKey } = await res.json();
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Event Listeners
    document.getElementById('addStaffForm').addEventListener('submit', handleAddStaff);
    document.getElementById('stillWorking').addEventListener('change', toggleResignationDate);

    // Camera Listeners
    document.getElementById('startCameraBtn').addEventListener('click', startCamera);
    document.getElementById('captureBtn').addEventListener('click', capturePhoto);
    document.getElementById('stopCameraBtn').addEventListener('click', stopCamera);
    document.getElementById('retakeBtn').addEventListener('click', retakePhoto);
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

        stopCamera();
    }, 'image/jpeg');
}

function retakePhoto() {
    capturedPhotoBlob = null;
    document.getElementById('previewContainer').style.display = 'none';
    startCamera();
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

        if (!capturedPhotoBlob) {
            throw new Error("Please take a photo using the camera.");
        }

        formData.append('staffPicture', capturedPhotoBlob, 'webcam_capture.jpg');

        const stillWorking = document.getElementById('stillWorking').checked;
        const exitDate = stillWorking ? '' : formData.get('exitDate');
        formData.set('exitDate', exitDate);

        const resp = await fetch('/api/staff', {
            method: 'POST',
            body: formData
        });

        if (!resp.ok) {
            const errData = await resp.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to submit staff record');
        }

        statusEl.textContent = 'Success! Staff record added.';
        statusEl.style.color = 'green';

        form.reset();
        capturedPhotoBlob = null;
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('resignationDateGroup').style.display = 'none';

        setTimeout(() => {
            statusEl.textContent = '';
            btn.disabled = false;
        }, 3000);

    } catch (err) {
        console.error(err);
        statusEl.textContent = err.message;
        statusEl.style.color = 'red';
        btn.disabled = false;
    }
}

// Start
init();
