const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyl3HrkN_dIedh7SnFZF-8VPwOJlN1FQy8JHmLoRPEHlCjoWYsJkbNt9ADweW0Dh4eJ/exec";

// --- Form State Management ---

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
    // Ensure the tab headers visually switch
    const tabHeaders = document.querySelectorAll('.tab');
    if (tab === 'new') {
        tabHeaders[0].classList.add('active');
    } else {
        tabHeaders[1].classList.add('active');
    }
}

// --- Real-time Validation & Progress ---

function validateForm(type) {
    const form = document.getElementById(type === 'new' ? 'formNew' : 'formOld');
    const submitBtn = document.getElementById(type === 'new' ? 'submitNew' : 'submitOld');
    
    // Check if the form is valid using HTML5 required attributes
    if (form.checkValidity()) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
    } else {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.5";
    }
}

// Add event listeners once page loads
document.addEventListener("DOMContentLoaded", () => {
    ["formNew", "formOld"].forEach(id => {
        const f = document.getElementById(id);
        if (f) {
            f.addEventListener("input", () => validateForm(id === 'formNew' ? 'new' : 'old'));
            f.addEventListener("change", () => validateForm(id === 'formNew' ? 'new' : 'old'));
        }
    });
});

// --- Calculation Logic ---

function calculate(type) {
    const amount = document.getElementById(type === 'new' ? 'loanAmountNew' : 'loanAmountOld').value;
    const week = document.getElementById(type === 'new' ? 'loanWeekNew' : 'loanWeekOld').value;
    const summary = document.getElementById(type === 'new' ? 'summaryNew' : 'summaryOld');

    if (!amount || !week) {
        summary.innerHTML = "";
        return;
    }

    const rates = {1:0.15, 2:0.20, 3:0.30, 4:0.35};
    const total = amount * (1 + (rates[week] || 0));
    const due = new Date();
    due.setDate(due.getDate() + (week * 7));

    summary.innerHTML = `<strong>Total Payable:</strong> ZMW ${total.toFixed(2)}<br>
                         <strong>Due Date:</strong> ${due.toDateString()}`;
    
    // Re-validate when calculation adds content
    validateForm(type);
}

function limitNewLoan() {
    const val = document.getElementById("loanAmountNew");
    if (val.value > 5000) val.value = 5000;
}

function limitOldLoan() {
    const val = document.getElementById("loanAmountOld");
    if (val.value > 10000) val.value = 10000;
}

// --- Location Data ---

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

function loadDistrictsOld() {
    const province = document.getElementById("provinceOld").value;
    const districtSelect = document.getElementById("districtOld");
    districtSelect.innerHTML = `<option value="">Select District</option>`;
    if (!province || !districtsByProvince[province]) return;
    districtsByProvince[province].forEach(district => {
        const opt = document.createElement("option");
        opt.value = district;
        opt.textContent = district;
        districtSelect.appendChild(opt);
    });
}

// --- File Handling ---

function fileToBase64(file) {
    if (!file) return Promise.resolve({name: "none", type: "none", data: ""});
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

// --- Submission ---

async function submitForm(type) {
    const btnId = type === 'new' ? 'submitNew' : 'submitOld';
    const btn = document.getElementById(btnId);
    
    // Final security check
    const form = document.getElementById(type === 'new' ? 'formNew' : 'formOld');
    if (!form.checkValidity()) {
        alert("Please fill in all required fields.");
        return;
    }

    disableSubmit(btn);

    try {
        let payload = {};

        if (type === 'new') {
            payload = {
                customerType: "new",
                firstName: document.getElementById("firstName").value,
                surname: document.getElementById("surname").value,
                email: document.getElementById("emailNew").value,
                phone: document.getElementById("phone").value,
                gender: document.getElementById("gender").value,
                marital: document.getElementById("marital").value,
                province: document.getElementById("province").value,
                district: document.getElementById("district").value,
                area: document.getElementById("area").value,
                workadd: document.getElementById("workadd").value,
                employment: document.getElementById("employment").value,
                guarantor: document.getElementById("guarantorNew").value,
                relationship: document.getElementById("relationshipNew").value,
                guarantorPhone: document.getElementById("guarantorPhoneNew").value,
                referral: document.getElementById("referral").value,
                repayment: document.getElementById("repayment").value,
                purpose: document.getElementById("purpose").value,
                loanAmount: document.getElementById("loanAmountNew").value,
                loanWeeks: document.getElementById("loanWeekNew").value,
                // Number-only extraction
                totalPayable: document.getElementById("summaryNew").innerText.match(/[\d\.]+/g)[0],
                nrcFile: await fileToBase64(document.getElementById("nrcFile").files[0]),
                payslipFile: await fileToBase64(document.getElementById("payslipFileNew").files[0])
            };
        } else {
            payload = {
                customerType: "old",
                fullName: document.getElementById("fullNameOld").value,
                email: document.getElementById("emailOld").value,
                phone: document.getElementById("phoneOld").value,
                nrc: document.getElementById("nrcOld").value,
                province: document.getElementById("provinceOld").value,
                district: document.getElementById("districtOld").value,
                area: document.getElementById("areaOld").value,
                workaddOld: document.getElementById("workaddOld").value,
                guarantor: document.getElementById("guarantorOld").value,
                relationship: document.getElementById("relationshipOld").value,
                guarantorPhone: document.getElementById("guarantorPhoneOld").value,
                repayment: document.getElementById("repaymentOld").value,
                purpose: document.getElementById("purposeOld").value,
                loanAmount: document.getElementById("loanAmountOld").value,
                loanWeeks: document.getElementById("loanWeekOld").value,
                // Number-only extraction
                totalPayable: document.getElementById("summaryOld").innerText.match(/[\d\.]+/g)[0],
                payslipFile: await fileToBase64(document.getElementById("payslipFileOld").files[0]),
                collateralFile: await fileToBase64(document.getElementById("collateralFile").files[0])
            };
        }

        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const result = await response.text();
        if (result.includes("SUCCESS")) {
            markSuccess(btn);
        } else {
            throw new Error(result);
        }

    } catch (e) {
        console.error(e);
        btn.innerText = "❌ Failed – Try Again";
        btn.disabled = false;
    }
}