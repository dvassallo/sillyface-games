// Middle School Survival - Game Logic

// Game State
const game = {
    day: 1,
    maxDays: 100,
    detentions: 0,
    maxDetentions: 5,
    score: 0,
    currentClassIndex: 0,
    currentQuestion: 0,
    busTime: 'morning', // 'morning' or 'afternoon'
    schedule: []
};

// Daily Schedule (order of classes)
const dailySchedule = [
    { name: 'Language Arts', icon: '📚', type: 'class' },
    { name: 'History', icon: '🏛️', type: 'class' },
    { name: 'Science', icon: '🔬', type: 'class' },
    { name: 'Lunch', icon: '🍕', type: 'lunch' },
    { name: 'Recess', icon: '⚽', type: 'recess' },
    { name: 'Math', icon: '🔢', type: 'class' },
    { name: 'Library', icon: '📖', type: 'class' },
    { name: 'Coding', icon: '💻', type: 'class' },
    { name: 'PE', icon: '🏃', type: 'class' }
];

// Questions Database
const questions = {
    'Language Arts': [
        { q: "What is a noun?", answers: ["A person, place, or thing", "An action word", "A describing word", "A connecting word"], correct: 0 },
        { q: "What is the past tense of 'run'?", answers: ["Runned", "Ran", "Running", "Runs"], correct: 1 },
        { q: "Which is a synonym for 'happy'?", answers: ["Sad", "Angry", "Joyful", "Tired"], correct: 2 },
        { q: "What punctuation ends a question?", answers: ["Period", "Exclamation mark", "Comma", "Question mark"], correct: 3 },
        { q: "What is an adjective?", answers: ["An action word", "A describing word", "A naming word", "A joining word"], correct: 1 },
        { q: "What is the plural of 'mouse'?", answers: ["Mouses", "Mice", "Mouse", "Mousies"], correct: 1 },
        { q: "Which word is a verb?", answers: ["Beautiful", "Quickly", "Jump", "Happiness"], correct: 2 },
        { q: "What is an antonym of 'hot'?", answers: ["Warm", "Cold", "Burning", "Spicy"], correct: 1 },
        { q: "What type of sentence is 'Wow!'?", answers: ["Question", "Statement", "Command", "Exclamation"], correct: 3 },
        { q: "Which is correct?", answers: ["Their going home", "They're going home", "There going home", "Theyre going home"], correct: 1 },
        { q: "What is a pronoun?", answers: ["A word that replaces a noun", "A type of verb", "A punctuation mark", "A type of sentence"], correct: 0 },
        { q: "Which word is spelled correctly?", answers: ["Recieve", "Receive", "Receve", "Receeve"], correct: 1 },
        { q: "What is alliteration?", answers: ["Rhyming words", "Repeated sounds at the start", "A type of poem", "Opposite meanings"], correct: 1 },
        { q: "What is a simile?", answers: ["A type of verb", "Comparison using like or as", "A rhyming pattern", "A sentence type"], correct: 1 },
        { q: "Which is a compound word?", answers: ["Running", "Butterfly", "Beautiful", "Quickly"], correct: 1 }
    ],
    'History': [
        { q: "Who was the first U.S. President?", answers: ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "John Adams"], correct: 1 },
        { q: "What year did WWII end?", answers: ["1942", "1944", "1945", "1950"], correct: 2 },
        { q: "Which ancient civilization built pyramids?", answers: ["Romans", "Greeks", "Egyptians", "Vikings"], correct: 2 },
        { q: "What is the Declaration of Independence?", answers: ["A peace treaty", "Document declaring freedom from Britain", "The Constitution", "A letter to France"], correct: 1 },
        { q: "Who discovered America in 1492?", answers: ["Magellan", "Columbus", "Vespucci", "Cortez"], correct: 1 },
        { q: "What was the Cold War?", answers: ["A war in winter", "Tension between USA and USSR", "A war in Antarctica", "A video game"], correct: 1 },
        { q: "Who was Martin Luther King Jr.?", answers: ["A president", "A civil rights leader", "An inventor", "A general"], correct: 1 },
        { q: "What empire built the Colosseum?", answers: ["Greek", "Roman", "Egyptian", "Persian"], correct: 1 },
        { q: "What was the Renaissance?", answers: ["A war", "A cultural rebirth", "A disease", "A country"], correct: 1 },
        { q: "Who wrote the Constitution?", answers: ["The Founding Fathers", "Abraham Lincoln", "The British", "Native Americans"], correct: 0 },
        { q: "What was the Boston Tea Party?", answers: ["A fancy party", "A protest against taxes", "A celebration", "A ship race"], correct: 1 },
        { q: "Who was Cleopatra?", answers: ["A Greek goddess", "An Egyptian queen", "A Roman emperor", "A warrior"], correct: 1 },
        { q: "What started WWI?", answers: ["Pearl Harbor", "Assassination of Archduke", "Boston Tea Party", "Cold War"], correct: 1 },
        { q: "What is democracy?", answers: ["Rule by one person", "Rule by the people", "Rule by military", "No government"], correct: 1 },
        { q: "Who was Abraham Lincoln?", answers: ["First president", "16th president", "Last president", "British king"], correct: 1 }
    ],
    'Science': [
        { q: "What planet is closest to the Sun?", answers: ["Venus", "Earth", "Mercury", "Mars"], correct: 2 },
        { q: "What gas do plants breathe in?", answers: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], correct: 1 },
        { q: "What is H2O?", answers: ["Salt", "Sugar", "Water", "Air"], correct: 2 },
        { q: "How many planets are in our solar system?", answers: ["7", "8", "9", "10"], correct: 1 },
        { q: "What is the largest organ in the human body?", answers: ["Heart", "Brain", "Skin", "Liver"], correct: 2 },
        { q: "What do we call animals that eat plants?", answers: ["Carnivores", "Herbivores", "Omnivores", "Insectivores"], correct: 1 },
        { q: "What force pulls objects toward Earth?", answers: ["Magnetism", "Friction", "Gravity", "Electricity"], correct: 2 },
        { q: "What is the center of an atom called?", answers: ["Electron", "Proton", "Nucleus", "Neutron"], correct: 2 },
        { q: "What is photosynthesis?", answers: ["How animals breathe", "How plants make food", "How rocks form", "How water cycles"], correct: 1 },
        { q: "What type of rock is formed by volcanoes?", answers: ["Sedimentary", "Metamorphic", "Igneous", "Limestone"], correct: 2 },
        { q: "What is the boiling point of water?", answers: ["50°C", "100°C", "0°C", "200°C"], correct: 1 },
        { q: "What do caterpillars turn into?", answers: ["Moths or butterflies", "Beetles", "Flies", "Bees"], correct: 0 },
        { q: "What is the hardest natural substance?", answers: ["Gold", "Iron", "Diamond", "Platinum"], correct: 2 },
        { q: "What causes seasons on Earth?", answers: ["Distance from Sun", "Earth's tilt", "The moon", "Clouds"], correct: 1 },
        { q: "How many bones are in the human body?", answers: ["106", "206", "306", "156"], correct: 1 }
    ],
    'Math': [
        { q: "What is 7 × 8?", answers: ["54", "56", "58", "48"], correct: 1 },
        { q: "What is 144 ÷ 12?", answers: ["10", "11", "12", "14"], correct: 2 },
        { q: "What is the square root of 81?", answers: ["7", "8", "9", "10"], correct: 2 },
        { q: "What is 25% of 100?", answers: ["20", "25", "30", "50"], correct: 1 },
        { q: "What is the area of a square with side 5?", answers: ["10", "20", "25", "15"], correct: 2 },
        { q: "What is 3² + 4²?", answers: ["25", "24", "12", "7"], correct: 0 },
        { q: "What is 1/2 + 1/4?", answers: ["2/6", "3/4", "1/6", "2/4"], correct: 1 },
        { q: "How many degrees in a right angle?", answers: ["45", "90", "180", "360"], correct: 1 },
        { q: "What is the perimeter of a 3x4 rectangle?", answers: ["12", "14", "7", "24"], correct: 1 },
        { q: "What is 15 × 15?", answers: ["215", "225", "235", "200"], correct: 1 },
        { q: "What is -5 + 12?", answers: ["7", "-7", "17", "-17"], correct: 0 },
        { q: "What is 2/3 of 90?", answers: ["30", "45", "60", "75"], correct: 2 },
        { q: "How many sides does a hexagon have?", answers: ["5", "6", "7", "8"], correct: 1 },
        { q: "What is 10³?", answers: ["30", "100", "1000", "10000"], correct: 2 },
        { q: "What is the median of 2, 5, 7, 9, 12?", answers: ["5", "7", "9", "6"], correct: 1 }
    ],
    'Library': [
        { q: "What do you call the person who writes a book?", answers: ["Editor", "Author", "Publisher", "Librarian"], correct: 1 },
        { q: "What is fiction?", answers: ["True stories", "Made-up stories", "News articles", "Textbooks"], correct: 1 },
        { q: "What is the Dewey Decimal System?", answers: ["A math formula", "A way to organize books", "A type of book", "A reading technique"], correct: 1 },
        { q: "What is a bibliography?", answers: ["The author's life story", "A list of sources", "The first page", "A summary"], correct: 1 },
        { q: "What is a genre?", answers: ["A book's price", "A category of books", "A page number", "An author's name"], correct: 1 },
        { q: "What is non-fiction?", answers: ["Fairy tales", "True information", "Poetry", "Comics"], correct: 1 },
        { q: "What is a novel?", answers: ["A short poem", "A long fictional story", "A newspaper", "A magazine"], correct: 1 },
        { q: "What does ISBN stand for?", answers: ["International Standard Book Number", "Internal Story Book Name", "Internet Sold Book Network", "Illustrated Story Book Note"], correct: 0 },
        { q: "What is an index in a book?", answers: ["The first page", "The title", "Alphabetical list of topics", "The cover"], correct: 2 },
        { q: "What is a biography?", answers: ["A made-up story", "A person's life story", "A science book", "A dictionary"], correct: 1 },
        { q: "What is the spine of a book?", answers: ["The cover", "The pages", "The edge with title", "The back page"], correct: 2 },
        { q: "What is a glossary?", answers: ["A chapter", "A list of word definitions", "An index", "A dedication"], correct: 1 },
        { q: "Who is Dr. Seuss?", answers: ["A scientist", "A children's book author", "A librarian", "A publisher"], correct: 1 },
        { q: "What is a series?", answers: ["One book", "Connected books", "A magazine", "A dictionary"], correct: 1 },
        { q: "What is a table of contents?", answers: ["A furniture list", "List of chapters and pages", "A recipe", "An index"], correct: 1 }
    ],
    'Coding': [
        { q: "What is a variable in coding?", answers: ["A type of computer", "A container for storing data", "A keyboard key", "A screen"], correct: 1 },
        { q: "What does HTML stand for?", answers: ["Hot Text Making Language", "HyperText Markup Language", "High Tech Modern Language", "Helpful Text Main Language"], correct: 1 },
        { q: "What is a loop in programming?", answers: ["A mistake", "Code that repeats", "A type of file", "A website"], correct: 1 },
        { q: "What does 'bug' mean in coding?", answers: ["An insect", "A feature", "An error in code", "A program"], correct: 2 },
        { q: "What is an algorithm?", answers: ["A computer brand", "Step-by-step instructions", "A type of code", "A website"], correct: 1 },
        { q: "What is debugging?", answers: ["Adding bugs", "Finding and fixing errors", "Creating programs", "Deleting files"], correct: 1 },
        { q: "What is binary code?", answers: ["Code with letters", "Code with 0s and 1s", "Secret code", "Random code"], correct: 1 },
        { q: "What is a function?", answers: ["A number", "Reusable block of code", "A computer type", "A website"], correct: 1 },
        { q: "What is JavaScript used for?", answers: ["Making coffee", "Web interactivity", "Printing", "Drawing"], correct: 1 },
        { q: "What is an 'if statement'?", answers: ["A question", "A conditional check", "A loop", "A variable"], correct: 1 },
        { q: "What is Scratch?", answers: ["A wound", "A visual programming language", "A video game", "A website"], correct: 1 },
        { q: "What does CPU stand for?", answers: ["Computer Personal Unit", "Central Processing Unit", "Code Program Unit", "Central Program User"], correct: 1 },
        { q: "What is Python?", answers: ["A snake only", "A programming language", "A computer brand", "A game"], correct: 1 },
        { q: "What is an array?", answers: ["A single value", "A list of values", "A function", "An error"], correct: 1 },
        { q: "What is the output of: print('Hello')?", answers: ["Nothing", "Error", "Hello", "Print"], correct: 2 }
    ],
    'PE': [
        { q: "How many players on a basketball team on court?", answers: ["4", "5", "6", "7"], correct: 1 },
        { q: "What sport uses a shuttlecock?", answers: ["Tennis", "Badminton", "Volleyball", "Squash"], correct: 1 },
        { q: "How long is a marathon?", answers: ["10 miles", "20 miles", "26.2 miles", "30 miles"], correct: 2 },
        { q: "What is cardio exercise?", answers: ["Lifting weights", "Exercise that raises heart rate", "Stretching only", "Sleeping"], correct: 1 },
        { q: "How many points for a touchdown in football?", answers: ["3", "5", "6", "7"], correct: 2 },
        { q: "What muscle does a push-up work?", answers: ["Legs", "Chest", "Back only", "Feet"], correct: 1 },
        { q: "How many innings in a baseball game?", answers: ["7", "8", "9", "10"], correct: 2 },
        { q: "What is a warm-up for?", answers: ["To get hot", "To prepare body for exercise", "To cool down", "To rest"], correct: 1 },
        { q: "What sport is played at Wimbledon?", answers: ["Golf", "Tennis", "Cricket", "Soccer"], correct: 1 },
        { q: "How many laps in an Olympic swimming pool equals 1 mile?", answers: ["16", "32", "64", "70"], correct: 2 },
        { q: "What does stretching help with?", answers: ["Building muscle", "Flexibility", "Losing weight", "Running faster"], correct: 1 },
        { q: "What is the goal in soccer called?", answers: ["Touchdown", "Goal", "Point", "Score"], correct: 1 },
        { q: "What is hydration?", answers: ["Eating food", "Drinking water", "Sleeping", "Exercise"], correct: 1 },
        { q: "How many players on a volleyball team on court?", answers: ["5", "6", "7", "8"], correct: 1 },
        { q: "What is good sportsmanship?", answers: ["Cheating", "Being fair and respectful", "Winning always", "Being mean"], correct: 1 }
    ]
};

// Food emojis for lunch game
const foods = ['🍕', '🍔', '🌭', '🍟', '🍿', '🥤', '🍪', '🍩', '🧁', '🍎', '🍌', '🥪', '🌮', '🍗', '🥗'];

// Ball emojis for recess dodge game
const balls = ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐'];

// DOM Elements
const screens = {
    mainMenu: document.getElementById('main-menu'),
    bus: document.getElementById('bus-screen'),
    schedule: document.getElementById('schedule-screen'),
    class: document.getElementById('class-screen'),
    lunch: document.getElementById('lunch-screen'),
    recess: document.getElementById('recess-screen'),
    gameover: document.getElementById('gameover-screen'),
    win: document.getElementById('win-screen')
};

// Initialize game
function init() {
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('bus-continue').addEventListener('click', continueBus);
    document.getElementById('start-day-btn').addEventListener('click', startClasses);
    document.getElementById('restart-btn').addEventListener('click', resetGame);
    document.getElementById('play-again-btn').addEventListener('click', resetGame);
    document.getElementById('lunch-done').addEventListener('click', nextClass);
    document.getElementById('lunch-skip').addEventListener('click', skipLunch);
    document.getElementById('recess-done').addEventListener('click', nextClass);
}

// Show a specific screen
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// Start the game
function startGame() {
    game.day = 1;
    game.detentions = 0;
    game.score = 0;
    game.busTime = 'morning';
    showBusScreen();
}

// Reset game
function resetGame() {
    game.day = 1;
    game.detentions = 0;
    game.score = 0;
    game.busTime = 'morning';
    game.currentClassIndex = 0;
    game.currentQuestion = 0;
    showScreen('mainMenu');
}

// Show bus screen
function showBusScreen() {
    showScreen('bus');
    document.getElementById('day-number').textContent = game.day;
    
    const busMsg = document.getElementById('bus-message');
    if (game.busTime === 'morning') {
        busMsg.textContent = '🚌 Good morning! Riding to school...';
    } else {
        busMsg.textContent = '🚌 School\'s out! Riding home...';
    }
}

// Continue from bus
function continueBus() {
    if (game.busTime === 'morning') {
        // Show schedule for the day
        showScheduleScreen();
    } else {
        // End of day - go to next day
        game.day++;
        if (game.day > game.maxDays) {
            // WIN!
            showWinScreen();
        } else {
            game.busTime = 'morning';
            showBusScreen();
        }
    }
}

// Show schedule screen
function showScheduleScreen() {
    showScreen('schedule');
    game.currentClassIndex = 0;
    game.schedule = [...dailySchedule];
    
    document.getElementById('sched-day').textContent = game.day;
    document.getElementById('sched-detentions').textContent = game.detentions;
    document.getElementById('sched-score').textContent = game.score;
    
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = '';
    
    game.schedule.forEach((cls, index) => {
        const item = document.createElement('div');
        item.className = 'class-item';
        item.id = `class-${index}`;
        item.innerHTML = `
            <span class="class-icon">${cls.icon}</span>
            <span>${cls.name}</span>
        `;
        scheduleList.appendChild(item);
    });
}

// Start classes
function startClasses() {
    game.currentClassIndex = 0;
    startCurrentClass();
}

// Start the current class
function startCurrentClass() {
    const currentClass = game.schedule[game.currentClassIndex];
    
    // Update schedule display
    document.querySelectorAll('.class-item').forEach((item, index) => {
        item.classList.remove('current');
        if (index < game.currentClassIndex) {
            item.classList.add('completed');
        } else if (index === game.currentClassIndex) {
            item.classList.add('current');
        }
    });
    
    if (currentClass.type === 'lunch') {
        startLunch();
    } else if (currentClass.type === 'recess') {
        startRecess();
    } else {
        startClassQuestions(currentClass.name);
    }
}

// Start class questions
function startClassQuestions(className) {
    showScreen('class');
    game.currentQuestion = 0;
    
    document.getElementById('class-name').textContent = `${getClassIcon(className)} ${className}`;
    
    loadQuestion(className);
}

function getClassIcon(className) {
    const cls = dailySchedule.find(c => c.name === className);
    return cls ? cls.icon : '📚';
}

// Load a question
function loadQuestion(className) {
    const classQuestions = questions[className];
    if (!classQuestions) {
        nextClass();
        return;
    }
    
    // Get random questions for this class session
    const shuffled = [...classQuestions].sort(() => Math.random() - 0.5);
    const questionData = shuffled[game.currentQuestion % shuffled.length];
    
    document.getElementById('q-num').textContent = game.currentQuestion + 1;
    document.getElementById('q-progress').style.width = `${(game.currentQuestion / 5) * 100}%`;
    document.getElementById('question-text').textContent = questionData.q;
    
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';
    
    const feedback = document.getElementById('feedback');
    feedback.className = 'feedback';
    feedback.textContent = '';
    
    questionData.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.addEventListener('click', () => checkAnswer(index, questionData.correct, className, btn));
        answersDiv.appendChild(btn);
    });
}

// Check answer
function checkAnswer(selected, correct, className, btn) {
    const feedback = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.answer-btn');
    
    buttons.forEach((b, i) => {
        b.disabled = true;
        if (i === correct) {
            b.classList.add('correct');
        } else if (i === selected && i !== correct) {
            b.classList.add('wrong');
        }
    });
    
    if (selected === correct) {
        feedback.textContent = '✅ Correct! +10 points!';
        feedback.className = 'feedback show correct';
        game.score += 10;
    } else {
        feedback.textContent = '❌ Wrong! +1 detention!';
        feedback.className = 'feedback show wrong';
        game.detentions++;
        
        if (game.detentions >= game.maxDetentions) {
            setTimeout(() => showGameOver(), 1500);
            return;
        }
    }
    
    // Update stats display
    document.getElementById('sched-detentions').textContent = game.detentions;
    document.getElementById('sched-score').textContent = game.score;
    
    game.currentQuestion++;
    
    if (game.currentQuestion >= 5) {
        setTimeout(() => nextClass(), 1500);
    } else {
        setTimeout(() => loadQuestion(className), 1500);
    }
}

// Lunch game state
let lunchTimer = null;
let lunchSpawnInterval = null;

// Start lunch mini-game
function startLunch() {
    showScreen('lunch');
    
    const lunchArea = document.getElementById('lunch-area');
    lunchArea.innerHTML = '';
    
    let foodCount = 0;
    let timeLeft = 15;
    
    document.getElementById('food-count').textContent = foodCount;
    document.getElementById('lunch-timer').textContent = timeLeft;
    document.getElementById('lunch-done').style.display = 'none';
    document.getElementById('lunch-skip').style.display = 'block';
    
    // Spawn food
    function spawnFood() {
        const food = document.createElement('div');
        food.className = 'food-item';
        food.textContent = foods[Math.floor(Math.random() * foods.length)];
        food.style.left = Math.random() * (lunchArea.offsetWidth - 50) + 'px';
        food.style.top = Math.random() * (lunchArea.offsetHeight - 50) + 'px';
        
        food.addEventListener('click', () => {
            if (!food.classList.contains('eaten')) {
                food.classList.add('eaten');
                foodCount++;
                game.score += 2;
                document.getElementById('food-count').textContent = foodCount;
                document.getElementById('sched-score').textContent = game.score;
                setTimeout(() => food.remove(), 300);
            }
        });
        
        lunchArea.appendChild(food);
    }
    
    // Spawn initial food
    for (let i = 0; i < 5; i++) {
        spawnFood();
    }
    
    // Keep spawning
    lunchSpawnInterval = setInterval(() => {
        if (lunchArea.children.length < 8) {
            spawnFood();
        }
    }, 800);
    
    // Timer
    lunchTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('lunch-timer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endLunch();
        }
    }, 1000);
}

// End lunch and cleanup
function endLunch() {
    if (lunchTimer) clearInterval(lunchTimer);
    if (lunchSpawnInterval) clearInterval(lunchSpawnInterval);
    lunchTimer = null;
    lunchSpawnInterval = null;
    
    document.getElementById('lunch-done').style.display = 'block';
    document.getElementById('lunch-skip').style.display = 'none';
    document.getElementById('lunch-area').innerHTML = '<p style="font-size: 2rem; text-align: center; padding-top: 120px;">🍽️ Lunch is over!</p>';
}

// Skip lunch
function skipLunch() {
    endLunch();
    nextClass();
}

// Start recess mini-game
function startRecess() {
    showScreen('recess');
    
    const recessArea = document.getElementById('recess-area');
    const player = document.getElementById('player');
    let playerX = 50; // percentage
    player.style.left = playerX + '%';
    
    let dodgeCount = 0;
    let timeLeft = 20;
    let hit = false;
    
    document.getElementById('dodge-count').textContent = dodgeCount;
    document.getElementById('recess-timer').textContent = timeLeft;
    document.getElementById('recess-done').style.display = 'none';
    
    // Remove old balls
    document.querySelectorAll('.ball').forEach(b => b.remove());
    
    // Player movement
    function movePlayer(direction) {
        if (direction === 'left' && playerX > 10) {
            playerX -= 10;
        } else if (direction === 'right' && playerX < 90) {
            playerX += 10;
        }
        player.style.left = playerX + '%';
    }
    
    // Keyboard controls
    function keyHandler(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            movePlayer('left');
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            movePlayer('right');
        }
    }
    document.addEventListener('keydown', keyHandler);
    
    // Touch/click controls
    function clickHandler(e) {
        const rect = recessArea.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX < rect.width / 2) {
            movePlayer('left');
        } else {
            movePlayer('right');
        }
    }
    recessArea.addEventListener('click', clickHandler);
    
    // Spawn balls
    function spawnBall() {
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.textContent = balls[Math.floor(Math.random() * balls.length)];
        const ballX = Math.random() * 80 + 10;
        ball.style.left = ballX + '%';
        ball.style.animationDuration = (1.5 + Math.random()) + 's';
        
        recessArea.appendChild(ball);
        
        // Check collision
        const checkCollision = setInterval(() => {
            const ballRect = ball.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            
            if (ballRect.top + ballRect.height >= playerRect.top &&
                ballRect.left < playerRect.right &&
                ballRect.right > playerRect.left &&
                ballRect.top < playerRect.bottom) {
                // Hit!
                if (!hit) {
                    hit = true;
                    game.detentions++;
                    player.textContent = '😵';
                    document.getElementById('sched-detentions').textContent = game.detentions;
                    
                    if (game.detentions >= game.maxDetentions) {
                        clearInterval(spawnInterval);
                        clearInterval(timer);
                        document.removeEventListener('keydown', keyHandler);
                        recessArea.removeEventListener('click', clickHandler);
                        setTimeout(() => showGameOver(), 1000);
                        return;
                    }
                    
                    setTimeout(() => {
                        hit = false;
                        player.textContent = '🧍';
                    }, 1000);
                }
                clearInterval(checkCollision);
            }
            
            if (ball.getBoundingClientRect().top > recessArea.getBoundingClientRect().bottom) {
                dodgeCount++;
                game.score += 1;
                document.getElementById('dodge-count').textContent = dodgeCount;
                document.getElementById('sched-score').textContent = game.score;
                clearInterval(checkCollision);
                ball.remove();
            }
        }, 50);
        
        setTimeout(() => ball.remove(), 3000);
    }
    
    // Spawn balls periodically
    const spawnInterval = setInterval(spawnBall, 800);
    spawnBall();
    
    // Timer
    const timer = setInterval(() => {
        timeLeft--;
        document.getElementById('recess-timer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            clearInterval(spawnInterval);
            document.removeEventListener('keydown', keyHandler);
            recessArea.removeEventListener('click', clickHandler);
            document.getElementById('recess-done').style.display = 'block';
            document.querySelectorAll('.ball').forEach(b => b.remove());
        }
    }, 1000);
}

// Move to next class
function nextClass() {
    game.currentClassIndex++;
    
    if (game.currentClassIndex >= game.schedule.length) {
        // Day is over - time for bus home
        game.busTime = 'afternoon';
        showBusScreen();
    } else {
        startCurrentClass();
    }
}

// Show game over screen
function showGameOver() {
    showScreen('gameover');
    document.getElementById('final-days').textContent = game.day;
    document.getElementById('final-score').textContent = game.score;
}

// Show win screen
function showWinScreen() {
    showScreen('win');
    document.getElementById('win-score').textContent = game.score;
}

// Start the game when page loads
init();

