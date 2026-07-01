const dateEl = document.getElementById('todayDate');
const quoteEl = document.getElementById('todayQuote');
const bmiForm = document.getElementById('bmiForm');
const bmiResult = document.getElementById('bmiResult');

const quotes = [
  'Konsistensi kecil hari ini akan terasa besar di masa depan.',
  'Latihan yang baik dimulai dengan langkah yang sederhana.',
  'Jangan menunda progres, mulai dari sekarang.'
];

if (dateEl) {
  const today = new Date();
  dateEl.textContent = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

if (quoteEl) {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteEl.textContent = `"${randomQuote}"`;
}

if (bmiForm && bmiResult) {
  bmiForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);

    if (!weight || !height) {
      bmiResult.innerHTML = 'Masukkan angka yang valid untuk berat dan tinggi badan.';
      return;
    }

    const heightMeters = height / 100;
    const bmi = weight / (heightMeters * heightMeters);
    const roundedBmi = bmi.toFixed(1);

    let category = '';
    let advice = '';

    if (bmi < 18.5) {
      category = 'Kurus';
      advice = 'Coba tingkatkan asupan nutrisi dan rutin latihan kekuatan.';
    } else if (bmi < 25) {
      category = 'Normal';
      advice = 'Kondisi tubuhmu bagus. Pertahankan pola makan dan olahraga.';
    } else if (bmi < 30) {
      category = 'Berat Badan Berlebih';
      advice = 'Ayo tambah aktivitas cardio dan jaga asupan makanan.';
    } else {
      category = 'Obesitas';
      advice = 'Disarankan konsultasi dengan trainer atau ahli gizi.';
    }

    bmiResult.innerHTML = `
      <strong>BMI kamu: ${roundedBmi}</strong><br>
      Kategori: <strong>${category}</strong><br>
      Saran: ${advice}
    `;
  });
}
