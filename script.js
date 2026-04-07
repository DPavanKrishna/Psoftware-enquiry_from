const form = document.getElementById('enquiryForm');
const formMessage = document.getElementById('formMessage');

const requiredFields = {
  date: 'Date is required.',
  customer_name: 'Customer name is required.',
  gender: 'Please select gender.',
  customer_enquiry_date: 'Customer enquiry date is required.',
  phone_no: 'Phone number is required.',
  enquiry_type: 'Please select enquiry type.',
  enquiry_source: 'Please select enquiry source.',
  vehicle_name: 'Vehicle name is required.',
  model_name: 'Model name is required.',
  model_code: 'Model code is required.',
  address_1: 'Address 1 is required.',
  address_2: 'Address 2 is required.',
  city: 'City is required.',
  district: 'District is required.',
  state: 'State is required.',
  pincode: 'Pincode is required.'
};

const patterns = {
  nameLike: /^[A-Za-z][A-Za-z .'-]{1,}$/,
  phone10: /^\d{10}$/,
  pincode6: /^\d{6}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  year: /^(19|20)\d{2}$/
};

function fieldById(id) {
  return document.getElementById(id);
}

function getFieldContainer(el) {
  return el ? el.closest('.field') : null;
}

function ensureErrorNode(container) {
  if (!container) return null;
  let node = container.querySelector('.field-error');
  if (!node) {
    node = document.createElement('div');
    node.className = 'field-error';
    container.appendChild(node);
  }
  return node;
}

function setError(el, message) {
  const container = getFieldContainer(el);
  const errorNode = ensureErrorNode(container);
  if (errorNode) errorNode.textContent = message;
  if (el) el.classList.add('input-invalid');
}

function clearError(el) {
  const container = getFieldContainer(el);
  const errorNode = container ? container.querySelector('.field-error') : null;
  if (errorNode) errorNode.textContent = '';
  if (el) el.classList.remove('input-invalid');
}

function getTrimmedValue(id) {
  const el = fieldById(id);
  return el ? el.value.trim() : '';
}

function showFormMessage(type, text) {
  formMessage.className = `form-message show ${type}`;
  formMessage.textContent = text;
}

function clearFormMessage() {
  formMessage.className = 'form-message';
  formMessage.textContent = '';
}

function validateRequiredFields() {
  let ok = true;
  Object.entries(requiredFields).forEach(([id, message]) => {
    const el = fieldById(id);
    if (!el) return;
    if (!el.value.trim()) {
      setError(el, message);
      ok = false;
    } else {
      clearError(el);
    }
  });
  return ok;
}

function validateFormats() {
  let ok = true;

  const customerName = fieldById('customer_name');
  if (customerName && customerName.value.trim() && !patterns.nameLike.test(customerName.value.trim())) {
    setError(customerName, 'Enter a valid customer name.');
    ok = false;
  }

  const phone = fieldById('phone_no');
  if (phone) {
    phone.value = phone.value.replace(/\D/g, '').slice(0, 10);
    if (!patterns.phone10.test(phone.value)) {
      setError(phone, 'Phone number must be 10 digits.');
      ok = false;
    }
  }

  const whatsapp = fieldById('whatsapp_no');
  if (whatsapp) {
    whatsapp.value = whatsapp.value.replace(/\D/g, '').slice(0, 10);
    if (whatsapp.value && !patterns.phone10.test(whatsapp.value)) {
      setError(whatsapp, 'WhatsApp number must be 10 digits.');
      ok = false;
    } else if (whatsapp.value) {
      clearError(whatsapp);
    }
  }

  const email = fieldById('email_address');
  if (email && email.value.trim() && !patterns.email.test(email.value.trim())) {
    setError(email, 'Enter a valid email address.');
    ok = false;
  }

  const pincode = fieldById('pincode');
  if (pincode) {
    pincode.value = pincode.value.replace(/\D/g, '').slice(0, 6);
    if (!patterns.pincode6.test(pincode.value)) {
      setError(pincode, 'Pincode must be 6 digits.');
      ok = false;
    }
  }

  const year = fieldById('year_of_manufacturing');
  if (year && year.value.trim()) {
    if (!patterns.year.test(year.value.trim())) {
      setError(year, 'Enter year in YYYY format.');
      ok = false;
    } else {
      const y = Number(year.value);
      const currentYear = new Date().getFullYear();
      if (y < 1990 || y > currentYear) {
        setError(year, `Year must be between 1990 and ${currentYear}.`);
        ok = false;
      }
    }
  }

  return ok;
}

function validateCrossFieldLogic() {
  let ok = true;

  const enquiryDate = getTrimmedValue('customer_enquiry_date');
  const followUpDate = getTrimmedValue('follow_up_date');
  const appointmentDate = getTrimmedValue('appoinment_date');

  if (followUpDate && enquiryDate && followUpDate < enquiryDate) {
    const followUp = fieldById('follow_up_date');
    setError(followUp, 'Follow-up date cannot be before enquiry date.');
    ok = false;
  }

  if (appointmentDate && enquiryDate && appointmentDate < enquiryDate) {
    const appointment = fieldById('appoinment_date');
    setError(appointment, 'Appointment date cannot be before enquiry date.');
    ok = false;
  }

  const paymentType = getTrimmedValue('payment_type');
  if (paymentType === 'Finance') {
    const whichFinance = fieldById('which_finance');
    const tenure = fieldById('tenure');
    if (!whichFinance.value.trim()) {
      setError(whichFinance, 'Please specify finance provider.');
      ok = false;
    }
    if (!tenure.value.trim()) {
      setError(tenure, 'Please enter tenure for finance option.');
      ok = false;
    }
  }

  const interested = getTrimmedValue('customer_interested_in_exchange');
  if (interested === 'Yes') {
    const exchangeType = fieldById('exchange_type');
    const vehicleMake = fieldById('vehicle_model_and_make');
    if (!exchangeType.value.trim()) {
      setError(exchangeType, 'Please select exchange type.');
      ok = false;
    }
    if (!vehicleMake.value.trim()) {
      setError(vehicleMake, 'Vehicle model and make is required for exchange.');
      ok = false;
    }
  }

  return ok;
}

function validateFieldLive(el) {
  if (!el) return;
  clearError(el);

  const id = el.id;
  if (requiredFields[id] && !el.value.trim()) {
    setError(el, requiredFields[id]);
    return;
  }

  if (id === 'phone_no') {
    el.value = el.value.replace(/\D/g, '').slice(0, 10);
    if (el.value && !patterns.phone10.test(el.value)) setError(el, 'Phone number must be 10 digits.');
  }

  if (id === 'whatsapp_no') {
    el.value = el.value.replace(/\D/g, '').slice(0, 10);
    if (el.value && !patterns.phone10.test(el.value)) setError(el, 'WhatsApp number must be 10 digits.');
  }

  if (id === 'pincode') {
    el.value = el.value.replace(/\D/g, '').slice(0, 6);
    if (el.value && !patterns.pincode6.test(el.value)) setError(el, 'Pincode must be 6 digits.');
  }

  if (id === 'email_address' && el.value.trim() && !patterns.email.test(el.value.trim())) {
    setError(el, 'Enter a valid email address.');
  }
}

function bindLiveValidation() {
  const fields = form.querySelectorAll('input, select, textarea');
  fields.forEach((el) => {
    const eventName = el.tagName === 'SELECT' ? 'change' : 'blur';
    el.addEventListener(eventName, () => validateFieldLive(el));

    if (el.tagName !== 'SELECT') {
      el.addEventListener('input', () => {
        if (el.classList.contains('input-invalid')) validateFieldLive(el);
      });
    }
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearFormMessage();

  const reqOk = validateRequiredFields();
  const formatOk = validateFormats();
  const crossOk = validateCrossFieldLogic();

  if (!reqOk || !formatOk || !crossOk) {
    const firstInvalid = form.querySelector('.input-invalid');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  showFormMessage('success', 'Validation successful. Form is ready to submit.');

  // Replace this with API call or backend submit in your project.
  // form.submit();
});

form.addEventListener('reset', () => {
  setTimeout(() => {
    clearFormMessage();
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach((el) => clearError(el));
  }, 0);
});

bindLiveValidation();
