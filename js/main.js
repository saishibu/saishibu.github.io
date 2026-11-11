// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Career chain: hash each block as SHA-256(prevHash + block text), genesis first.
(async () => {
  const chain = document.getElementById('chain');
  if (!chain || !(window.crypto && crypto.subtle)) return;

  const blocks = Array.from(chain.querySelectorAll('.block'))
    .sort((a, b) => Number(a.dataset.height) - Number(b.dataset.height));

  const enc = new TextEncoder();
  const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let prev = '0'.repeat(64);
  const results = [];
  for (const block of blocks) {
    const body = Array.from(block.querySelectorAll('h3, p'), (n) => n.textContent.replace(/\s+/g, ' ').trim()).join('|');
    const digest = hex(await crypto.subtle.digest('SHA-256', enc.encode(prev + '|' + block.dataset.height + '|' + body)));
    results.push([block, digest, prev]);
    prev = digest;
  }

  results.forEach(([block, digest, parent], i) => {
    const el = block.querySelector('.hash');
    el.textContent = '0x' + digest.slice(0, 8) + '…' + digest.slice(-6);
    el.title = 'hash 0x' + digest + '\nparent 0x' + parent;
    // reveal from genesis upward: the page's one orchestrated moment
    setTimeout(() => el.classList.add('on'), reduce ? 0 : 150 + i * 140);
  });
})();
