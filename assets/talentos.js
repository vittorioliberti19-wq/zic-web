(() => {
  const form = document.getElementById('talent-form');
  const cv = form.elements.attachment;
  const messages = {
    es: 'Selecciona un archivo PDF de hasta 5 MB.',
    en: 'Select a PDF file up to 5 MB.',
    it: 'Seleziona un file PDF fino a 5 MB.',
    fr: 'Sélectionnez un fichier PDF de 5 Mo maximum.',
  };
  function validateFile() {
    const file = cv.files[0];
    // Usability check only. CAPTCHA and delivery are handled by FormSubmit.
    const invalid = file && (file.size > 5 * 1024 * 1024 || !/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf'));
    cv.setCustomValidity(invalid ? messages[document.documentElement.lang] || messages.es : '');
    return !invalid;
  }
  cv.addEventListener('change', validateFile);
  document.getElementById('language-select').addEventListener('change', validateFile);
  form.addEventListener('submit', (event) => {
    if (!validateFile()) {
      event.preventDefault();
      cv.reportValidity();
    }
  });
})();
