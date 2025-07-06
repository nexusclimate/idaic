document.getElementById('feedbackForm')
  .addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const data = {
      name:    form.name.value,
      email:   form.email.value,
      subject: form.subject.value,
      type:    form.type.value,
      comment: form.comment.value
    };
    const resp = await fetch('/.netlify/functions/createFeedbackTask', {
      method: 'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(data)
    });
    document.getElementById('status').textContent =
      resp.ok ? 'Thanks!' : 'Error, try again.';
  });