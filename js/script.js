function disableSubmit(btn) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerText;
    btn.innerText = "Submitting...";
}

function markSuccess(btn) {
    btn.innerText = "✅ Successfully Submitted";
}

function showTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    document.querySelectorAll('.tab')[tab === 'new' ? 0 : 1].classList.add('active');
}

function toggleSubmit(type) {
    document.getElementById(type === 'new' ? 'submitNew' : 'submitOld').disabled =
        !document.getElementById(type === 'new' ? 'termsNew' : 'termsOld').checked;
}

function calculate(type) {
    const amount = document.getElementById(type === 'new' ? 'loanAmountNew' : 'loanAmountOld').value;
    const week = document.getElementById(type === 'new' ? 'loanWeekNew' : 'loanWeekOld').value;
    const summary = document.getElementById(type === 'new' ? 'summaryNew' : 'summaryOld');

    if (!amount || !week) return;

    const rates = {1:0.15, 2:0.20, 3:0.30, 4:0.35};
    const total = amount * (1 + rates[week]);
    const due = new Date();
    due.setDate(due.getDate() + (week * 7));

    summary.innerHTML = `<strong>Total Payable:</strong> ZMW ${total.toFixed(2)}<br>
                         <strong>Due Date:</strong> ${due.toDateString()}`;
}

function limitNewLoan() {
    if (loanAmountNew.value > 1000) loanAmountNew.value = 1000;
}
function limitOldLoan() {
    if (loanAmountOld.value > 5000) loanAmountOld.value = 5000;
}

const districtsByProvince = {
    "Central":["Chibombo","Chisamba","Chitambo","Kabwe","Kapiri Mposhi","Luano","Mkushi","Mumbwa","Ngabwe","Serenje"],
    "Copperbelt":["Chililabombwe","Chingola","Kalulushi","Kitwe","Luanshya","Lufwanyama","Masaiti","Mpongwe","Mufulira","Ndola"],
    "Eastern":["Chadiza","Chasefu","Chipangali","Chipata","Kasenengwa","Katete","Lumezi","Lundazi","Mambwe","Nyimba","Petauke","Sinda","Vubwi"],
    "Luapula":["Chembe","Chiengi","Chifunabuli","Chipili","Kawambwa","Lunga","Mansa","Milenge","Mwansabombwe","Mwense","Nchelenge","Samfya"],
    "Lusaka":["Chilanga","Chongwe","Kafue","Luangwa","Lusaka"],
    "Muchinga":["Chama","Chinsali","Isoka","Kanchibiya","Lavushimanda","Mafinga","Mpika","Nakonde","Shiwangandu"],
    "Northern":["Chilubi","Kaputa","Kasama","Luwingu","Mbala","Mporokoso","Mpulungu","Mungwi","Nsama","Senga Hill"],
    "North-Western":["Chavuma","Ikelenge","Kabompo","Kalumbila","Kasempa","Manyinga","Mufumbwe","Mushindamo","Mwinilunga","Solwezi","Zambezi"],
    "Southern":["Chikankata","Chirundu","Choma","Gwembe","Itezhi-Tezhi","Kalomo","Kazungula","Livingstone","Mazabuka","Monze","Namwala","Pemba","Siavonga","Sinazongwe","Zimba"],
    "Western":["Kalabo","Kaoma","Limulunga","Luampa","Lukulu","Mitete","Mongu","Mulobezi","Mwandi","Nalolo","Nkeyema","Senanga","Sesheke","Shangombo","Sikongo"]
};

function loadDistricts() {
    const province = document.getElementById("province").value;
    const district = document.getElementById("district");
    district.innerHTML = '<option value="">Select District</option>';
    if (!districtsByProvince[province]) return;

    districtsByProvince[province].forEach(d => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        district.appendChild(opt);
    });
}

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7M9ZzezENjDIMUdBvrZ3GQVUMaCsGnPUDSkWlWkYQqQPEnrIv1hQlYMuu-5BgupVyOg/exec";

function fileToBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        data: reader.result.split(",")[1]
      });
    };
    reader.readAsDataURL(file);
  });
}

/* ===== NEW CUSTOMER SUBMIT ===== */
document.getElementById("submitNew").onclick = async function () {
  const btn = this;
  disableSubmit(btn);

  try {
    const payload = {
      customerType: "new",
      firstName: document.querySelector("#new input[type=text]").value,
      surname: document.querySelectorAll("#new input[type=text]")[1].value,
      email: document.querySelector("#new input[type=email]").value,
      phone: document.querySelector("#new input[type=tel]").value,
      gender: document.querySelector("#new select").value,
      marital: document.querySelectorAll("#new select")[1].value,
      province: province.value,
      district: district.value,
      area: document.querySelectorAll("#new input[type=text]")[2].value,
      employment: document.querySelectorAll("#new select")[2].value,
      payslipPassword: document.querySelectorAll("#new input[type=text]")[3].value,
      guarantor: document.querySelectorAll("#new input[type=text]")[4].value,
      relationship: document.querySelectorAll("#new input[type=text]")[5].value,
      guarantorPhone: document.querySelectorAll("#new input[type=tel]")[1].value,
      referral: document.querySelectorAll("#new select")[3].value,
      repayment: document.querySelectorAll("#new select")[4].value,
      purpose: document.querySelectorAll("#new select")[5].value,
      loanAmount: loanAmountNew.value,
      loanWeeks: loanWeekNew.value,
      totalPayable: document.getElementById("summaryNew").innerText,
      dueDate: new Date().toDateString(),
      nrcFile: await fileToBase64(document.querySelectorAll("#new input[type=file]")[0].files[0]),
      payslipFile: await fileToBase64(document.querySelectorAll("#new input[type=file]")[1].files[0])
    };

    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    markSuccess(btn);

  } catch (e) {
    btn.innerText = "❌ Failed – Try Again";
    btn.disabled = false;
  }
};


/* ===== OLD CUSTOMER SUBMIT ===== */
document.getElementById("submitOld").onclick = async function () {
  const btn = this;
  disableSubmit(btn);

  try {
    const payload = {
      customerType: "old",
      email: document.querySelector("#old input[type=email]").value,
      fullName: document.querySelector("#old input[type=text]").value,
      nrc: document.querySelectorAll("#old input[type=text]")[1].value,
      payslipPassword: document.querySelectorAll("#old input[type=text]")[2].value,
      guarantor: document.querySelectorAll("#old input[type=text]")[3].value,
      relationship: document.querySelectorAll("#old input[type=text]")[4].value,
      guarantorPhone: document.querySelector("#old input[type=tel]").value,
      loanAmount: loanAmountOld.value,
      loanWeeks: loanWeekOld.value,
      totalPayable: document.getElementById("summaryOld").innerText,
      dueDate: new Date().toDateString(),
      payslipFile: await fileToBase64(document.querySelectorAll("#old input[type=file]")[0].files[0]),
      collateralFile: await fileToBase64(document.querySelectorAll("#old input[type=file]")[1].files[0])
    };

    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    markSuccess(btn);

  } catch (e) {
    btn.innerText = "❌ Failed – Try Again";
    btn.disabled = false;
  }
};
