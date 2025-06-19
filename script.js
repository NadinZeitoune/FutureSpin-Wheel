const canvas = document.getElementById('wheel');
    const ctx = canvas.getContext('2d');
    const resultEl = document.getElementById('result');
    const removeButton = document.getElementById('removeButton');
	
    const group1 = ['BG1', 'BG2', 'BG3', 'BG4', 'BG5'];
    const group2 = ['Seasons1', 'Seasons2', 'Seasons3', 'Seasons4'];
    const group3 = ['City Living1', 'City Living2'];
    const group4 = ['Cats & Dogs1', 'Cats & Dogs2', 'Cats & Dogs3', 'Cats & Dogs4'];
	
	const secretMessages = {
	 'City Living1': { message: 'Keep up the great work, Alice!', url: 'https://google.com' },
	 'City Living2': { message: 'Bob, you’re awesome!', url: 'https://ynet.co.il' },
	 'Charlie': { message: 'Charlie, you are unstoppable!', url: 'https://example.com/charlie' },
	 'Diana': { message: 'Diana, you shine bright!', url: 'https://example.com/diana' },
	 'Eve': { message: 'Eve, you’re doing amazing!', url: 'https://example.com/eve' },
	 'Frank': { message: 'Frank, keep pushing forward!', url: 'https://example.com/frank' },
	 'Grace': { message: 'Grace, you are an inspiration!', url: 'https://example.com/grace' },
	 'Hank': { message: 'Hank, never stop dreaming!', url: 'https://example.com/hank' }
	};
	
    let names = [];
	let spinHistory = [];

    let spinning = false;

    document.getElementById('group1').addEventListener('change', function() {
		//localStorage.setItem('group1Checked', document.getElementById('group1').checked);
		updateNames();
		saveState();
	});

	document.getElementById('group2').addEventListener('change', function() {
		//localStorage.setItem('group2Checked', document.getElementById('group2').checked);
		updateNames();
		saveState();
		saveState();
	});
	
	document.getElementById('group3').addEventListener('change', function() {
		//localStorage.setItem('group3Checked', document.getElementById('group3').checked);
		updateNames();
	});
	
	document.getElementById('group4').addEventListener('change', function() {
		//localStorage.setItem('group4Checked', document.getElementById('group4').checked);
		updateNames();
		saveState();
	});
	
	// Clear history and reset localStorage
	document.getElementById('clearHistoryButton').addEventListener('click', function() {
		// Clear the spin history
		spinHistory = [];
		localStorage.removeItem('spinHistory');  // Remove history from localStorage
		
		// Clear the displayed history
		displayHistory();
		
		// Optionally reset checkbox states as well
		localStorage.removeItem('group1Checked');
		localStorage.removeItem('group2Checked');
		localStorage.removeItem('group3Checked');
		localStorage.removeItem('group4Checked');
		
		// Reset the wheel
		//updateNames();
	});
	
	window.onload = function() {
		//document.getElementById('group1').checked = true;
		//document.getElementById('group2').checked = true;
		//document.getElementById('group3').checked = true;
		//document.getElementById('group4').checked = true;
		//updateNames(); // Call this function to update the wheel with the selected names
		
		loadState();  // Load the saved state (history + checkbox states)
	};

    function updateNames() {
      names = [];
      if (document.getElementById('group1').checked) {
        names.push(...group1);
      }
      if (document.getElementById('group2').checked) {
        names.push(...group2);
      }
	  if (document.getElementById('group3').checked) {
        names.push(...group3);
      }
	  if (document.getElementById('group4').checked) {
        names.push(...group4);
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
      const radius = 150;
      const arcSize = 2 * Math.PI / names.length;

      for (let i = 0; i < names.length; i++) {
        const startAngle = i * arcSize;
        const endAngle = startAngle + arcSize;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.fillStyle = `hsl(${i * 360 / names.length}, 70%, 60%)`;
        ctx.fill();
        ctx.stroke();

        // Draw name
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + arcSize / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.fillText(names[i], radius - 10, 5);
        ctx.restore();
      }

      // Draw angle markers every 30 degrees
      
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

    function spin() {
      //if (names.length === 0 || spinning) return;
	  if (spinning) return; // Prevent spinning if already spinning
        if (names.length === 0) {
            alert("Please select at least one set of names.");
            return;
        }
	  
	  // Disable checkboxes
	  document.getElementById('group1').disabled = true;
	  document.getElementById('group2').disabled = true;
	  document.getElementById('group3').disabled = true;
	  document.getElementById('group4').disabled = true;
	  
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
	  
		  // If there's no secret message, display a simple text fallback instead of a link
		  if (secretMessages[chosenName]) {
		 	 // Show message with a clickable link
		 	 resultEl.textContent = `Selected: ${chosenName}`;
		 	 resultEl.innerHTML += `<br><strong>Secret Message:</strong> <a href="${url}" target="_blank" style="color: blue; text-decoration: underline;">${message}</a>`;
		  } else {
		 	 // Show plain fallback text (no link)
		 	 resultEl.textContent = `Selected: ${chosenName}`;
		 	 resultEl.innerHTML += `<br><strong>Secret Message:</strong> ${message}`;
		  }
		  
		  //removeButton.style.display = 'inline-block';  // Show the remove button
      
          // Add this spin to history
		  addSpinToHistory(chosenName, message, url);
		  saveState(); // Save history and checkbox states to localStorage
		  
		  // Display the history of spins
		  displayHistory();
		  
		  // Re-enable checkboxes after spin finishes
		  document.getElementById('group1').disabled = false;
		  document.getElementById('group2').disabled = false;
		  document.getElementById('group3').disabled = false;
		  document.getElementById('group4').disabled = false;
        }
      }

      requestAnimationFrame(animateSpin);
    }
	
	function displayHistory() {
		const historyContainer = document.getElementById('spinHistory');
		historyContainer.innerHTML = '';  // Clear previous history
		
		spinHistory.forEach((spin, index) => {
			if(index < spinHistory.length - 5) return;
		
			const spinElement = document.createElement('div');
			spinElement.innerHTML = `Gen #${index + 1} (${spin.timestamp}): <strong>${spin.name}</strong> - `;
			if (spin.message !== 'No secret message available for this name.') {
			spinElement.innerHTML += `<a href="${spin.url}" target="_blank" style="color: blue; text-decoration: underline;">${spin.message}</a>`;
			} else {
			spinElement.innerHTML += spin.message;  // Plain text when no message is available
			}
			historyContainer.appendChild(spinElement);
		});
	}

	
	function addSpinToHistory(name, message, url) {
		const timestamp = new Date().toLocaleString();  // Get the current date and time
		// Add the new spin to history
		spinHistory.push({ name, message, url, timestamp });
		
		// Limit the history to the last 5 entries
		//if (spinHistory.length > 5) {
		//	spinHistory.shift();  // Remove the first (oldest) entry if there are more than 5
		//}
		
		displayHistory();  // Update the display
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
		const group1Checked = document.getElementById('group1').checked;
		const group2Checked = document.getElementById('group2').checked;
		const group3Checked = document.getElementById('group3').checked;
		const group4Checked = document.getElementById('group4').checked;
		localStorage.setItem('group1Checked', group1Checked);
		localStorage.setItem('group2Checked', group2Checked);
		localStorage.setItem('group3Checked', group3Checked);
		localStorage.setItem('group4Checked', group4Checked);
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
		
		// Load the state of the checkboxes from localStorage
		const group1Checked = localStorage.getItem('group1Checked') === 'true';
		const group2Checked = localStorage.getItem('group2Checked') === 'true';
		const group3Checked = localStorage.getItem('group3Checked') === 'true';
		const group4Checked = localStorage.getItem('group4Checked') === 'true';
		
		// Set the checkbox states based on localStorage
		document.getElementById('group1').checked = group1Checked !== null ? group1Checked : true;
		document.getElementById('group2').checked = group2Checked !== null ? group2Checked : true;
		document.getElementById('group3').checked = group3Checked !== null ? group3Checked : true;
		document.getElementById('group4').checked = group4Checked !== null ? group4Checked : true;
		
		// Update the names on the wheel after setting the checkboxes
		updateNames();
	}