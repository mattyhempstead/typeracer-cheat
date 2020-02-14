
content = document.querySelector('.inputPanel span').parentElement.textContent.split('');
charNum = 0;  // The index of the character we are up to

typeNextCharacter = () => {
  if (charNum == content.length - 1) return;
  input = document.querySelector('.txtInput');
  input.value += content[charNum++];

  eventObj = new Event("keydown");
  eventObj.keyCode = input.value.charCodeAt(0);
  input.dispatchEvent(eventObj);
}

loop = () => {
  typeNextCharacter();
  setTimeout(loop, 200 * Math.random());
}
loop();
