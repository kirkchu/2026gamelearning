const OPERATIONS = ['+', '-', '×', '÷'];
const state = { blue: {}, red: {}, frozen: false };
const teams = ['blue', 'red'];

function rand(max) { return Math.floor(Math.random() * (max + 1)); }

function makeQuestion() {
  const op = OPERATIONS[rand(3)];
  let first, second, answer;
  if (op === '+') { first = rand(15) + 1; second = rand(15) + 1; answer = first + second; }
  if (op === '-') { first = rand(18) + 2; second = rand(first); answer = first - second; }
  if (op === '×') { first = rand(8) + 2; second = rand(8) + 1; answer = first * second; }
  if (op === '÷') { second = rand(8) + 2; answer = rand(8) + 1; first = second * answer; }
  return { text: `${first} ${op} ${second} = ?`, answer };
}

function resetQuestion(team) {
  const question = makeQuestion();
  state[team].question = question;
  state[team].startedAt = Date.now();
  state[team].input = '';
  document.querySelector(`#${team}-question`).textContent = question.text;
  document.querySelector(`#${team}-answer`).textContent = '0';
  setFeedback(team, '');
}

function setFeedback(team, message, wrong = false) {
  const el = document.querySelector(`#${team}-feedback`);
  el.textContent = message;
  el.classList.toggle('is-wrong', wrong);
}

function setInput(team, value) {
  if (state.frozen) return;
  if (value === 'clear') state[team].input = '';
  else if (state[team].input.length < 3) state[team].input += value;
  document.querySelector(`#${team}-answer`).textContent = state[team].input || '0';
}

function submit(team) {
  if (state.frozen || !state[team].input) return;
  if (Number(state[team].input) !== state[team].question.answer) {
    setFeedback(team, '再想一想，答案不對喔！', true);
    return;
  }
  const seconds = (Date.now() - state[team].startedAt) / 1000;
  const points = Math.max(1, 5 - Math.floor(seconds / 5));
  state[team].score += points;
  setFeedback(team, `答對了！獲得 ${points} 分！`);
  refreshArena();
  if (Math.abs(state.blue.score - state.red.score) >= 20) finish(team);
  else setTimeout(() => resetQuestion(team), 550);
}

function refreshArena() {
  document.querySelector('#blue-score').textContent = state.blue.score;
  document.querySelector('#red-score').textContent = state.red.score;
  const difference = state.blue.score - state.red.score;
  const pull = Math.max(-42, Math.min(42, -difference * 2.1));
  document.querySelector('#tug-line').style.transform = `translateX(${pull}%)`;
  const label = document.querySelector('#lead-label');
  label.textContent = difference === 0 ? '目前勢均力敵' : difference > 0 ? `藍隊領先 ${difference} 分` : `紅隊領先 ${Math.abs(difference)} 分`;
}

function finish(team) {
  state.frozen = true;
  const modal = document.querySelector('#winner-modal');
  document.querySelector('#winner-title').textContent = `${team === 'blue' ? '藍隊' : '紅隊'} 獲勝！`;
  document.querySelector('#winner-score').textContent = `${state.blue.score} ： ${state.red.score}`;
  modal.hidden = false;
}

function buildKeypad(team) {
  const keypad = document.querySelector(`#${team}-keypad`);
  [...'123456789'].forEach((digit) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = digit;
    button.addEventListener('click', () => setInput(team, digit));
    keypad.append(button);
  });
  [['清除', 'clear'], ['0', '0'], ['送出', 'submit']].forEach(([label, action]) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = label;
    button.className = action === 'submit' ? 'submit' : action === 'clear' ? 'clear' : '';
    button.addEventListener('click', () => action === 'submit' ? submit(team) : setInput(team, action));
    keypad.append(button);
  });
}

function start() {
  state.frozen = false;
  document.querySelector('#winner-modal').hidden = true;
  teams.forEach((team) => { state[team].score = 0; buildKeypad(team); resetQuestion(team); });
  refreshArena();
}

document.querySelector('#restart').addEventListener('click', () => {
  teams.forEach((team) => document.querySelector(`#${team}-keypad`).replaceChildren());
  start();
});
start();
