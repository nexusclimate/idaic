document.getElementById('feedbackForm')
  .addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    
    // Get form data
    const data = {
      name:    form.name.value,
      email:   form.email.value,
      subject: form.subject.value,
      type:    form.type.value,
      comment: form.comment.value
    };

    // Handle file uploads if any
    const fileInput = form.querySelector('input[type="file"]');
    let attachmentUrls = [];
    
    if (fileInput && fileInput.files.length > 0) {
      try {
        // Convert files to base64
        const filePromises = Array.from(fileInput.files).map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64Content = reader.result.split(',')[1];
              resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                content: base64Content
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

        const filesData = await Promise.all(filePromises);
        
        // Upload files to Linear
        const uploadResponse = await fetch('/.netlify/functions/uploadFeedbackFiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: filesData })
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          attachmentUrls = uploadResult.results
            .filter(result => result.success)
            .map(result => ({
              name: result.filename,
              url: result.assetUrl
            }));
        }
      } catch (error) {
        console.error('File upload error:', error);
      }
    }

    // Add attachments to data
    data.attachments = attachmentUrls;

    // Submit feedback
    const resp = await fetch('/.netlify/functions/createFeedbackTask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const statusElement = document.getElementById('status');
    if (resp.ok) {
      const result = await resp.json();
      let message = 'Thanks for sharing your feedback!';
      if (attachmentUrls.length > 0) {
        message += ` ${attachmentUrls.length} file(s) attached successfully.`;
      }
      statusElement.textContent = message;
      form.reset();
    } else {
      statusElement.textContent = 'Error, try again.';
    }
  });