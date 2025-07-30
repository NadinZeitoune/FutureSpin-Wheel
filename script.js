const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const resultEl = document.getElementById('result');
const removeButton = document.getElementById('removeButton');
const checkboxDiv = document.getElementById('checkbox-div');

let names = [];
let spinHistory = [];

let spinning = false;

// Clear history and reset localStorage
/*document.getElementById('clearHistoryButton').addEventListener('click', function() {
	// Clear the spin history
	spinHistory = [];
	localStorage.removeItem('spinHistory');  // Remove history from localStorage
	
	// Clear the displayed history
	displayHistory();
	
	// Optionally reset checkbox states as well
	for (let i = 1; i <= numOfGroups; i++){
		localStorage.removeItem('group' + i + 'Checked');
		document.getElementById('group' + i).checked = true;
	}
	
	// Reset the wheel
	updateNames();
});*/

function addCheckbox(index){
	//<label><input type="checkbox" id="group1" /> Base Game</label>
	const labelE = document.createElement("label");
	const inputE = document.createElement("input");
	inputE.type = "checkbox";
	inputE.id = "group" + index;
	
	labelE.appendChild(inputE);
	labelE.appendChild(document.createTextNode(" " + groupsNames[index - 1]));
	
	checkboxDiv.appendChild(labelE);
}

window.onload = function() {
	loadLocalSpinHistory();
	
	for(let i = 1; i <= numOfGroups; i++){
		addCheckbox(i);
	}
	
	for (let i = 1; i <= numOfGroups; i++){
		document.getElementById('group' + i).addEventListener('change', function() {
			updateNames();
			saveState();
		});
	}
	
	loadState();  // Load the saved state (history + checkbox states)
};

function updateNames() {
  names = [];
  
  for (let i = 1; i <= numOfGroups; i++){
	if (document.getElementById('group' + i).checked) {
		names.push(...groups[i - 1]);
	}
  }
  
  shuffleArray(names);
  drawWheel();
  resultEl.textContent = '';
  
  saveState(); // Save checkbox states to localStorage
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 200;
  const arcSize = 2 * Math.PI / names.length;

  for (let i = 0; i < names.length; i++) {
    const startAngle = i * arcSize;
    const endAngle = startAngle + arcSize;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.fillStyle = `hsla(${i * 360 / names.length}, 70%, 60%, 0.6)`;
    ctx.fill();
    ctx.stroke();

    // Draw name
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    //ctx.font = "20px Arial";
	ctx.font = ctx.measureText(names[i]).width > 140 ? '15px Arial' : '20px Arial';
    ctx.fillText(names[i], radius - 10, 5, 140);
    ctx.restore();
  }

  // Draw angle markers every 30 degrees
  /*for (let deg = 0; deg < 360; deg += 30) {
  	const rad = deg * Math.PI / 180;
  	const outer = radius + 20;
  	const textRadius = radius + 30;
  	
  	const x1 = centerX + outer * Math.cos(rad);
  	const y1 = centerY + outer * Math.sin(rad);
  	const x2 = centerX + (outer + 5) * Math.cos(rad);
  	const y2 = centerY + (outer + 5) * Math.sin(rad);
  	
  	ctx.beginPath();
  	ctx.moveTo(x1, y1);
  	ctx.lineTo(x2, y2);
  	ctx.strokeStyle = "#333";
  	ctx.stroke();
  	
  	const textX = centerX + textRadius * Math.cos(rad);
  	const textY = centerY + textRadius * Math.sin(rad);
  	
  	ctx.fillStyle = "#000";
  	ctx.font = "12px Arial";
  	ctx.textAlign = "center";
  	ctx.textBaseline = "middle";
  	ctx.fillText(deg.toString(), textX, textY);
  }*/
}

function drawRotatedWheel(deg) {
  const rad = deg * Math.PI / 180;
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  drawWheel();
  ctx.restore();
}

function disableCheckboxesAndButtons(toDisable){
	for (let i = 1; i <= numOfGroups; i++){
		document.getElementById('group' + i).disabled = toDisable;
	}
  
	//document.getElementById('clearHistoryButton').disabled = toDisable;
	
	document.getElementById('spin-button').disabled = toDisable;
	document.getElementById('spin-button').style.cursor = toDisable ? "auto" : "pointer";
}

function spin() {
  if (spinning) return; // Prevent spinning if already spinning
  if (names.length === 0) {
      alert("Please select at least one set of names.");
      return;
  }
  
  // Disable checkboxes
  disableCheckboxesAndButtons(true);
  
  spinning = true;
  resultEl.textContent = '';

  const baseRotation = 360 * 3;
  const randomAngle = Math.floor(Math.random() * 360);
  const totalRotation = baseRotation + randomAngle;

  const duration = 3000;
  const startTime = performance.now();

  function animateSpin(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easing = easeOutCubic(progress);
    const currentDeg = totalRotation * easing;

    drawRotatedWheel(currentDeg);

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      const finalAngle = totalRotation % 360;
      const segmentAngle = 360 / names.length;
      const index = Math.floor((360 - finalAngle) % 360 / segmentAngle);
      //resultEl.textContent = `Selected: ${names[index]}`;
      spinning = false;
	  
	  chosenName = names[index]; 
	  
	  // Check if secret message exists; if not, provide a fallback
	  const message = secretMessages[chosenName] ? secretMessages[chosenName].message : 'No secret message available for this name.';
	  const url = secretMessages[chosenName] ? secretMessages[chosenName].url : '';
  
	  resultEl.innerHTML = `<strong>Selected: ${chosenName} </strong>`;
	  
	  // If there's no secret message, display a simple text fallback instead of a link
	  if (secretMessages[chosenName]) {
	 	 // Show message with a clickable link
	 	 resultEl.innerHTML += `<br><strong>Secret Message:</strong> <a href="${url}" target="_blank" style="color: blue; text-decoration: underline;">${message}</a>`;
	  } else {
	 	 // Show plain fallback text (no link)
	 	 resultEl.innerHTML += `<br><strong>Secret Message:</strong> ${message}`;
	  }
	  
	  //removeButton.style.display = 'inline-block';  // Show the remove button
  
      // Add this spin to history
	  addSpinToHistory(chosenName, message, url);
	  saveState(); // Save history and checkbox states to localStorage
	  
	  // Display the history of spins
	  //displayHistory();
	  
	  // Re-enable checkboxes after spin finishes
	  disableCheckboxesAndButtons(false);
    }
  }

  requestAnimationFrame(animateSpin);
}

/*function displayHistory() {
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
}*/

function addSpinToHistory(name, message, url) {
	const timestamp = new Date().toLocaleString("en-GB",{
		//dateStyle: 'short',
		//timeStyle: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		//hour: '2-digit',
		//minute: '2-digit',
		});  // Get the current date and time
		
	loadLocalSpinHistory();
		
	// Add the new spin to history
	spinHistory.push({ name, message, url, timestamp });
	
	// Limit the history to the last 5 entries
	//if (spinHistory.length > 5) {
	//	spinHistory.shift();  // Remove the first (oldest) entry if there are more than 5
	//}
	
	//displayHistory();  // Update the display
}

function loadLocalSpinHistory(){
	// Load the spin history from localStorage
	const savedHistory = localStorage.getItem('spinHistory');
	if (savedHistory) {
		spinHistory = JSON.parse(savedHistory);
	} else {
		// Default history for first-time visitors
		spinHistory = [];
	}
}

function removeChosenName() {
  if (chosenName) {
    const index = names.indexOf(chosenName);
    if (index > -1) {
      names.splice(index, 1); // Remove the chosen name
      shuffleArray(names);    // Shuffle the remaining names
      drawWheel();             // Redraw the wheel
      resultEl.textContent = '';  // Clear the result
      removeButton.style.display = 'none';  // Hide the remove button
    }
  }
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function saveState() {
	// Save the spin history
	localStorage.setItem('spinHistory', JSON.stringify(spinHistory));
	
	// Save the state of the checkboxes
	for (let i = 1; i <= numOfGroups; i++){
		const groupChecked = document.getElementById('group' + i).checked;
		localStorage.setItem('group' + i + 'Checked', groupChecked);
	}
}

// Load state from localStorage
function loadState() {
	
	//loadLocalSpinHistory();
	//displayHistory();  // Re-render the history
	
	for (let i = 1; i <= numOfGroups; i++){
		
		// Load the state of the checkboxes from localStorage
		const groupChecked = localStorage.getItem('group' + i + 'Checked');
		
		// Set the checkbox states based on localStorage
		document.getElementById('group' + i).checked = groupChecked == null ? true : groupChecked  === 'true';
	}
	
	// Update the names on the wheel after setting the checkboxes
	updateNames();
}