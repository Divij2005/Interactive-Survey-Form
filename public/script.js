document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element References ---
  const questions = document.querySelectorAll('.question');
  const progressBar = document.getElementById('progressBar');
  const currentQuestionSpan = document.getElementById('currentQuestion');
  const totalQuestionsSpan = document.getElementById('totalQuestions');
  const scoreSpan = document.getElementById('score');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const completionScreen = document.getElementById('completionScreen');
  const finalScoreSpan = document.getElementById('finalScore');
  const navigationContainer = document.getElementById('navigation');
  const questionContainer = document.querySelector('.question-container');

  // --- State Variables ---
  let currentQuestionIndex = 0;
  let score = 0;
  const userAnswers = {}; // Stores answers: { questionIndex: { value, points } }
  const totalQuestions = questions.length;
  totalQuestionsSpan.textContent = totalQuestions;

  // --- Functions ---

  /**
   * Updates all UI elements based on the current state.
   */
  const updateUI = () => {
    // Show the current question and hide others
    questions.forEach((question, index) => {
      question.classList.toggle('active', index === currentQuestionIndex);
    });

    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;

    // Update question counter
    currentQuestionSpan.textContent = currentQuestionIndex + 1;

    // Update score display
    scoreSpan.textContent = score;

    // Update navigation buttons
    prevBtn.disabled = currentQuestionIndex === 0;
    // Disable 'Next' until an answer is selected for the current question
    nextBtn.disabled = !userAnswers[currentQuestionIndex];
    
    // Update button text on the last question
    if (currentQuestionIndex === totalQuestions - 1) {
        nextBtn.textContent = 'Finish Survey';
    } else {
        nextBtn.textContent = 'Next';
    }
  };
  
  /**
   * Recalculates the total score from the userAnswers object.
   */
  const calculateScore = () => {
      score = Object.values(userAnswers).reduce((total, answer) => total + (answer.points || 0), 0);
  };

  /**
   * Handles selection of multiple-choice or emoji options.
   * @param {HTMLElement} selectedOption - The option element that was clicked.
   */
  const handleOptionSelection = (selectedOption) => {
    const questionEl = selectedOption.closest('.question');
    const questionIndex = parseInt(questionEl.dataset.question) - 1;
    const value = selectedOption.dataset.value;
    const points = parseInt(selectedOption.dataset.points) || 0;

    userAnswers[questionIndex] = { value, points };

    // Remove 'selected' class from siblings and add to the clicked one
    const options = questionEl.querySelectorAll('.option, .emoji-option');
    options.forEach(opt => opt.classList.remove('selected'));
    selectedOption.classList.add('selected');
    
    calculateScore();
    updateUI();
  };

  /**
   * Handles input changes from a slider.
   * @param {HTMLInputElement} slider - The slider element.
   */
   const handleSliderInput = (slider) => {
       const questionEl = slider.closest('.question');
       const questionIndex = parseInt(questionEl.dataset.question) - 1;
       const value = parseInt(slider.value);
       const valueDisplay = questionEl.querySelector('.slider-value');

       valueDisplay.textContent = value;
       
       // Points are twice the slider value, for example
       const points = value * 2; 
       userAnswers[questionIndex] = { value: value.toString(), points };
       
       calculateScore();
       updateUI();
   };

  /**
   * Submits the final survey data to the backend server.
   */
  const submitSurvey = async () => {
    // Format answers for the database
    const finalAnswers = {};
    for (const key in userAnswers) {
        finalAnswers[parseInt(key) + 1] = userAnswers[key].value;
    }

    const surveyData = {
      answers: finalAnswers,
      score: score,
    };

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Submission successful:', result.message);
      showCompletionScreen();

    } catch (error) {
      console.error('Failed to submit survey:', error);
      // Create and show the error message from your screenshot
      const errorDiv = document.createElement('div');
      errorDiv.className = 'connection-error';
      errorDiv.textContent = 'Unable to connect to server. Your responses have been saved locally.';
      questionContainer.appendChild(errorDiv);
      // For this demo, we'll still show the completion screen after an error.
      // In a real app, you might save to localStorage here.
      showCompletionScreen();
    }
  };
  
  /**
   * Hides questions and shows the final completion screen.
   */
  const showCompletionScreen = () => {
    questionContainer.style.display = 'none';
    navigationContainer.style.display = 'none';
    completionScreen.style.display = 'flex';
    finalScoreSpan.textContent = score;
  };
  
  // --- Global Functions for onclick="" ---
  
  window.nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      currentQuestionIndex++;
      updateUI();
    } else {
      // If on the last question, the button submits
      submitSurvey();
    }
  };

  window.previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      updateUI();
    }
  };
  
  window.restartSurvey = () => {
      currentQuestionIndex = 0;
      score = 0;
      Object.keys(userAnswers).forEach(key => delete userAnswers[key]);
      
      // Remove any error messages
      const errorDiv = document.querySelector('.connection-error');
      if (errorDiv) errorDiv.remove();

      // Deselect all options
      document.querySelectorAll('.option, .emoji-option').forEach(opt => opt.classList.remove('selected'));
      
      completionScreen.style.display = 'none';
      questionContainer.style.display = 'block';
      navigationContainer.style.display = 'flex';
      
      updateUI();
  };


  // --- Event Listeners ---
  
  // Add listeners to all multiple choice and emoji options
  document.querySelectorAll('.option, .emoji-option').forEach(option => {
    option.addEventListener('click', () => handleOptionSelection(option));
  });

  // Add listeners to sliders
  document.querySelectorAll('.slider').forEach(slider => {
      slider.addEventListener('input', () => handleSliderInput(slider));
  });

  // --- Initial Setup ---
  updateUI();
});