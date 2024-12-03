import React, { useState } from 'react';

const TemplateManager = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setUploadStatus('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/templates/manager', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadStatus(`File uploaded successfully: ${data.filename}`);
      } else {
        setUploadStatus('Failed to upload file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('An error occurred during file upload.');
    }
  };

  return (
    <div className="file-upload-container">
      <h2>Upload a File</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default TemplateManager;
