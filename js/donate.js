import { mountShell } from './components.js';
import { getJson, unshelteredPercent } from './data.js';

mountShell('donate');

const summary = await getJson('./data/lahsa-2026-summary.json');
let selectedAmount = 50;

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
  document.querySelector('#donation-result').innerHTML = `
    <h2>Prototype confirmation</h2>
    <p><strong>Your prototype donation:</strong> $${selectedAmount.toLocaleString()}</p>
    <p>No payment was processed and no funds were allocated.</p>
    <hr />
    <p>Context this dashboard could track beside real partner reporting:</p>
    <p>${city.totalHomelessPopulation.toLocaleString()} estimated people experiencing homelessness in the City of Los Angeles.</p>
    <p>${unshelteredPercent(summary).toFixed(1)}% of people experiencing homelessness in the City were unsheltered.</p>
    <span class="source">Source: LAHSA 2026 Greater Los Angeles Homeless Count</span>
  `;
});
