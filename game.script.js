const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
}

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

const randomIntExcl = (min, max, excl) => {
    if (!Array.isArray(excl)) {
      excl = [excl];
    }
    let randomNumber;
    do {
      randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
    } while (excl.includes(randomNumber));
    return randomNumber;
}

const createSum = (int) => {
    const int1 = randomIntExcl(1,int-1);
    const int2 = int - int1;
    return `${int1} + ${int2}`;
}

const shuffle = (array) => {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

const pickRandom = (min, max, dimensions) => {
    const totalPicks = []
    const randomPicks = []
    for (let index = 0; index < dimensions * dimensions / 2; index++) {
        const randomIndex = randomIntExcl(min, max, totalPicks);
        totalPicks.push(randomIndex);
        randomPicks.push({val: randomIndex, sum: createSum(randomIndex)});
        randomPicks.push({val: randomIndex, sum: createSum(randomIndex)});
    }
    return randomPicks
}

const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension')
    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number.")
    }
    const min = 0;
    const max = 100
    const items = shuffle(pickRandom(min,max,dimensions))
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back" data-val="${item.val}">${item.sum}</div>
                </div>
            `).join('')}
       </div>`
    const parser = new DOMParser().parseFromString(cards, 'text/html')
    selectors.board.replaceWith(parser.querySelector('.board'))
}

const startGame = () => {
    state.gameStarted = true
    selectors.start.classList.add('disabled')
    state.loop = setInterval(() => {
        state.totalTime++
        selectors.moves.innerText = `Moves: ${state.totalFlips}`
        selectors.timer.innerText = `Time: ${state.totalTime}s`
    }, 1000)
}

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })
    state.flippedCards = 0
}

const flipCard = card => {
    state.flippedCards++
    state.totalFlips++
    if (!state.gameStarted) {
        startGame()
    }
    if (state.flippedCards <= 2) {
        card.classList.add('flipped')
    }
    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)')
        if (flippedCards[0].querySelector('.card-back').dataset.val === flippedCards[1].querySelector('.card-back').dataset.val) {
            flippedCards[0].classList.add('matched')
            flippedCards[1].classList.add('matched')
        }
        setTimeout(() => {
            flipBackCards()
        }, 1000)
    }
    // If there are no more cards that we can flip, we won the game
    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped')
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    ${state.totalFlips} moves<br />
                    ${state.totalTime} seconds
                </span>`
            clearInterval(state.loop)
        }, 1000)
    }
}

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement
        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent)
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame()
        }
    })
}

generateGame()
attachEventListeners()