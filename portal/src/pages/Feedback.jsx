import React, { useState } from 'react';
import { colors, font, form as formConfig } from '../config/colors';
import { PaperClipIcon } from '@heroicons/react/24/outline';

export default function FeedbackForm() {
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeFile = (index) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSending(true);
    setStatus('Sending…');

    const form = e.target;
    
    try {
      let attachmentUrls = [];
      
      // Step 1: Upload files if any exist
      if (selectedFiles.length > 0) {
        setStatus('Uploading files…');
        
        // Convert files to base64 for upload
        const filePromises = selectedFiles.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64Content = reader.result.split(',')[1]; // Remove data:type;base64, prefix
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ files: filesData }),
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          // Extract successful uploads
          attachmentUrls = uploadResult.results
            .filter(result => result.success)
            .map(result => ({
              name: result.filename,
              url: result.assetUrl
            }));
        } else {
          console.warn('File upload failed, proceeding without attachments');
        }
      }

      // Step 2: Create Linear issue
      setStatus('Creating issue…');
      
      const feedbackData = {
        name: form.name.value,
        email: form.email.value,
        subject: form.subject.value,
        type: form.type.value,
        comment: form.comment.value,
        attachments: attachmentUrls // Pass attachment URLs
      };

      const resp = await fetch('/.netlify/functions/createFeedbackTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });

      if (resp.ok) {
        const result = await resp.json();
        let successMessage = 'Thanks for sharing your feedback!';
        if (attachmentUrls.length > 0) {
          successMessage += ` ${attachmentUrls.length} file(s) attached successfully.`;
        }
        setStatus(successMessage);
        form.reset();
        setSelectedFiles([]);
      } else {
        let errorText = 'Oops, something went wrong.';
        try {
          const data = await resp.json();
          if (data && data.error) errorText = data.error;
        } catch {
          const text = await resp.text();
          if (text) errorText = text;
        }
        setStatus(errorText);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setStatus('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Feedback</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 rounded-lg shadow"
        style={{
          background: colors.background.white,
          fontFamily: font.primary,
          color: colors.text.primary,
        }}
      >
        <h2 className="text-lg sm:text-xl mb-4 font-bold" style={{ color: colors.text.primary }}>
          Share Your Feedback
        </h2>
        <form id="feedbackForm" onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
              Your name
            </label>
            <input
              id="name" name="name" required
              className="mt-1 block w-full rounded-md px-3 py-2 sm:py-1.5 text-base outline-1 outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 sm:text-sm"
              style={{
                background: colors.background.white,
                color: colors.text.primary,
                borderColor: colors.border.light,
                fontFamily: font.primary,
                boxShadow: 'none',
              }}
              onFocus={e => e.target.style.outlineColor = formConfig.focus}
              onBlur={e => e.target.style.outlineColor = ''}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
              Your email
            </label>
            <input
              id="email" name="email" type="email" placeholder="you@example.com" required
              className="mt-1 block w-full rounded-md px-3 py-2 sm:py-1.5 text-base outline-1 outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 sm:text-sm"
              style={{
                background: colors.background.white,
                color: colors.text.primary,
                borderColor: colors.border.light,
                fontFamily: font.primary,
                boxShadow: 'none',
              }}
              onFocus={e => e.target.style.outlineColor = formConfig.focus}
              onBlur={e => e.target.style.outlineColor = ''}
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
              Subject
            </label>
            <input
              id="subject" name="subject" required
              className="mt-1 block w-full rounded-md px-3 py-2 sm:py-1.5 text-base outline-1 outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 sm:text-sm"
              style={{
                background: colors.background.white,
                color: colors.text.primary,
                borderColor: colors.border.light,
                fontFamily: font.primary,
                boxShadow: 'none',
              }}
              onFocus={e => e.target.style.outlineColor = formConfig.focus}
              onBlur={e => e.target.style.outlineColor = ''}
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
              Type
            </label>
            <select
              id="type" name="type" required
              className="mt-1 block w-full rounded-md px-3 py-2 sm:py-1.5 text-base outline-1 outline-offset-1 focus:outline-2 focus:outline-offset-2 sm:text-sm"
              style={{
                background: colors.background.white,
                color: colors.text.primary,
                borderColor: colors.border.light,
                fontFamily: font.primary,
                boxShadow: 'none',
              }}
              onFocus={e => e.target.style.outlineColor = formConfig.focus}
              onBlur={e => e.target.style.outlineColor = ''}
            >
              <option value="feedback">Feedback</option>
              <option value="bug">Bug</option>
            </select>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
              Add your comment
            </label>
            <textarea
              id="comment" name="comment" rows="4" required
              className="mt-1 block w-full rounded-md px-3 py-2 sm:py-1.5 text-base outline-1 outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 sm:text-sm"
              style={{
                background: colors.background.white,
                color: colors.text.primary,
                borderColor: colors.border.light,
                fontFamily: font.primary,
                boxShadow: 'none',
              }}
              onFocus={e => e.target.style.outlineColor = formConfig.focus}
              onBlur={e => e.target.style.outlineColor = ''}
            />
          </div>

          {/* File Upload Section */}
          <div>
            <label htmlFor="attachments" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
              Attachments (optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md"
              style={{ borderColor: colors.border.light }}
            >
              <div className="space-y-1 text-center">
                <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm" style={{ color: colors.text.primary }}>
                  <label htmlFor="attachments" className="relative cursor-pointer rounded-md font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2"
                    style={{ 
                      color: colors.primary.orange,
                      focusRingColor: colors.primary.orange 
                    }}
                  >
                    <span>Upload files</span>
                    <input
                      id="attachments"
                      name="attachments"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.csv,.xlsx"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1" style={{ color: colors.text.primary }}>or drag and drop</p>
                </div>
                <p className="text-xs" style={{ color: colors.text.secondary }}>
                  PDF, DOC, PNG, JPG, CSV up to 10MB each
                </p>
              </div>
            </div>
            
            {/* Selected Files Display */}
            {selectedFiles.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Selected files:
                </p>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <PaperClipIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm" style={{ color: colors.text.primary }}>
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={sending}
            className="mt-2 w-full rounded-md px-4 py-3 sm:py-2 font-medium disabled:opacity-50"
            style={{
              background: colors.primary.orange,
              color: colors.text.white,
              fontFamily: font.primary,
            }}
          >
            {sending ? 'Sending…' : 'Submit'}
          </button>

          <p
            id="status"
            aria-live="polite"
            className="mt-2 text-center text-sm sm:text-base"
            style={{ color: colors.primary.orange, fontFamily: font.primary }}
          >
            {status}
          </p>
        </form>
      </div>
    </div>
  );
}