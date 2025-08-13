document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const imagePreview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('previewContainer');
    const sendBtn = document.getElementById('sendBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultContainer = document.getElementById('resultContainer');
    const jsonResult = document.getElementById('jsonResult');
    const copyBtn = document.getElementById('copyBtn');
    
    let imageBase64 = '';
    
    // Event listeners for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    // Handle file input change
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    // Browse button click
    browseBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Click on drop area
    dropArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Handle the selected files
    function handleFiles(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imageBase64 = e.target.result;
            imagePreview.src = imageBase64;
            previewContainer.style.display = 'block';
            resultContainer.style.display = 'none';
        };
        
        reader.readAsDataURL(file);
    }
    
    // Send button click
    sendBtn.addEventListener('click', function() {
        if (!imageBase64) {
            alert('Please select an image first');
            return;
        }
        
        // Create JSON object
        const jsonData = {
            image_data: imageBase64
        };
        
        // Display JSON
        jsonResult.textContent = JSON.stringify(jsonData, null, 2);
        resultContainer.style.display = 'block';
        
        // Here you would typically send the data to your backend
        // Example using fetch:
        /*
        fetch('your-api-endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
        */
    });
    
    // Reset button click
    resetBtn.addEventListener('click', function() {
        imageBase64 = '';
        imagePreview.src = '';
        previewContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        fileInput.value = '';
    });
    
    // Copy button click
    copyBtn.addEventListener('click', function() {
        const textToCopy = jsonResult.textContent;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });
});