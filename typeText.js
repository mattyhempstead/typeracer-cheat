
content = document.querySelector('.inputPanel span').parentElement.textContent.split('');
charNum = 0;  // The index of the character we are up to

typeNextCharacter = () => {
  if (charNum == content.length) return true;
  input = document.querySelector('.txtInput');
  input.value += content[charNum++];

  eventObj = new Event("keydown");
  eventObj.keyCode = input.value.charCodeAt(0);
  input.dispatchEvent(eventObj);

}

loop = () => {
  const done = typeNextCharacter();
  if (done) return;
  setTimeout(loop, 24.5 + 2 * (Math.random() - 0.5));
}
loop();

