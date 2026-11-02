// Every clip and picture gets an expand button that shows it whole, as large as the window allows; Esc, the close
// button or a click anywhere but a clip's controls closes it.
// In a block of its own, as the homepage script has a viewer of its own too.
{
	const viewer = document.body.appendChild(document.createElement('dialog'));
	viewer.className = 'media-viewer';
	viewer.onclick = (e) => { if (e.target.tagName !== 'VIDEO') viewer.close(); };
	viewer.onclose = () => viewer.replaceChildren();
	for (const media of document.querySelectorAll('.shot video, .shot img, .module-card img')) {
	  // A module card's picture gets a frame of its own, so the button sits on the picture and not its caption.
	  let box = media.closest('.shot');
	  if (!box) { box = document.createElement('div'); box.className = 'media-frame'; media.before(box); box.append(media); }
	  const button = box.appendChild(document.createElement('button'));
	  button.className = 'expand';
	  button.setAttribute('aria-label', 'Expand');
	  button.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
	  button.onclick = (e) => {
	    e.preventDefault();
	    const big = media.cloneNode();
	    if (big.tagName === 'VIDEO') Object.assign(big, { muted: true, loop: true, playsInline: true, controls: true, autoplay: true });
	    const close = document.createElement('button');
	    close.className = 'close';
	    close.setAttribute('aria-label', 'Close');
	    close.textContent = '×';
	    viewer.replaceChildren(close, big);
	    viewer.showModal();
	    if (big.tagName === 'VIDEO') big.play().catch(() => {});
	  };
	}
}
