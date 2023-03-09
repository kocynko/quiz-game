const quizStartButton = document.getElementById('startButton');
const quizDiv = document.getElementById('quizDiv');
const startPage = document.getElementById('startPage');
const levelPage = document.getElementById('levelPage');
const resetButton = document.getElementById('resetButton');
const levelButtons = document.getElementsByClassName('levelButton');
const quizQuestion = document.getElementById('quizQuestion');
const backFromQuizButton = document.getElementById('backFromQuizButton');
const quizTask = document.getElementById('quizTask');
const quizAnswers = document.getElementById('quizAnswers');
const quizFinalAnswers = document.getElementById('quizFinalAnswers');
const submitTask = document.getElementById('submitTask');
const smallParagraph = document.getElementById('smallParagraph');
const smallHeader = document.getElementById('smallHeader');
const okayButton = document.getElementById('okayButton');
const showPoints = document.getElementById('points');
const numOfAnswerered = document.getElementById('numOfAnswered');
const instructionButtons = document.getElementsByClassName('instructionButton');
const smallAnswer = document.getElementById('smallAnswer');

let correctOrder = [];
let currentLevel;
let resultPoints = 0;
let usedTasks = [];
let started = false;

let quizState = {
  points: 0,
  questions: 10,
  answeredQuestions: 0,
};

for (let i = 0; i < instructionButtons.length; i++) {
  instructionButtons[i].addEventListener('click', () => {
    smallHeader.innerHTML = 'Instructions';
    smallParagraph.innerHTML =
      'Welcome to quiz game. You goal is to answer 10 questions by sorting or choosing the correct answer by draging them into blue square also in correct order. You can choose what level of question u want, the harder level, more points you get.';
    smallAnswer.innerHTML = '';
    toggleModal('small-modal', true);
  });
}

const checkLocalStorage = () => {
  if (localStorage.getItem('points') != null)
    quizState.points = parseInt(localStorage.getItem('points'));
  else {
    quizState.points = 0;
    localStorage.setItem('points', 0);
  }

  if (localStorage.getItem('answeredQuestions') != null) {
    quizState.answeredQuestions = parseInt(
      localStorage.getItem('answeredQuestions')
    );
  } else {
    quizState.answeredQuestions = 0;
    localStorage.setItem('answeredQuestions', 0);
  }

  if (
    parseInt(localStorage.getItem('answeredQuestions')) != 0 ||
    localStorage.getItem('started') == 'true'
  )
    quizStartButton.innerHTML = 'Continue';
};

checkLocalStorage();

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

const changeState = () => {
  numOfAnswerered.innerHTML = `${quizState.answeredQuestions} / ${quizState.questions}`;
  showPoints.innerHTML = `${quizState.points} points`;
};
const resetQuizState = () => {
  quizState.points = 0;
  quizState.answeredQuestions = 0;
  usedTasks = [];
  localStorage.setItem('usedTasks', JSON.stringify(usedTasks));
  localStorage.setItem('points', 0);
  localStorage.setItem('answeredQuestions', 0);
  localStorage.setItem('started', false);
  quizStartButton.innerHTML = 'Start';
  changeState();
};

const setPoints = (points) => {
  quizState.points += points;
  if (quizState.points <= 0) quizState.points = 0;
  localStorage.setItem('points', quizState.points);
};

const setQuestions = (number) => {
  quizState.answeredQuestions += number;
};

const toStartPage = () => {
  levelPage.classList.add('hidden');
  startPage.classList.remove('hidden');
  smallHeader.innerHTML = 'Restart';
  smallParagraph.innerHTML = `Game has been reseted`;
  smallAnswer.innerHTML = '';
  resetQuizState();
};

const randomTask = (taskList) => {
  return taskList[Math.floor(Math.random() * taskList.length)];
};

const arrayEquals = (a, b) => {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
};

const findInArray = (a, b) => {
  for (let i = 0; i < b.length; i++) {
    if (arrayEquals(a, b[i])) return true;
  }
  return false;
};

const changeToLevelPage = () => {
  quizDiv.classList.add('hidden');
  levelPage.classList.remove('hidden');
  quizQuestion.innerHTML = '';
  quizAnswers.innerHTML = '';
  quizFinalAnswers.innerHTML = '';
};

quizStartButton.addEventListener('click', () => {
  started = true;
  levelPage.classList.remove('hidden');
  startPage.classList.add('hidden');
  localStorage.setItem('started', true);
});
okayButton.addEventListener('click', () => {
  if (quizState.answeredQuestions == quizState.questions) {
    changeToLevelPage();
    resetQuizState();
    toStartPage();
  } else {
    changeToLevelPage();
    changeState();
  }
});

new Sortable.create(quizFinalAnswers, {
  animation: 150,
  group: 'quiz',
});

new Sortable.create(quizAnswers, {
  animation: 150,
  group: 'quiz',
  dataIdAttr: 'id',
});

resetButton.addEventListener('click', () => {
  toStartPage();
});

backFromQuizButton.addEventListener('click', () => {
  setPoints(-(resultPoints / 2));
  if (quizState.answeredQuestions == quizState.questions) {
    checkResult(false, resultPoints);
    toggleModal('small-modal', true);
  } else {
    setPoints(-(resultPoints / 2));
    smallHeader.innerHTML = 'You skipped the question';
    smallParagraph.innerHTML = `You lost ${resultPoints} points.`;
    smallAnswer.innerHTML = '';
    toggleModal('small-modal', true);
    changeToLevelPage();
  }
});

for (let i = 0; i < levelButtons.length; i++) {
  levelButtons[i].addEventListener('click', (e) => {
    currentLevel = e.target.id;
    resultPoints = 10 * e.target.id;
    setQuestions(1);
    changeState();
    showQuizQuestion(currentLevel);
  });
}

const showQuizQuestion = (level) => {
  fetch('./QuizData.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('not found');
      }
      return response.json();
    })
    .then((data) => {
      filteredTasks = data.questions.filter((task) => {
        return (
          !usedTasks.find((filter) => {
            return filter.id === task.id;
          }) && task.level == level
        );
      });

      if (filteredTasks.length == 0) {
        alert('please choose different question');
      }

      let myTask = randomTask(filteredTasks);

      usedTasks.push(myTask);
      localStorage.setItem('usedTasks', JSON.stringify(usedTasks));

      let question = myTask.question;
      // question
      let questionElement = document.createElement('h3');
      questionElement.innerHTML = question;
      questionElement.classList.add('text-3xl', 'black', 'text-center');
      quizQuestion.appendChild(questionElement);

      // answers
      shuffleArray(myTask.answers);
      myTask.answers.forEach((taskAnswer) => {
        //console.log(taskAnswer)
        let answer = document.createElement('div');
        answer.id = taskAnswer;
        answer.classList.add(
          'bg-mywhite',
          'cursor-move',
          'flex',
          'items-center',
          'justify-evenly',
          'py-3',
          'px-10',
          'rounded',
          'text-myblack',
          'shadow-lg',
          'shadow-myblack'
        );
        p = document.createElement('p');
        p.innerHTML = taskAnswer;
        answer.appendChild(p);
        quizAnswers.appendChild(answer);
      });

      // order
      correctOrder = myTask.correctOrder;
      myAnswer = correctOrder[0];

      // changing screens
      quizDiv.classList.remove('hidden');
      levelPage.classList.add('hidden');
    });
};

submitTask.addEventListener('click', () => {
  let myOrder = [];
  quizFinalAnswers.childNodes.forEach((element) => {
    myOrder.push(element.id);
  });
  localStorage.setItem('answeredQuestions', quizState.answeredQuestions);
  let result = findInArray(myOrder, correctOrder);
  checkResult(result, resultPoints);
});

const checkResult = (result, resultPoints) => {
  if (result && quizState.answeredQuestions >= quizState.questions) {
    setPoints(resultPoints);
    smallHeader.innerHTML = 'You have finished the game.';
    smallParagraph.innerHTML = `Great your last answer was correct !. You get ${resultPoints}. Your total points now are ${quizState.points}. The game will be restarted.`;
  } else if (!result && quizState.answeredQuestions >= quizState.questions) {
    setPoints(-resultPoints);
    smallHeader.innerHTML = 'You have finished the game';
    smallParagraph.innerHTML = `Oh crap, your last answer was not correct !. You lost ${resultPoints}. Your total points now are ${quizState.points}. The game will be restarted.`;
    smallAnswer.innerHTML = `<strong>Correct answer:</strong> ${myAnswer.toString()}`;
  } else if (result) {
    setPoints(resultPoints);
    smallHeader.innerHTML = 'Success';
    smallParagraph.innerHTML = `Great ! You answered correctly you get ${resultPoints}. Your total points now are ${quizState.points}.`;
  } else {
    setPoints(-resultPoints);
    smallHeader.innerHTML = 'Bad answer';
    smallParagraph.innerHTML = `Oh, crap ! Your answer is not correct. You lost ${resultPoints} points. Your total points now are ${quizState.points}.`;
    smallAnswer.innerHTML = `<strong>Correct answer:</strong> ${myAnswer.toString()}`;
  }
};
