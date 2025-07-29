// Fires as soon as the DOM is ready (preferred for your case)
document.addEventListener("DOMContentLoaded", function () {
  let spinHistory = [];

  // Load state and display history immediately after DOM is ready
  loadState();

  // Function to display the history
  function displayHistory() {
    const historyContainer = document.getElementById('spinHistory');
    historyContainer.innerHTML = ''; // Clear previous history

    spinHistory.forEach((spin, index) => {
      //if (index < spinHistory.length - 10) return; // Show only last 10 (Comment line if want all)

      const spinElement = document.createElement('div');
      spinElement.innerHTML = `${spin.timestamp} Gen #${index + 1}: <strong>${spin.name}</strong> - `;

      if (spin.message !== 'No secret message available for this name.') {
        spinElement.innerHTML += `<a href="${spin.url}" target="_blank" style="color: blue; text-decoration: underline;">${spin.message}</a>`;
      } else {
        spinElement.innerHTML += spin.message;
      }

      historyContainer.appendChild(spinElement);
    });
  }

  // Function to load from localStorage
  function loadState() {
    const savedHistory = localStorage.getItem('spinHistory');

    if (savedHistory) {
      spinHistory = JSON.parse(savedHistory);
    } else {
      spinHistory = [];
    }

    displayHistory();
  }
  
  // Clear history and reset localStorage
  document.getElementById('clearHistoryButton').addEventListener('click', function() {
	  // Clear the spin history
	  spinHistory = [];
	  localStorage.removeItem('spinHistory');  // Remove history from localStorage
	  
	  // Clear the displayed history
	  displayHistory();
  });
  
  
  document.getElementById('refreshHistoryButton').addEventListener('click', function() {
	  loadState();
  });
});