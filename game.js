const crypto = require('crypto');
const readline = require('readline-sync');

// RandomKeyGenerator class to generate cryptographically secure keys
class RandomKeyGenerator {
    static generate() {
        return crypto.randomBytes(32).toString('hex'); // Generate a 256-bit key
    }
}

// HashedMessageAuthCode class to handle HMAC generation using SHA-256
class HashedMessageAuthCode {
    static generate(key, message) {
        return crypto.createHmac('sha256', key).update(message).digest('hex');
    }
}

// GameLogic class to manage and evaluate game rules
class GameLogic {
    constructor(choices) {
        this.choices = choices;
        this.half = Math.floor(choices.length / 2);
    }

    // Determine game result based on player's and computer's choices
    evaluateResult(playerChoice, computerChoice) {
        const playerIndex = this.choices.indexOf(playerChoice);
        const computerIndex = this.choices.indexOf(computerChoice);

        if (playerIndex === computerIndex) {
            return 'It\'s a Draw!';
        }

        if ((computerIndex > playerIndex && computerIndex <= playerIndex + this.half) ||
            (computerIndex < playerIndex && computerIndex + this.choices.length <= playerIndex + this.half)) {
            return 'Computer wins!';
        }

        return 'You win!';
    }

    // Create a help table displaying win/lose outcomes for each choice
    createHelpTable() {
        const table = [[' '].concat(this.choices)];

        for (let i = 0; i < this.choices.length; i++) {
            const row = [this.choices[i]];
            for (let j = 0; j < this.choices.length; j++) {
                if (i === j) {
                    row.push('Draw');
                } else {
                    const result = this.evaluateResult(this.choices[i], this.choices[j]);
                    row.push(result === 'You win!' ? 'Win' : 'Lose');
                }
            }
            table.push(row);
        }

        return table.map(row => row.join('\t')).join('\n');
    }

    // Create an abbreviated help table for large numbers of choices
    createAbbreviatedHelpTable() {
        const table = [[' '].concat(this.choices)];

        for (let i = 0; i < Math.min(this.choices.length, 10); i++) {
            const row = [this.choices[i]];
            for (let j = 0; j < Math.min(this.choices.length, 10); j++) {
                if (i === j) {
                    row.push('Draw');
                } else {
                    const result = this.evaluateResult(this.choices[i], this.choices[j]);
                    row.push(result === 'You win!' ? 'Win' : 'Lose');
                }
            }
            table.push(row);
        }

        return table.map(row => row.join('\t')).join('\n') + (this.choices.length > 10 ? '\n... (abbreviated)' : '');
    }
}

// GameSession class to handle the overall game session and user interaction
class GameSession {
    constructor(choices) {
        if (choices.length < 3 || choices.length % 2 === 0) {
            throw new Error('Invalid number of choices. Must be an odd number ≥ 3.');
        }
        this.choices = choices;
        this.logic = new GameLogic(choices);
    }

    // Start the game session
    begin() {
        const key = RandomKeyGenerator.generate();
        const computerChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
        const hmac = HashedMessageAuthCode.generate(key, computerChoice);

        console.log(`HMAC: ${hmac}`);
        this.showMenu();

        while (true) {
            const choice = readline.question('Enter your choice: ');
            if (choice === '0') {
                console.log('Exiting the game. Goodbye!');
                break;
            } else if (choice === '?') {
                if (this.choices.length <= 10) {
                    console.log(this.logic.createHelpTable());
                } else {
                    console.log(this.logic.createAbbreviatedHelpTable());
                }
            } else {
                const playerChoice = this.getPlayerChoice(choice);
                if (playerChoice) {
                    console.log(`Your choice: ${playerChoice}`);
                    console.log(`Computer's choice: ${computerChoice}`);
                    console.log(this.logic.evaluateResult(playerChoice, computerChoice));
                    console.log(`HMAC key: ${key}`);
                    break;
                }
                console.log('Invalid choice. Please try again.');
            }
        }
    }

    // Display the menu of available choices
    showMenu() {
        console.log('Available choices:');
        this.choices.forEach((choice, index) => console.log(`${index + 1} - ${choice}`));
        console.log('0 - Exit');
        console.log('? - Show Help Table');
    }

    // Retrieve the player's choice based on their input
    getPlayerChoice(choice) {
        const index = parseInt(choice, 10) - 1;
        if (index >= 0 && index < this.choices.length) {
            return this.choices[index];
        }
        return null;
    }
}

// Main execution block
const choices = process.argv.slice(2);
if (choices.length < 3 || choices.length % 2 === 0) {
    console.error('Invalid input. Example usage: node game.js rock paper scissors');
    process.exit(1);
}

try {
    const game = new GameSession(choices);
    game.begin();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
