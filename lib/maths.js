function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateQuestion(difficulty) {
    let num1, num2, operation, result, maxNumber, maxOperations, otherDifficulties;

    switch (difficulty) {
        case 'easy':
            maxNumber = 10;
            maxOperations = 2;
            otherDifficulties = ['normal', 'hard', 'extreme', 'impossible', 'impossible2', 'god'];
            break;
        case 'normal':
            maxNumber = 50;
            maxOperations = 3;
            otherDifficulties = ['easy', 'hard', 'extreme', 'impossible', 'impossible2', 'god'];
            break;
        case 'hard':
            maxNumber = 100;
            maxOperations = 4;
            otherDifficulties = ['easy', 'normal', 'extreme', 'impossible', 'impossible2', 'god'];
            break;
        case 'extreme':
            maxNumber = 500;
            maxOperations = 5;
            otherDifficulties = ['easy', 'normal', 'hard', 'impossible', 'impossible2', 'god'];
            break;
        case 'impossible':
            maxNumber = 1000;
            maxOperations = 6;
            otherDifficulties = ['easy', 'normal', 'hard', 'extreme', 'impossible2', 'god'];
            break;
        case 'impossible2':
            maxNumber = 10000;
            maxOperations = 7;
            otherDifficulties = ['easy', 'normal', 'hard', 'extreme', 'impossible', 'god'];
            break;
        case 'god':
            maxNumber = 100000;
            maxOperations = 8;
            otherDifficulties = ['easy', 'normal', 'hard', 'extreme', 'impossible', 'impossible2'];
            break;
        default:
            return { error: 'Invalid difficulty' };
    }

    let question = '';
    result = randomInt(1, maxNumber);
    question += result;

    for (let i = 0; i < maxOperations; i++) {
        operation = ['+', '-', '*', '/'][randomInt(0, 3)];
        num2 = randomInt(1, maxNumber);

        switch (operation) {
            case '+':
                result += num2;
                break;
            case '-':
                result -= num2;
                break;
            case '*':
                result *= num2;
                break;
            case '/':
                num2 = randomInt(1, maxNumber);
                while (result % num2 !== 0) {
                    num2 = randomInt(1, maxNumber);
                }
                result /= num2;
                break;
        }

        question += ` ${operation} ${num2}`;
    }

    return { question, answer: result, otherDifficulties };
}

module.exports = {
    randomInt,
    generateQuestion
};
