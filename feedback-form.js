document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedbackForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      name:    form.name.value,
      email:   form.email.value,
      subject: form.subject.value,
      type:    form.type.value,
      comment: form.comment.value
    };
    const res = await fetch('/feedback/api/createFeedbackTask', {
      method: 'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const status = document.getElementById('status');
    if (res.ok) {
      status.textContent = 'Thanks for your feedback!';
      form.reset();
    } else {
      const err = await res.json().catch(()=>null);
      status.textContent = err?.details 
        ? `Error: ${err.details}` 
        : 'Submission failed. Please try again.';
    }
  });
});
