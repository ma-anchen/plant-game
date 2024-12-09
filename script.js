// script.js
const GAME_RULES = {
    WATER_POINTS: 10,
    FERTILIZE_POINTS: 5,
    DEATH_PENALTY: 20,
    MIN_WARNING: 2,
    MAX_WARNING: 3,
    MIN_DEATH: 4,
    MAX_DEATH: 6,
    FERTILIZE_MUTATION: 2
};

// Initialize global variables
let players = [];
let currentPlayerIndex = 0;
let gameResults = [];

// Define plants array
const plants = [
    {
        id: 1,
        isActive: true,
        isDead: false,
        score: 0,
        waterStreak: 0,
        fertilizeStreak: 0,
        lastAction: null,
        successScore: 120,
        successImage: 'https://preview.redd.it/bq7ieo9a98m61.jpg?width=640&crop=smart&auto=webp&s=b7aa3305b492ba4d36a6303d33f7e4c3a24ce05b',
        deadImage: 'https://www.pngkey.com/png/full/416-4161020_a-dead-tree-dead-tree-pixel-art.png',
        mutatedImage: 'https://static.vecteezy.com/system/resources/previews/023/205/594/non_2x/piranha-plant-for-mario-bros-flower-piranha-pixel-art-free-vector.jpg',
        elementId: 'rose'
    },
    {
        id: 2,
        isActive: true,
        isDead: false,
        score: 0,
        waterStreak: 0,
        fertilizeStreak: 0,
        lastAction: null,
        successScore: 100,
        successImage: 'https://art.pixilart.com/4980b114ab3b.png',
        deadImage: 'https://www.pngkey.com/png/full/416-4161020_a-dead-tree-dead-tree-pixel-art.png',
        mutatedImage: 'https://static.vecteezy.com/system/resources/previews/023/205/594/non_2x/piranha-plant-for-mario-bros-flower-piranha-pixel-art-free-vector.jpg',
        elementId: 'hydrangea'
    },
    {
        id: 3,
        isActive: true,
        isDead: false,
        score: 0,
        waterStreak: 0,
        fertilizeStreak: 0,
        lastAction: null,
        successScore: 80,
        successImage: 'https://img.freepik.com/premium-vector/flat-design-flower-pixel-art_23-2149255774.jpg',
        deadImage: 'https://www.pngkey.com/png/full/416-4161020_a-dead-tree-dead-tree-pixel-art.png',
        mutatedImage: 'https://static.vecteezy.com/system/resources/previews/023/205/594/non_2x/piranha-plant-for-mario-bros-flower-piranha-pixel-art-free-vector.jpg',
        elementId: 'sunflower'
    }
];

// Define all functions
function initializeGame() {
    if (players.length > 0) return;
    
    const numPlayers = parseInt(prompt("How many players will participate?"));
    if (isNaN(numPlayers) || numPlayers < 1) {
        alert("Please enter a valid number of players!");
        return initializeGame();
    }
    
    players = Array(numPlayers).fill().map((_, i) => ({
        name: `Player ${i + 1}`,
        score: 0,
        operations: 0
    }));
    
    getPlayerNameAndStart();
}

function getPlayerNameAndStart() {
    const playerName = prompt(`Enter name for Player ${currentPlayerIndex + 1}:`);
    if (playerName) {
        players[currentPlayerIndex].name = playerName;
    }
    
    // Reset current player's game state
    players[currentPlayerIndex].score = 0;
    players[currentPlayerIndex].operations = 0;
    
    // Reset all plant scores
    plants.forEach(plant => {
        plant.score = 0;
        plant.waterStreak = 0;
        plant.fertilizeStreak = 0;
        plant.lastAction = null;
        plant.isActive = true;
        plant.isDead = false;
    });
    
    // Initialize random limits for all plants
    plants.forEach((plant) => {
        const limits = generateFlowerLimits(plant.id);
        plant.warningNumber = limits.warningNumber;
        plant.dieNumber = limits.dieNumber;
    });
    
    updatePlayerDisplay();
    updateScoreboard();
}

function updatePlayerDisplay() {
    const playerInfo = document.getElementById('current-player');
    playerInfo.textContent = `Current Player: ${players[currentPlayerIndex].name}`;
}

// Modify the existing checkGameEnd function
function checkGameEnd() {
    const allPlantsFinished = plants.every(plant => !plant.isActive);
    
    if (allPlantsFinished) {
        // Calculate score for current player
        let playerScore = calculateCurrentScore();
        players[currentPlayerIndex].score = playerScore;
        
        // Show continue dialog
        showContinueDialog();
    }
}

function showFinalResults() {
    if (currentPlayerIndex < players.length - 1) {
        console.error("Trying to show final results before all players finished");
        return;
    }

    const maxOperations = Math.max(...players.map(p => p.operations));
    
    const finalScores = players.map(player => {
        const extraPoints = Math.max(0, (maxOperations - player.operations) * 5);
        return {
            ...player,
            extraPoints,
            finalScore: player.score + extraPoints
        };
    });
    
    // Sort by final score
    const sortedPlayers = [...finalScores].sort((a, b) => b.finalScore - a.finalScore);
    
    // Create results HTML
    let resultsHTML = '<h2>Final Rankings</h2><ol>';
    sortedPlayers.forEach(player => {
        resultsHTML += `
            <li>
                <strong>${player.name}</strong><br>
                Base Score: ${player.score}<br>
                Operations: ${player.operations}<br>
                Extra Points: ${player.extraPoints}<br>
                Final Score: ${player.finalScore}
            </li>`;
    });
    resultsHTML += '</ol>';
    
    // Add operations statistics
    resultsHTML += `
        <div class="operations-stats">
            <h3>Operations Statistics</h3>
            <p>Most operations: ${maxOperations}</p>
            ${players.map(p => 
                `<p>${p.name}: ${p.operations} operations (${(maxOperations - p.operations) * 5} extra points)</p>`
            ).join('')}
        </div>
        <div class="play-again-container">
            <button id="play-again-btn" class="play-again-btn">Play Again</button>
        </div>`;
    
    // Create modal to display results
    const modal = document.createElement('div');
    modal.className = 'results-modal';
    modal.innerHTML = resultsHTML;
    document.body.appendChild(modal);

    // Add event listener to Play Again button
    const playAgainBtn = modal.querySelector('#play-again-btn');
    playAgainBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resetGame();
    });
}

// Add new function to reset the game
function resetGame() {
    // Reset all global variables
    players = [];
    currentPlayerIndex = 0;
    gameResults = [];
    
    // Reset all plants to initial state
    plants.forEach(plant => {
        plant.score = 0;
        plant.waterStreak = 0;
        plant.fertilizeStreak = 0;
        plant.lastAction = null;
        plant.isActive = true;
        plant.isDead = false;
    });
    
    // Reset UI
    resetAllPlants();
    
    // Start new game
    initializeGame();
}

// Modify generateFlowerLimits to be more robust
function generateFlowerLimits(flowerId) {
    // Generate warning number (2-3)
    const warningNumber = Math.floor(Math.random() * 
        (GAME_RULES.MAX_WARNING - GAME_RULES.MIN_WARNING + 1)) + GAME_RULES.MIN_WARNING;
    
    // Generate die number (warning+1 to 6)
    const minDie = Math.max(warningNumber + 1, GAME_RULES.MIN_DEATH);
    const maxDie = Math.min(GAME_RULES.MAX_DEATH, warningNumber + 3);
    const dieNumber = Math.floor(Math.random() * (maxDie - minDie + 1)) + minDie;
    
    console.log(`Plant ${flowerId}: Warning at ${warningNumber}, Dies at ${dieNumber}`);
    
    return { warningNumber, dieNumber };
}

// Modify resetAllPlants to reset all plant states
function resetAllPlants() {
    plants.forEach((plant) => {
        const limits = generateFlowerLimits(plant.id);
        plant.warningNumber = limits.warningNumber;
        plant.dieNumber = limits.dieNumber;
        plant.score = 0;  // Reset score
        plant.waterStreak = 0;
        plant.fertilizeStreak = 0;
        plant.lastAction = null;
        plant.isActive = true;
        plant.isDead = false;
        
        const plantImage = document.getElementById(plant.elementId);
        plantImage.style.backgroundImage = 'url("https://img.freepik.com/premium-vector/little-plant-soil-pixel-art-style_475147-1002.jpg")';
        plantImage.style.backgroundColor = '';
        
        const scoreDisplay = document.getElementById('score' + plant.id);
        scoreDisplay.textContent = plant.successScore;
        
        // Clear any warnings
        const alertContainer = document.getElementById('alert-container' + plant.id);
        if (alertContainer) {
            alertContainer.innerHTML = '';
        }
        
        enableButtons(
            document.getElementById('water' + plant.id),
            document.getElementById('fertilize' + plant.id)
        );
    });
}

// Add to the beginning of your existing initialization code
plants.forEach(function(plant) {
    const waterBtn = document.getElementById('water' + plant.id);
    const fertilizeBtn = document.getElementById('fertilize' + plant.id);
    const plantImage = document.getElementById(plant.elementId);
    const scoreDisplay = document.getElementById('score' + plant.id);

    // Initialize score display
    scoreDisplay.textContent = plant.successScore;

    // Water logic
    waterBtn.addEventListener('click', function() {
        if (!plant.isActive || plant.isDead) return; // Double check plant state
        
        players[currentPlayerIndex].operations++;
        if (plant.lastAction !== 'water') {
            plant.waterStreak = 1;
        } else {
            plant.waterStreak++;
        }
        plant.fertilizeStreak = 0;
        plant.lastAction = 'water';
        plant.score += GAME_RULES.WATER_POINTS;
        
        // Ensure score doesn't exceed success score
        plant.score = Math.min(plant.score, plant.successScore);
        scoreDisplay.textContent = Math.max(0, plant.successScore - plant.score);

        updateScoreboard();

        // Warning system
        const alertContainer = document.getElementById('alert-container' + plant.id);
        if (alertContainer) {
            alertContainer.innerHTML = ''; // Clear previous warnings
            if (plant.waterStreak === plant.warningNumber) {
                const alert = document.createElement('div');
                alert.className = 'alert alert-warning alert-dismissible fade show';
                alert.role = 'alert';
                alert.innerHTML = `
                    <strong>WARNING!</strong> ${plant.elementId} can't take more water!
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;

                if (alertContainer) {
                    alertContainer.appendChild(alert);
                }

                const warningSound = document.getElementById('warning-sound');
                if (warningSound) {
                    warningSound.currentTime = 0;
                    warningSound.play();
                }
            }
        }

        if (plant.waterStreak >= plant.dieNumber) {
            handlePlantDeath(plant, waterBtn, fertilizeBtn, plantImage);
        }
        
        checkWinningCondition(plant, plantImage);
    });

    // Fertilize logic
    fertilizeBtn.addEventListener('click', function() {
        if (!plant.isActive) return;
        
        players[currentPlayerIndex].operations++; // Count operation
        if (plant.lastAction !== 'fertilize') {
            plant.fertilizeStreak = 1;
        } else {
            plant.fertilizeStreak++;
        }
        plant.waterStreak = 0;
        plant.lastAction = 'fertilize';
        plant.score += GAME_RULES.FERTILIZE_POINTS;
        scoreDisplay.textContent = Math.max(0, plant.successScore - plant.score);

        // Update scoreboard immediately after score change
        updateScoreboard();

        if (plant.fertilizeStreak >= GAME_RULES.FERTILIZE_MUTATION) {
            plantImage.style.backgroundImage = 'url("' + plant.mutatedImage + '")';
            disableButtons(waterBtn, fertilizeBtn);
            plant.fertilizeStreak = 0;
            plant.isActive = false;
            plant.isDead = true;
            // Don't reset score anymore, just mark as dead
            
            const evilLaugh = document.getElementById('evil-laugh');
            if (evilLaugh) {
                evilLaugh.currentTime = 0;
                evilLaugh.play();
            }
            
            updateScoreboard();
            checkGameEnd();
        }

        checkWinningCondition(plant, plantImage);
    });
});

function checkWinningCondition(plant, plantImage) {
    if (plant.score >= plant.successScore) {  
        plantImage.style.backgroundImage = 'url("' + plant.successImage + '")';
        disableButtons(document.getElementById('water' + plant.id), document.getElementById('fertilize' + plant.id));
        document.getElementById('score' + plant.id).textContent = '0';
        
        plant.isActive = false;
        
        const successSound = document.getElementById('success-sound');
        if (successSound) {
            successSound.currentTime = 0;
            successSound.play();
        }

        // Update scoreboard immediately after winning
        updateScoreboard();
        checkGameEnd();
    }
}

function disableButtons(waterBtn, fertilizeBtn) {
    waterBtn.disabled = true;
    fertilizeBtn.disabled = true;
}

function enableButtons(waterBtn, fertilizeBtn) {
    waterBtn.disabled = false;
    fertilizeBtn.disabled = false;
}

// Modify resetPlant function
function resetPlant(plantId) {
    const plant = plants[plantId - 1];
    plant.score = 0;
    plant.waterStreak = 0;
    plant.fertilizeStreak = 0;
    plant.lastAction = null;
    plant.isActive = true;  // Reset active state
    plant.isDead = false;   // Reset dead state
    
    const plantImage = document.getElementById(plant.elementId);
    plantImage.style.backgroundImage = 'url("https://img.freepik.com/premium-vector/little-plant-soil-pixel-art-style_475147-1002.jpg")';
    plantImage.style.backgroundColor = '';
    
    const scoreDisplay = document.getElementById('score' + plant.id);
    scoreDisplay.textContent = plant.successScore;
    
    enableButtons(
        document.getElementById('water' + plant.id),
        document.getElementById('fertilize' + plant.id)
    );
}

// Add this helper function to get success score
function getSuccessScore(plantId) {
    const successScores = {
        1: 120, // Rose
        2: 100, // Hydrangea
        3: 80   // Sunflower
    };
    return successScores[plantId];
}

// Add this function to update the scoreboard
function updateScoreboard() {
    const scoreboardDiv = document.getElementById('player-scores');
    scoreboardDiv.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = `player-score-item${index === currentPlayerIndex ? ' current' : ''}`;
        
        // Calculate current score for active player
        let currentScore = player.score;
        if (index === currentPlayerIndex) {
            currentScore = calculateCurrentScore();
        }
        
        playerDiv.innerHTML = `
            ${player.name}: ${currentScore} points
            <br>
            <small>Operations: ${player.operations}</small>
        `;
        scoreboardDiv.appendChild(playerDiv);
    });
}

// Modify calculateCurrentScore to use game rules
function calculateCurrentScore() {
    let score = 0;
    plants.forEach((plant) => {
        if (plant.isDead) {
            score += Math.max(0, plant.score - GAME_RULES.DEATH_PENALTY);
            return;
        }
        if (!plant.isActive && plant.score >= plant.successScore) {
            score += plant.successScore;
        } else {
            score += Math.min(plant.score, plant.successScore);
        }
    });
    return score;
}

// Add this function to show continue dialog
function showContinueDialog() {
    const modal = document.createElement('div');
    modal.className = 'continue-modal';
    
    // Store current player's final score
    players[currentPlayerIndex].score = calculateCurrentScore();
    
    const message = document.createElement('div');
    message.innerHTML = `
        <h3>${players[currentPlayerIndex].name}'s game is finished!</h3>
        <p>Final score: ${players[currentPlayerIndex].score} points</p>
        ${currentPlayerIndex < players.length - 1 ? 
            '<p>Next player will be prompted to enter their name</p>' : 
            '<p>This was the last player!</p>'}
    `;
    
    const continueBtn = document.createElement('button');
    continueBtn.textContent = currentPlayerIndex < players.length - 1 ? 'Continue' : 'Show Final Results';
    continueBtn.onclick = () => {
        document.body.removeChild(modal);
        if (currentPlayerIndex < players.length - 1) {
            currentPlayerIndex++;
            // Reset all plants and get new player's name
            resetAllPlants();
            getPlayerNameAndStart();
        } else {
            showFinalResults();
        }
    };
    
    modal.appendChild(message);
    modal.appendChild(continueBtn);
    document.body.appendChild(modal);
}

// Add helper function for plant death
function handlePlantDeath(plant, waterBtn, fertilizeBtn, plantImage) {
    if (plant.isDead) return; // Prevent multiple deaths
    
    plantImage.style.backgroundImage = 'url("' + plant.deadImage + '")';
    disableButtons(waterBtn, fertilizeBtn);
    plant.waterStreak = 0;
    plant.isActive = false;
    plant.isDead = true;
    
    // Play sound
    const dieSound = document.getElementById('die-sound');
    if (dieSound) {
        dieSound.currentTime = 0;
        dieSound.play();
    }
    
    updateScoreboard();
    checkGameEnd();
}

// Wait for DOM to be ready before initializing
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    
    // Set up event listeners for plants
    plants.forEach(function(plant) {
        // ... plant event listeners setup ...
    });
});