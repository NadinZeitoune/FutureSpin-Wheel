const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const resultEl = document.getElementById('result');
const removeButton = document.getElementById('removeButton');
const checkboxDiv = document.getElementById('checkbox-div');

let names = [];
let spinHistory = [];


window.onload = function() {
	loadState();  // Load the saved state (history + checkbox states)
};

function displayHistory() {
	const historyContainer = document.getElementById('spinHistory');
	historyContainer.innerHTML = '';  // Clear previous history
	
	spinHistory.forEach((spin, index) => {
		// Set amount of history records thta shown
		if(index < spinHistory.length - 10) return;
	
		const spinElement = document.createElement('div');
		//spinElement.innerHTML = `Gen #${index + 1} (${spin.timestamp}): <strong>${spin.name}</strong> - `;
		spinElement.innerHTML = `${spin.timestamp} Gen #${index + 1}: <strong>${spin.name}</strong> - `;
		if (spin.message !== 'No secret message available for this name.') {
		spinElement.innerHTML += `<a href="${spin.url}" target="_blank" style="color: blue; text-decoration: underline;">${spin.message}</a>`;
		} else {
		spinElement.innerHTML += spin.message;  // Plain text when no message is available
		}
		historyContainer.appendChild(spinElement);
	});
}

// Load state from localStorage
function loadState() {
	// Load the spin history from localStorage
	const savedHistory = localStorage.getItem('spinHistory');
	if (savedHistory) {
		spinHistory = JSON.parse(savedHistory);
	} else {
		// Default history for first-time visitors
		spinHistory = [];
		
		//document.getElementById('group1').checked = true;
		//document.getElementById('group2').checked = true;
		//document.getElementById('group3').checked = true;
		//document.getElementById('group4').checked = true;
	}
	
	displayHistory();  // Re-render the history
}