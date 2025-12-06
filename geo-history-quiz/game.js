document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const questionScreen = document.getElementById('question-screen');
    const endScreen = document.getElementById('end-screen');
    
    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const categoryTag = document.getElementById('category-tag');
    const scoreBoard = document.getElementById('score-board');
    const scoreDisplay = document.getElementById('score');
    const progressFill = document.getElementById('progress-fill');
    
    const feedbackArea = document.getElementById('feedback-area');
    const feedbackText = document.getElementById('feedback-text');
    
    const finalScoreDisplay = document.getElementById('final-score');
    const totalQuestionsDisplay = document.getElementById('total-questions');
    const finalMessage = document.getElementById('final-message');

    // Game State
    let currentQuestionIndex = 0;
    let score = 0;
    let shuffledQuestions = [];

    // Event Listeners
    startBtn.addEventListener('click', startGame);
    nextBtn.addEventListener('click', nextQuestion);
    restartBtn.addEventListener('click', startGame);

    function startGame() {
        score = 0;
        currentQuestionIndex = 0;
        // Shuffle questions
        shuffledQuestions = [...quizData].sort(() => Math.random() - 0.5);
        
        scoreDisplay.textContent = score;
        
        // Show/Hide Screens
        startScreen.classList.remove('active');
        endScreen.classList.remove('active');
        endScreen.classList.add('hidden');
        questionScreen.classList.remove('hidden');
        questionScreen.classList.add('active');
        scoreBoard.classList.remove('hidden');
        
        loadQuestion();
    }

    function loadQuestion() {
        resetState();
        const currentQuestion = shuffledQuestions[currentQuestionIndex];
        
        questionText.textContent = currentQuestion.question;
        categoryTag.textContent = currentQuestion.category;
        
        // Update Progress Bar
        const progress = ((currentQuestionIndex) / shuffledQuestions.length) * 100;
        progressFill.style.width = `${progress}%`;

        // Create Options
        // Copy options to not mutate original data and shuffle them
        const options = [...currentQuestion.options].sort(() => Math.random() - 0.5);

        options.forEach(option => {
            const button = document.createElement('button');
            button.innerText = option;
            button.classList.add('option-btn');
            button.addEventListener('click', () => selectAnswer(button, option, currentQuestion.answer));
            optionsContainer.appendChild(button);
        });
    }

    function resetState() {
        nextBtn.classList.remove('hidden'); // Ensure button is available to be shown later
        feedbackArea.classList.add('hidden');
        while (optionsContainer.firstChild) {
            optionsContainer.removeChild(optionsContainer.firstChild);
        }
    }

    function selectAnswer(selectedButton, selectedOption, correctAnswer) {
        // Disable all buttons
        const allButtons = optionsContainer.querySelectorAll('.option-btn');
        allButtons.forEach(btn => btn.disabled = true);

        const isCorrect = selectedOption === correctAnswer;

        if (isCorrect) {
            score++;
            scoreDisplay.textContent = score;
            selectedButton.classList.add('correct');
            feedbackText.textContent = "Correct! 🎉";
            feedbackText.style.color = "var(--success-color)";
        } else {
            selectedButton.classList.add('wrong');
            feedbackText.textContent = `Oops! The correct answer was: ${correctAnswer}`;
            feedbackText.style.color = "var(--error-color)";
            
            // Highlight the correct answer
            allButtons.forEach(btn => {
                if (btn.innerText === correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }

        feedbackArea.classList.remove('hidden');
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < shuffledQuestions.length) {
            loadQuestion();
        } else {
            endGame();
        }
    }

    function endGame() {
        questionScreen.classList.remove('active');
        questionScreen.classList.add('hidden');
        scoreBoard.classList.add('hidden');
        
        endScreen.classList.remove('hidden');
        endScreen.classList.add('active');
        
        finalScoreDisplay.textContent = score;
        totalQuestionsDisplay.textContent = shuffledQuestions.length;

        const percentage = (score / shuffledQuestions.length) * 100;
        if (percentage === 100) {
            finalMessage.textContent = "Perfect Score! You're a genius! 🌟";
        } else if (percentage >= 80) {
            finalMessage.textContent = "Great job! You know your stuff! 👏";
        } else if (percentage >= 50) {
            finalMessage.textContent = "Good effort! Keep learning! 📚";
        } else {
            finalMessage.textContent = "Keep practicing! You'll get there! 💪";
        }
    }
});

