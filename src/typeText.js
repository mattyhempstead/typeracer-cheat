/*
  This script will automatically complete the actual typeracer race
*/

// Extract the typeracer text from the DOM
content = document.querySelector('.inputPanel span').parentElement.textContent.split('');

// The index of the character we are up to
charNum = 0;  

/**
 * Uses JS events to type a single character in the typeracer race
 */
typeNextCharacter = () => {
  if (charNum == content.length) return true;
  input = document.querySelector('.txtInput');
  input.value += content[charNum++];

  eventObj = new Event("keydown");
  eventObj.keyCode = input.value.charCodeAt(0);
  input.dispatchEvent(eventObj);
}

// Type the entire text, with each keypress seperated with a small time interval
loop = () => {
  const done = typeNextCharacter();
  if (done) return;
  setTimeout(loop, 24.5 + 2 * (Math.random() - 0.5));
}
loop();
