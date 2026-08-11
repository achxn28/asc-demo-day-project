import { mountShell } from './components.js';
import { getJson, unshelteredPercent } from './data.js';

mountShell('donate');

const summary = await getJson('./data/lahsa-2026-summary.json');
let selectedAmount = 50;
const impactModal = document.querySelector('#impact-modal');
const impactCopy = document.querySelector('#impact-copy');
const impactGrid = document.querySelector('#impact-grid');
const confettiLayer = document.querySelector('#confetti-layer');
const closeImpact = document.querySelector('#close-impact');

const scenarioAssumptions = {
  personSupportDollars: 25,
  mealDollars: 5,
  clothingDollars: 20
};

document.querySelectorAll('[data-amount]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedAmount = Number(button.dataset.amount);
    document.querySelectorAll('[data-amount]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

document.querySelector('#donation-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const city = summary.cityOfLosAngeles;
  const people = Math.max(1, Math.floor(selectedAmount / scenarioAssumptions.personSupportDollars));
  const meals = Math.max(1, Math.floor(selectedAmount / scenarioAssumptions.mealDollars));
  const clothingItems = Math.max(1, Math.floor(selectedAmount / scenarioAssumptions.clothingDollars));

  document.querySelector('#donation-result').innerHTML = `
    <h2>Prototype confirmation</h2>
    <p><strong>Your prototype donation:</strong> $${selectedAmount.toLocaleString()}</p>
    <p>A popup dashboard opened with a sample impact scenario.</p>
    <hr />
    <p>Context this dashboard could track beside real partner reporting:</p>
    <p>${city.totalHomelessPopulation.toLocaleString()} estimated people experiencing homelessness in the City of Los Angeles.</p>
    <p>${unshelteredPercent(summary).toFixed(1)}% of people experiencing homelessness in the City were unsheltered.</p>
    <span class="source">Source: LAHSA 2026 Greater Los Angeles Homeless Count</span>
  `;

  impactCopy.textContent = `A $${selectedAmount.toLocaleString()} prototype donation could be reported as helping ${people.toLocaleString()} people, buying ${meals.toLocaleString()} meals, and buying ${clothingItems.toLocaleString()} clothing items in this demo scenario.`;
  impactGrid.innerHTML = [
    [`${people.toLocaleString()}`, 'people helped', `$${scenarioAssumptions.personSupportDollars} scenario support unit`],
    [`${meals.toLocaleString()}`, 'meals bought', `$${scenarioAssumptions.mealDollars} scenario meal unit`],
    [`${clothingItems.toLocaleString()}`, 'clothing items bought', `$${scenarioAssumptions.clothingDollars} scenario clothing unit`]
  ].map(([value, label, note]) => `
    <article class="impact-stat">
      <span class="stat-value">${value}</span>
      <h3>${label}</h3>
      <p>${note}</p>
    </article>
  `).join('');

  launchConfetti();
  impactModal.hidden = false;
  closeImpact.focus();
});

closeImpact.addEventListener('click', closeModal);
impactModal.addEventListener('click', (event) => {
  if (event.target === impactModal) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !impactModal.hidden) closeModal();
});

function closeModal() {
  impactModal.hidden = true;
  confettiLayer.innerHTML = '';
}

function launchConfetti() {
  confettiLayer.innerHTML = '';
  const colors = ['#f46524', '#000000', '#ffffff', '#f8f7f5'];
  for (let index = 0; index < 80; index += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    confettiLayer.append(piece);
  }
}
