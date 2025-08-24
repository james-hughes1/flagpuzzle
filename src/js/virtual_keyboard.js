// virtual_keyboard.js
export function createKeyboard(targetSelector) {
  const keys = [
    'q',
    'w',
    'e',
    'r',
    't',
    'y',
    'u',
    'i',
    'o',
    'p',
    'a',
    's',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    'z',
    'x',
    'c',
    'v',
    'b',
    'n',
    'm',
  ];

  const specialKeys = [
    { id: 'space', label: '_' },
    { id: 'backspace', label: '<' },
    { id: 'clear', label: '<<' },
  ];

  const container = document.querySelector(targetSelector);
  if (!container) return;

  // Add normal keys
  keys.forEach((key) => {
    const btn = document.createElement('button');
    btn.className = 'key';
    btn.dataset.key = key;
    btn.textContent = key.toUpperCase();
    container.appendChild(btn);
  });

  // Add special keys
  specialKeys.forEach(({ id, label }) => {
    const btn = document.createElement('button');
    btn.className = 'specialKey';
    btn.id = id;
    btn.textContent = label;
    container.appendChild(btn);
  });
}

export function setupKeyboard(targetSelector, inputSelector) {
  const container = document.querySelector(targetSelector);
  const userInput = document.querySelector(inputSelector);
  if (!container || !userInput) return;

  container.addEventListener('click', (e) => {
    if (!e.target.matches('button')) return;

    const key = e.target.dataset.key;
    switch (e.target.id) {
      case 'space':
        userInput.value += ' ';
        break;
      case 'backspace':
        userInput.value = userInput.value.slice(0, -1);
        break;
      case 'clear':
        userInput.value = '';
        break;
      default:
        if (key) userInput.value += key;
    }
  });
}
