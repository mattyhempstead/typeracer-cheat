/*
  This script assists in completing the captcha which appears after >100WPM
*/

/**
 * Extract the background colour of a pixel at a given index
 */
replaceColour = (i) => {
  const percent = ((i/4) % img.width) / img.width;
  return {
      r: 192 + (205 - 192) * percent,
      g: 193 + (233 - 193) * percent,
      b: 195 + (247 - 195) * percent
  }
}

/**
 * A string function to make bulk substitutions easier
 */
String.prototype.replaceAll = function(a,b) { 
  let str = this.toString();
  while (str.indexOf(a) !== -1) str = str.replace(a, b);
  return str;
}

/**
 * Post-processing of the text
 */
processText = (text) => {
  text = text.replaceAll('\n', ' ');
  text = text.replaceAll('1', 'l');
  text = text.replaceAll('(', 'l');
  text = text.replaceAll(')', 'l');
  text = text.replaceAll('[', 'I');
  text = text.replaceAll('@', 'a');
  text = text.replaceAll('¥', 'y');
  text = text.replaceAll('\\', 'i');
  text = text.replaceAll('|', 'I');

  // Spaces after full stops and commas  
  text = text.replaceAll('.', '\u1000 ');
  text = text.replaceAll('\u1000', '.');
  text = text.replaceAll(',', '\u1000 ');
  text = text.replaceAll('\u1000', ',');
  text = text.replaceAll('  ', ' ');

  return text;
}

/**
 * Gets the DataURL of the pre-processed captcha image
 */
getImageDataURL = () => {
  img = document.querySelector('.challengeImg');

  // Use HTML canvas to perform pre-processing of captcha image
  canv = document.createElement('canvas');
  img.parentElement.parentElement.parentElement.parentElement.appendChild(canv);
  canv.style.display = 'block';
  canv.style.marginTop = '5px';
  canv.style.backgroundColor = 'black';
  canv.width = img.width;
  canv.height = img.height;
  ctx = canv.getContext('2d');
  ctx.drawImage(img, 0, 0);
  imgData = ctx.getImageData(0, 0, img.width, img.height);

  // Replace black markings with background colour
  changedPixels = [];
  for (let i=0; i<imgData.data.length; i+=4) {
      if (imgData.data[i] <= 50 && imgData.data[i+1] <= 50 && imgData.data[i+2] <= 50) {
          imgData.data[i  ] = replaceColour(i).r;
          imgData.data[i+1] = replaceColour(i).b;
          imgData.data[i+2] = replaceColour(i).g;
          changedPixels.push(i);
      }
  }

  // Replace nearby pixels
  changedPixels.forEach(i => {
    // pixel above
    try { imgData.data[i   + img.width*4] = replaceColour(i).r; } catch {}
    try { imgData.data[i+1 + img.width*4] = replaceColour(i).g; } catch {}
    try { imgData.data[i+2 + img.width*4] = replaceColour(i).b; } catch {}

    // pixel below
    try { imgData.data[i   - img.width*4] = replaceColour(i).r; } catch {}
    try { imgData.data[i+1 - img.width*4] = replaceColour(i).g; } catch {}
    try { imgData.data[i+2 - img.width*4] = replaceColour(i).b; } catch {}

    // pixel right
    try { imgData.data[i   + 4] = replaceColour(i).r; } catch {}
    try { imgData.data[i+1 + 4] = replaceColour(i).g; } catch {}
    try { imgData.data[i+2 + 4] = replaceColour(i).b; } catch {}

    // pixel left
    try { imgData.data[i   - 4] = replaceColour(i).r; } catch {}
    try { imgData.data[i+1 - 4] = replaceColour(i).g; } catch {}
    try { imgData.data[i+2 - 4] = replaceColour(i).b; } catch {}
  })

  ctx.putImageData(imgData, 0, 0);

  return canv.toDataURL()
}


// Begin process to beat captcha
(async () => {
  worker = Tesseract.createWorker({});
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  // View the captcha
  document.querySelector('.gwt-Button').click();

  // Wait until the image has loaded
  let listenerFunction;
  await new Promise(res => {
    listenerFunction = change => {
      if (change.target.className !== 'DialogBox trPopupDialog typingChallengeDialog') return;
      change.target.querySelector('.challengeImg').onload = () => {
        res();
      }
    };
    document.body.addEventListener("DOMNodeInserted", listenerFunction);
  })
  document.body.querySelector('.popupContent').removeEventListener("DOMNodeInserted", listenerFunction);

  // Use tesseract to perform OCR on the image
  let { data: { text } } = await worker.recognize(getImageDataURL());

  // Post-processing of text
  text = processText(text);

  // Inject the text into the typeracer textarea
  document.querySelector('.challengeTextArea').value = text;
  console.log(text);

  await worker.terminate();
})();
