replaceColour = (i) => {
  const percent = ((i/4) % img.width) / img.width;
  return {
      r: 192 + (205 - 192) * percent,
      g: 193 + (233 - 193) * percent,
      b: 195 + (247 - 195) * percent
  }
}

String.prototype.replaceAll = function(a,b) { 
  let str = this.toString();
  while (str.indexOf(a) !== -1) str = str.replace(a, b);
  return str;
}


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


// 0.23


getImageDataURL = () => {

img = document.querySelector('.challengeImg');

canvImg = document.createElement('canvas');
img.parentElement.parentElement.parentElement.parentElement.appendChild(canvImg);
canvImg.style.display = 'block';
canvImg.style.marginTop = '5px';
canvImg.width = img.width;
canvImg.height = img.height;
ctxImg = canvImg.getContext('2d');
ctxImg.drawImage(img, 0, 0);


canv = document.createElement('canvas');
img.parentElement.parentElement.parentElement.parentElement.appendChild(canv);
canv.style.display = 'block';
canv.style.marginTop = '5px';
canv.style.backgroundColor = 'black';
canv.width = img.width;
canv.height = img.height;
ctx = canv.getContext('2d');


// for (let i=0; i<img.width; i++) {
//     imgData = ctxImg.getImageData(i, 0, 1, img.height);
//     ctx.putImageData(imgData, i, 3 * Math.sin(i/9));
// }
ctx.drawImage(img, 0, 0);




imgData = ctx.getImageData(0, 0, img.width, img.height);

changedPixels = [];
for (let i=0; i<imgData.data.length; i+=4) {
    if (imgData.data[i] <= 50 && imgData.data[i+1] <= 50 && imgData.data[i+2] <= 50) {
        imgData.data[i  ] = replaceColour(i).r;
        imgData.data[i+1] = replaceColour(i).b;
        imgData.data[i+2] = replaceColour(i).g;
        changedPixels.push(i);
    }
}

 changedPixels.forEach(i => {
//     if (imgData.data[i] <= 195 && imgData.data[i+1] <= 210 && imgData.data[i+2] <= 217) {
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
//     }
 })

ctx.putImageData(imgData, 0, 0);

return canv.toDataURL()
}



(async () => {
worker = Tesseract.createWorker({});
await worker.load();
await worker.loadLanguage('eng');
await worker.initialize('eng');

document.querySelector('.gwt-Button').click();



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


let { data: { text } } = await worker.recognize(getImageDataURL());
text = processText(text)
document.querySelector('.challengeTextArea').value = text;
console.log(text);


await worker.terminate();
})();


