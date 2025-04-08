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
        
        // Validation checks
        if (!isValidCardCount(totalCards)) {
            showErrorMessage("Number of cards should be an even number greater than 2 and less than or equal to 36.");
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
        
        // Add turn counter
        const turnCounter = document.createElement('div');
        turnCounter.className = 'turn-counter';
        turnCounter.textContent = `TURN ${gameState.currentTurn}/${maxTurns}`;
        gameSection.appendChild(turnCounter);
        
        // Create card grid
        const cardGrid = document.createElement('div');
        cardGrid.className = 'card-grid';
        gameSection.appendChild(cardGrid);
        
        // Calculate grid dimensions
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
        
        // Create cards
        for (let i = 0; i < totalCards; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = i;
            card.dataset.value = cards[i];
            card.style.height = '100px';
            card.style.background = '#2196F3';
            card.style.borderRadius = '5px';
            card.style.display = 'flex';
            card.style.justifyContent = 'center';
            card.style.alignItems = 'center';
            card.style.cursor = 'pointer';
            card.style.fontSize = '2em';
            
            // Add click event listener to each card
            card.addEventListener('click', handleCardClick);
            
            cardGrid.appendChild(card);
        }
        
        // Message area for "Match" or "No Match"
        const messageArea = document.createElement('div');
        messageArea.className = 'message-area';
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
        
        // Flip the card
        flipCard(card);
        
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
            
            // Update message area
            const messageArea = document.querySelector('.message-area');
            messageArea.innerHTML = isMatch ? 
                '<p>Match!</p>' : 
                '<p>No Match</p>';
            
            // Add OK button
            const okButton = document.createElement('button');
            okButton.textContent = 'OK';
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
                    gameState.matchedCards += 2;
                } else {
                    // If no match, flip cards back
                    unflipCard(firstCard);
                    unflipCard(secondCard);
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
        card.style.background = '#2196F3';
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
            
            // Show result message
            resultSection.innerHTML = `
                <h2>${hasWon ? 'You Win!' : 'Game Over'}</h2>
                <p>TURN ${gameState.currentTurn}/${gameState.maxTurns}</p>
                <p>${gameState.matchedCards} out of ${gameState.totalCards} cards matched</p>
            `;
            
            // Disable card flipping
            gameState.canFlip = false;
        }
    }
});