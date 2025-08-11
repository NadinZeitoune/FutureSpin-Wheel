const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const resultEl = document.getElementById('result');
const checkboxDiv = document.getElementById('checkbox-div');

let names = [];

let spinning = false;

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

// Reset packs in localStorage
document.getElementById('resetPacks').addEventListener('click', function() {
	// Reset checkbox states
	for (let i = 1; i <= numOfGroups; i++){
		localStorage.removeItem('pack' + i + 'Checked');
		document.getElementById('group' + i).checked = true;
	}
	
	// Reset the wheel
	updateNames();
});

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
	ctx.font = ctx.measureText(names[i]).width > 140 ? '10px Arial' : '15px Arial';
    ctx.fillText(names[i], radius - 10, 5, 140);
    ctx.restore();
  }
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
	
	document.getElementById('spin-button').disabled = toDisable;
	document.getElementById('spin-button').style.cursor = toDisable ? "auto" : "pointer";
}

function spin() {
  if (spinning) return; // Prevent spinning if already spinning
  if (names.length === 0) {
      alert("Please select at least one pack.");
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
	  const message = secretMessages[chosenName] ? secretMessages[chosenName].message : '???';
	  //const url = secretMessages[chosenName] ? secretMessages[chosenName].url : '';
  
	  resultEl.innerHTML = `<strong>Selected: ${chosenName} </strong>`;
	  
	  // If there's no secret message, display a simple text fallback instead of a link
	  /*if (secretMessages[chosenName]) {
	 	 // Show message with a clickable link
	 	 resultEl.innerHTML += `<br><strong>Aspiration type:</strong> <a href="${url}" target="_blank" style="color: blue; text-decoration: underline;">${message}</a>`;
	  } else {
	 	 // Show plain fallback text (no link)
	 	 resultEl.innerHTML += `<br><strong>Aspiration type:</strong> ${message}`;
	  }*/
	  resultEl.innerHTML += `<br><strong>Aspiration type:</strong> ${message}`;
  
	  saveState(); // Save checkbox states to localStorage
	  
	  // Re-enable checkboxes after spin finishes
	  disableCheckboxesAndButtons(false);
    }
  }

  requestAnimationFrame(animateSpin);
}


function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function saveState() {
	
	// Save the state of the checkboxes
	for (let i = 1; i <= numOfGroups; i++){
		const groupChecked = document.getElementById('group' + i).checked;
		localStorage.setItem('pack' + i + 'Checked', groupChecked);
	}
}

// Load state from localStorage
function loadState() {
	
	for (let i = 1; i <= numOfGroups; i++){
		
		// Load the state of the checkboxes from localStorage
		const groupChecked = localStorage.getItem('pack' + i + 'Checked');
		
		// Set the checkbox states based on localStorage
		document.getElementById('group' + i).checked = groupChecked == null ? true : groupChecked  === 'true';
	}
	
	// Update the names on the wheel after setting the checkboxes
	updateNames();
}