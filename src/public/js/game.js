// Wait for DOM to fully load before adding event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Get references to all elements we'll need
    const startSection = document.querySelector('.start');
    const gameSection = document.querySelector('.game');
    const resultSection = document.querySelector('.result');
    const resetSection = document.querySelector('.reset');
    const errorSection = document.querySelector('.error-message');
    
    const totalCardsInput = document.getElementById('total-cards');
    const maxTurnsInput = document.getElementById('max-turns');
    const cardFacesInput = document.getElementById('card-faces');
    const playButton = document.querySelector('.play-btn');
    const resetButton = document.querySelector('.reset-btn');
    const errorButton = document.querySelector('.error-btn');
    
    // Game state variables
    let gameState = {
        cards: [],
        totalCards: 0,
        maxTurns: 0,
        currentTurn: 0,
        flippedCards: [],
        matchedCards: 0,
        canFlip: true
    };
    
    // Add event listener for the play button
    playButton.addEventListener('click', validateAndStart);
    
    // Add event listener for the reset button
    resetButton.addEventListener('click', resetGame);
    
    // Add event listener for the error button
    errorButton.addEventListener('click', hideErrorMessage);
    
    // Function to validate inputs and start the game
    function validateAndStart() {
        const totalCards = parseInt(totalCardsInput.value);
        const maxTurns = parseInt(maxTurnsInput.value);
        const cardFaces = cardFacesInput.value.trim();
        
        // Check if inputs are numbers
        if (isNaN(totalCards) || isNaN(maxTurns)) {
            showErrorMessage("Please enter valid numbers for cards and turns.");
            return;
        }
        
        // Validation checks
        if (!isValidCardCount(totalCards)) {
            showErrorMessage("Number of cards should be an even number between 4 and 36.");
            return;
        }
        
        if (!isValidMaxTurns(totalCards, maxTurns)) {
            showErrorMessage("Max turns should be equal to or greater than half the number of cards.");
            return;
        }
        
        if (cardFaces && !isValidCardFaces(cardFaces, totalCards)) {
            showErrorMessage("Card faces must contain exactly the same number of values as cards, and each symbol must appear exactly twice.");
            return;
        }
        
        // If we reach here, all inputs are valid
        startGame(totalCards, maxTurns, cardFaces);
    }
    
    // Validate if card count is valid
    function isValidCardCount(totalCards) {
        return totalCards % 2 === 0 && totalCards >= 4 && totalCards <= 36;
    }
    
    // Validate if max turns is valid
    function isValidMaxTurns(totalCards, maxTurns) {
        return maxTurns >= totalCards / 2;
    }
    
    // Validate if card faces are valid
    function isValidCardFaces(cardFaces, totalCards) {
        if (!cardFaces) return true; // Empty is valid, random will be generated
        
        const faces = cardFaces.split(',');
        
        // Check if number of card faces matches total cards
        if (faces.length !== totalCards) {
            return false;
        }
        
        // Check if each symbol appears exactly twice
        const symbolCount = {};
        for (const face of faces) {
            symbolCount[face] = (symbolCount[face] || 0) + 1;
        }
        
        // Each symbol should appear exactly twice
        for (const count of Object.values(symbolCount)) {
            if (count !== 2) {
                return false;
            }
        }
        
        return true;
    }
    
    // Display error message
    function showErrorMessage(message) {
        const errorMessageElement = document.querySelector('.error-message');
        errorMessageElement.innerHTML = message + '<button class="error-btn" type="button">Go Back</button>';
        
        // Re-add event listener to the new button
        const newErrorButton = document.querySelector('.error-btn');
        newErrorButton.addEventListener('click', hideErrorMessage);
        
        errorSection.style.display = 'block';
        startSection.style.display = 'none';
        
        // Add a shake animation to the error message for better visibility
        errorMessageElement.classList.add('shake-animation');
        setTimeout(() => {
            errorMessageElement.classList.remove('shake-animation');
        }, 500);
    }
    
    // Hide error message
    function hideErrorMessage() {
        errorSection.style.display = 'none';
        startSection.style.display = 'block';
    }
    
    // Reset the game
    function resetGame() {
        // Hide game and result sections
        gameSection.style.display = 'none';
        resultSection.style.display = 'none';
        resetSection.style.display = 'none';
        
        // Show start section
        startSection.style.display = 'block';
        
        // Reset game state
        gameState = {
            cards: [],
            totalCards: 0,
            maxTurns: 0,
            currentTurn: 0,
            flippedCards: [],
            matchedCards: 0,
            canFlip: true
        };
    }
    
    // Start the game
    function startGame(totalCards, maxTurns, cardFaces) {
        // Hide start section
        startSection.style.display = 'none';
        
        // Show game and reset sections
        gameSection.style.display = 'block';
        resetSection.style.display = 'block';
        
        // Generate or use provided card faces
        const cards = generateCards(totalCards, cardFaces);
        
        // Update game state
        gameState.cards = cards;
        gameState.totalCards = totalCards;
        gameState.maxTurns = maxTurns;
        gameState.currentTurn = 0;
        gameState.flippedCards = [];
        gameState.matchedCards = 0;
        gameState.canFlip = true;
        
        // Create game board
        createGameBoard(cards, totalCards, maxTurns);
    }
    
    // Generate cards (either random or from provided values)
    function generateCards(totalCards, cardFaces) {
        if (cardFaces) {
            return cardFaces.split(',');
        } else {
            // Generate random card faces (emojis)
            const emojis = ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', 
                          '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗', 
                          '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', 
                          '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜'];
            
            // Select random emojis
            const selectedEmojis = [];
            const uniqueEmojis = Math.floor(totalCards / 2);
            
            // Pick random unique emojis
            while (selectedEmojis.length < uniqueEmojis) {
                const randomIndex = Math.floor(Math.random() * emojis.length);
                const emoji = emojis[randomIndex];
                
                if (!selectedEmojis.includes(emoji)) {
                    selectedEmojis.push(emoji);
                }
            }
            
            // Double each emoji and shuffle
            let cards = [];
            for (const emoji of selectedEmojis) {
                cards.push(emoji, emoji);
            }
            return shuffleArray(cards);
        }
    }
    
    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Create the game board
    function createGameBoard(cards, totalCards, maxTurns) {
        // Clear existing content
        gameSection.innerHTML = '';
        
        // Add turn counter with improved styling
        const turnCounter = document.createElement('div');
        turnCounter.className = 'turn-counter';
        turnCounter.textContent = `TURN ${gameState.currentTurn}/${maxTurns}`;
        turnCounter.style.fontSize = '1.5em';
        turnCounter.style.fontWeight = 'bold';
        turnCounter.style.margin = '20px 0';
        turnCounter.style.color = '#333';
        gameSection.appendChild(turnCounter);
        
        // Create card grid
        const cardGrid = document.createElement('div');
        cardGrid.className = 'card-grid';
        gameSection.appendChild(cardGrid);
        
        // Calculate grid dimensions for optimal layout
        let rows, cols;
        if (totalCards === 4) {
            rows = 2; cols = 2;
        } else if (totalCards === 6) {
            rows = 2; cols = 3;
        } else if (totalCards === 8) {
            rows = 2; cols = 4;
        } else if (totalCards === 9) {
            rows = 3; cols = 3;
        } else if (totalCards === 10) {
            rows = 2; cols = 5;
        } else if (totalCards === 12) {
            rows = 3; cols = 4;
        } else if (totalCards === 16) {
            rows = 4; cols = 4;
        } else if (totalCards === 20) {
            rows = 4; cols = 5;
        } else if (totalCards === 24) {
            rows = 4; cols = 6;
        } else if (totalCards === 30) {
            rows = 5; cols = 6;
        } else if (totalCards === 36) {
            rows = 6; cols = 6;
        } else {
            // Default layout
            rows = Math.floor(Math.sqrt(totalCards));
            cols = Math.ceil(totalCards / rows);
        }
        
        // Set grid style
        cardGrid.style.display = 'grid';
        cardGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        cardGrid.style.gap = '10px';
        cardGrid.style.margin = '20px auto';
        cardGrid.style.maxWidth = `${cols * 100}px`;
        
        // Create cards with improved styling
        for (let i = 0; i < totalCards; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = i;
            card.dataset.value = cards[i];
            card.style.height = '100px';
            card.style.background = 'linear-gradient(145deg, #2196F3, #1E88E5)';
            card.style.borderRadius = '8px';
            card.style.display = 'flex';
            card.style.justifyContent = 'center';
            card.style.alignItems = 'center';
            card.style.cursor = 'pointer';
            card.style.fontSize = '2em';
            card.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';
            card.style.transition = 'transform 0.3s, box-shadow 0.3s';
            
            // Add hover effect
            card.addEventListener('mouseover', function() {
                if (!this.classList.contains('matched') && !gameState.flippedCards.includes(parseInt(this.dataset.index))) {
                    this.style.transform = 'scale(1.05)';
                    this.style.boxShadow = '0 6px 12px rgba(0,0,0,0.25), 0 5px 5px rgba(0,0,0,0.22)';
                }
            });
            
            card.addEventListener('mouseout', function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';
            });
            
            // Add click event listener to each card
            card.addEventListener('click', handleCardClick);
            
            cardGrid.appendChild(card);
        }
        
        // Message area for "Match" or "No Match" with improved styling
        const messageArea = document.createElement('div');
        messageArea.className = 'message-area';
        messageArea.style.margin = '20px 0';
        messageArea.style.fontSize = '1.2em';
        messageArea.style.minHeight = '80px';
        gameSection.appendChild(messageArea);
    }
    
    // Handle card click
    function handleCardClick(event) {
        const card = event.currentTarget;
        const cardIndex = parseInt(card.dataset.index);
        
        // Ignore clicks if:
        // - Game is waiting for user to press "OK" after flipping two cards
        // - This card is already flipped
        // - This card is already matched
        if (!gameState.canFlip || 
            gameState.flippedCards.includes(cardIndex) || 
            card.classList.contains('matched')) {
            return;
        }
        
        // Add flip animation
        card.style.transform = 'rotateY(180deg)';
        setTimeout(() => {
            // Flip the card
            flipCard(card);
            card.style.transform = 'rotateY(0deg)';
        }, 150);
        
        // Add to flipped cards
        gameState.flippedCards.push(cardIndex);
        
        // If two cards are flipped, check for a match
        if (gameState.flippedCards.length === 2) {
            gameState.canFlip = false;
            
            // Get both flipped cards
            const firstCardIndex = gameState.flippedCards[0];
            const secondCardIndex = gameState.flippedCards[1];
            const firstCard = document.querySelector(`.card[data-index="${firstCardIndex}"]`);
            const secondCard = document.querySelector(`.card[data-index="${secondCardIndex}"]`);
            
            // Check if the cards match
            const isMatch = firstCard.dataset.value === secondCard.dataset.value;
            
            // Update message area with styled message
            const messageArea = document.querySelector('.message-area');
            if (isMatch) {
                messageArea.innerHTML = `
                    <p style="color: #4CAF50; font-weight: bold; font-size: 1.5em;">Match!</p>
                `;
            } else {
                messageArea.innerHTML = `
                    <p style="color: #F44336; font-weight: bold; font-size: 1.5em;">No Match</p>
                `;
            }
            
            // Add styled OK button
            const okButton = document.createElement('button');
            okButton.textContent = 'OK';
            okButton.style.padding = '8px 20px';
            okButton.style.fontSize = '1em';
            okButton.style.background = '#2196F3';
            okButton.style.color = 'white';
            okButton.style.border = 'none';
            okButton.style.borderRadius = '4px';
            okButton.style.cursor = 'pointer';
            okButton.style.marginTop = '10px';
            okButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            
            okButton.addEventListener('mouseover', function() {
                this.style.background = '#1976D2';
            });
            
            okButton.addEventListener('mouseout', function() {
                this.style.background = '#2196F3';
            });
            
            okButton.addEventListener('click', () => {
                // Increment turn
                gameState.currentTurn++;
                
                // Update turn counter
                const turnCounter = document.querySelector('.turn-counter');
                turnCounter.textContent = `TURN ${gameState.currentTurn}/${gameState.maxTurns}`;
                
                // If match, mark cards as matched
                if (isMatch) {
                    firstCard.classList.add('matched');
                    secondCard.classList.add('matched');
                    
                    // Add a subtle glow to matched cards
                    firstCard.style.boxShadow = '0 0 8px 2px rgba(76, 175, 80, 0.6)';
                    secondCard.style.boxShadow = '0 0 8px 2px rgba(76, 175, 80, 0.6)';
                    
                    gameState.matchedCards += 2;
                } else {
                    // If no match, flip cards back with animation
                    setTimeout(() => {
                        firstCard.style.transform = 'rotateY(180deg)';
                        secondCard.style.transform = 'rotateY(180deg)';
                        
                        setTimeout(() => {
                            unflipCard(firstCard);
                            unflipCard(secondCard);
                            firstCard.style.transform = 'rotateY(0deg)';
                            secondCard.style.transform = 'rotateY(0deg)';
                        }, 150);
                    }, 300);
                }
                
                // Clear flipped cards array
                gameState.flippedCards = [];
                
                // Clear message area
                messageArea.innerHTML = '';
                
                // Allow flipping cards again
                gameState.canFlip = true;
                
                // Check if game is over
                checkGameEnd();
            });
            
            messageArea.appendChild(okButton);
        }
    }
    
    // Flip a card to show its value
    function flipCard(card) {
        card.textContent = card.dataset.value;
        card.style.background = '#fff';
        card.style.color = '#000';
    }
    
    // Unflip a card to hide its value
    function unflipCard(card) {
        card.textContent = '';
        card.style.background = 'linear-gradient(145deg, #2196F3, #1E88E5)';
    }
    
    // Check if the game is over
    function checkGameEnd() {
        // Game is over if all cards are matched or max turns reached
        if (gameState.matchedCards === gameState.totalCards || 
            gameState.currentTurn >= gameState.maxTurns) {
            
            // Show result
            resultSection.style.display = 'block';
            
            // Determine win/lose
            const hasWon = gameState.matchedCards === gameState.totalCards;
            
            // Show result message with styling
            resultSection.innerHTML = `
                <h2 style="color: ${hasWon ? '#4CAF50' : '#F44336'}; font-size: 2em;">
                    ${hasWon ? '🎉 You Win! 🎉' : '😞 Game Over 😞'}
                </h2>
                <p style="font-size: 1.2em;">TURN ${gameState.currentTurn}/${gameState.maxTurns}</p>
                <p style="font-size: 1.2em;">${gameState.matchedCards} out of ${gameState.totalCards} cards matched</p>
                <button class="play-again-btn" style="
                    padding: 10px 25px;
                    font-size: 1.2em;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 20px;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.16);
                ">Play Again</button>
            `;
            
            // Add event listener to play again button
            const playAgainButton = document.querySelector('.play-again-btn');
            playAgainButton.addEventListener('mouseover', function() {
                this.style.background = '#388E3C';
            });
            
            playAgainButton.addEventListener('mouseout', function() {
                this.style.background = '#4CAF50';
            });
            
            playAgainButton.addEventListener('click', resetGame);
            
            // Disable card flipping
            gameState.canFlip = false;
            
            // Save the game score to localStorage (for extra credit)
            const lastScore = {
                turns: gameState.currentTurn,
                maxTurns: gameState.maxTurns,
                matched: gameState.matchedCards,
                totalCards: gameState.totalCards,
                hasWon: hasWon
            };
            
            localStorage.setItem('memoremojiLastScore', JSON.stringify(lastScore));
        }
    }
    
    // Add CSS rules programmatically for animations
    const style = document.createElement('style');
    style.textContent = `
        .card {
            transition: transform 0.3s ease-in-out, background 0.3s ease, box-shadow 0.3s ease;
        }
        
        .shake-animation {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
    `;
    document.head.appendChild(style);
});