document.addEventListener('DOMContentLoaded', function () {
    let player = {
        name: "Player",
        chips: 200
    };

    let cards = [];
    let sum = 0;
    let hasBlackJack = false;
    let isAlive = false;
    let message = "";
    let messageEl = document.getElementById("message-el");
    let sumEl = document.getElementById("sum-el");
    let cardsEl = document.getElementById("cards-el");
    let playerEl = document.getElementById("player-el");

    window.enterGame = function() {
        let nameInput = document.getElementById("name-input").value;
        player.name = nameInput.trim() === '' ? "Player" : nameInput;
        playerEl.textContent = player.name + ": $" + player.chips;

        document.getElementById("name-entry-screen").style.display = "none";
        document.getElementById("game-screen").style.display = "block";
    };

    function getRandomCard() {
        let randomNumber = Math.floor(Math.random() * 13) + 1;
        if (randomNumber > 10) {
            return 10;
        } else if (randomNumber === 1) {
            return 11;
        } else {
            return randomNumber;
        }
    }

    window.startGame = function() {
    isAlive = true;
    player.bet = 20; // Set the player's bet
    player.chips -= player.bet;
    hasBlackJack = false;
    cards = [getRandomCard(), getRandomCard()];
    sum = cards[0] + cards[1];
    document.getElementById("startGameBtn").disabled = true;
    renderGame();
};

function renderGame() {
    cardsEl.textContent = "Cards: " + cards.join(" ");
    sumEl.textContent = "Sum: " + sum;

    // Correctly identify a Blackjack
    if (sum === 21 && cards.length === 2 && ((cards.includes(11) && cards.some(card => card === 10)))) {
        message = "You've got Blackjack!";
        hasBlackJack = true;
        player.chips += player.bet * 1.5;  // Blackjack win at 3:2 payout
        document.getElementById("startGameBtn").disabled = false;
        document.getElementById("staySafeBtn").disabled = true;
    } else if (sum <= 20) {
        message = "Do you want to draw a new card?";
        document.getElementById("staySafeBtn").disabled = false;
    } else if (sum > 21) {
        message = "You're out of the game!";
        isAlive = false;
        document.getElementById("startGameBtn").disabled = false;
    } // hard 21

    playerEl.textContent = player.name + ": $" + player.chips;
    messageEl.textContent = message;
}



window.staySafe = function() {
    if (isAlive && !hasBlackJack) {
        let messages = [
            "You lost. Dealer got BlackJack! Better luck next time!",
            "Nice job! You beat the Dealer.",
            "So close! Play again.",
            "Victory is yours! Well played."
        ];
        let randomIndex = Math.floor(Math.random() * messages.length);
        let randomMessage = messages[randomIndex];
        messageEl.textContent = randomMessage;

        if (randomMessage === "Nice job! You beat the Dealer." || randomMessage === "Victory is yours! Well played.") {
            player.chips += player.bet;  // Adjust winnings for non-Blackjack wins
        }
        
        isAlive = false;
        document.getElementById("startGameBtn").disabled = false;
        playerEl.textContent = player.name + ": $" + player.chips;
    }
};




    window.newCard = function() {
        if (isAlive && !hasBlackJack) {
            let card = getRandomCard();
            sum += card;
            cards.push(card);
            renderGame();
        }
    };

window.staySafe = function() {
        if (isAlive && !hasBlackJack) {
            let dealerSum = 0;
            let dealerCards = [];

            while (dealerSum <= sum && dealerSum < 21) {
                let card = getRandomCard();
                dealerSum += card;
                dealerCards.push(card);
            }

            if (dealerSum > sum && dealerSum <= 21) {
                message = "You lost. Dealer's hand: " + dealerCards.join(" ") + " (Sum: " + dealerSum + ")";
            } else {
                message = "You win!";
                player.chips += player.bet * 2;
            }

            messageEl.textContent = message;
            isAlive = false;
            document.getElementById("startGameBtn").disabled = false;
            playerEl.textContent = player.name + ": $" + player.chips;
        }
    };
});
