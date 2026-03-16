import React, { useEffect, useMemo, useRef, useState } from 'react';
import allQuestions from './questions.json';

const SOCIALS = {
  instagram: 'https://www.instagram.com/aswinvktl/',
  github: 'https://github.com/aswinvktl',
};

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidQuestion(question) {
  if (!question || typeof question !== 'object') return false;

  const text = cleanText(question.text);
  const options = Array.isArray(question.options) ? question.options.map(cleanText) : [];
  const answer = question.answer;

  return (
    text.length > 0 &&
    options.length === 4 &&
    options.every((option) => option.length > 0) &&
    Number.isInteger(answer) &&
    answer >= 0 &&
    answer <= 3
  );
}

function inferTopic(question) {
  const haystack = `${question.text} ${question.options.join(' ')}`.toLowerCase();

  if (
    haystack.includes('bearing') ||
    haystack.includes('crankpin') ||
    haystack.includes('gudgeon pin') ||
    haystack.includes('gudgeonpin') ||
    haystack.includes('crankshaft') ||
    haystack.includes('connecting rod') ||
    haystack.includes('crosshead') ||
    haystack.includes('tie rod') ||
    haystack.includes('thrust bearing')
  ) {
    return 'Bearings, Shafting & Structure';
  }

  if (
    haystack.includes('lubric') ||
    haystack.includes('lube oil') ||
    haystack.includes('oil control ring') ||
    haystack.includes('scraper') ||
    haystack.includes('purification') ||
    haystack.includes('filtration')
  ) {
    return 'Lubrication';
  }

  if (
    haystack.includes('fuel injection') ||
    haystack.includes('injector') ||
    haystack.includes('injection pump') ||
    haystack.includes('jerk pump') ||
    haystack.includes('plunger') ||
    haystack.includes('helix') ||
    haystack.includes('delivery valve') ||
    haystack.includes('spray valve') ||
    haystack.includes('metering')
  ) {
    return 'Fuel Injection';
  }

  if (
    haystack.includes('piston') ||
    haystack.includes('ring') ||
    haystack.includes('liner') ||
    haystack.includes('cylinder wall') ||
    haystack.includes('compression ring') ||
    haystack.includes('oil scraper ring') ||
    haystack.includes('crown') ||
    haystack.includes('skirt')
  ) {
    return 'Pistons, Rings & Liners';
  }

  if (
    haystack.includes('camshaft') ||
    haystack.includes('cam ') ||
    haystack.includes('valve') ||
    haystack.includes('tappet') ||
    haystack.includes('rocker arm') ||
    haystack.includes('exhaust valve') ||
    haystack.includes('timing gear')
  ) {
    return 'Valve Gear & Timing';
  }

  if (
    haystack.includes('combustion') ||
    haystack.includes('ignition') ||
    haystack.includes('fuel/air') ||
    haystack.includes('fuel air') ||
    haystack.includes('turbulence') ||
    haystack.includes('scavenge') ||
    haystack.includes('scavenging') ||
    haystack.includes('turbocharger') ||
    haystack.includes('intake') ||
    haystack.includes('exhaust')
  ) {
    return 'Combustion, Air & Exhaust';
  }

  if (
    haystack.includes('cooling') ||
    haystack.includes('cavitation') ||
    haystack.includes('pyrometer') ||
    haystack.includes('temperature') ||
    haystack.includes('heat dam')
  ) {
    return 'Cooling & Thermal';
  }

  if (
    haystack.includes('relief valve') ||
    haystack.includes('crankcase') ||
    haystack.includes('bursting disc') ||
    haystack.includes('safety cover') ||
    haystack.includes('overspeed') ||
    haystack.includes('spark arrestor') ||
    haystack.includes('fire extinguishing')
  ) {
    return 'Safety & Protection';
  }

  if (
    haystack.includes('power') ||
    haystack.includes('horsepower') ||
    haystack.includes('kw') ||
    haystack.includes('rpm') ||
    haystack.includes('mean effective pressure') ||
    haystack.includes('indicator') ||
    haystack.includes('speed reduction ratio')
  ) {
    return 'Performance & Calculations';
  }

  if (
    haystack.includes('lathe') ||
    haystack.includes('drill') ||
    haystack.includes('bolt') ||
    haystack.includes('thread') ||
    haystack.includes('tubing') ||
    haystack.includes('chisel') ||
    haystack.includes('machinist')
  ) {
    return 'Workshop & Machining';
  }

  return 'General Marine Engineering';
}

function normaliseQuestions(rawQuestions) {
  return rawQuestions
    .filter(isValidQuestion)
    .map((question) => ({
      ...question,
      topic: inferTopic(question),
    }))
    .sort((a, b) => a.id - b.id);
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getResultMessage(score, total) {
  if (total === 0) return 'No valid questions were found.';
  const ratio = score / total;

  if (ratio === 1) return 'Perfect run. Proper menace.';
  if (ratio >= 0.85) return 'Strong result. Very clean work.';
  if (ratio >= 0.65) return 'Solid run. A few leaks, but good overall.';
  if (ratio >= 0.4) return 'Decent attempt. Needs revision.';
  return 'Reset and go again. This one needs work.';
}

function getTopicQuestionOrder(questions, topic) {
  return questions.filter((question) => question.topic === topic).map((question) => question.id);
}

export default function App() {
  const questions = useMemo(() => normaliseQuestions(allQuestions), []);
  const topicMap = useMemo(() => {
    const map = {};

    questions.forEach((question) => {
      if (!map[question.topic]) {
        map[question.topic] = [];
      }
      map[question.topic].push(question);
    });

    return map;
  }, [questions]);

  const topicNames = useMemo(() => Object.keys(topicMap).sort(), [topicMap]);

  const questionById = useMemo(() => {
    const map = new Map();
    questions.forEach((question) => {
      map.set(question.id, question);
    });
    return map;
  }, [questions]);

  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('general');
  const [selectedTopic, setSelectedTopic] = useState(topicNames[0] || '');
  const [questionOrder, setQuestionOrder] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [answers, setAnswers] = useState({});
  const [wrongStreak, setWrongStreak] = useState(0);
  const [showFahhBanner, setShowFahhBanner] = useState(false);

  const fahhAudioRef = useRef(null);

  useEffect(() => {
    if (topicNames.length > 0 && !topicNames.includes(selectedTopic)) {
      setSelectedTopic(topicNames[0]);
    }
  }, [topicNames, selectedTopic]);

  useEffect(() => {
    fahhAudioRef.current = new Audio('/fahh.mp3');
  }, []);

  const totalQuestions = questionOrder.length;
  const currentQuestionId = questionOrder[currentPosition];
  const currentQuestion = currentQuestionId ? questionById.get(currentQuestionId) : null;
  const currentAnswerState = currentQuestion ? answers[currentQuestion.id] : null;

  const correctCount = useMemo(
    () => Object.values(answers).filter((entry) => entry?.isCorrect).length,
    [answers]
  );

  const incorrectCount = useMemo(
    () => Object.values(answers).filter((entry) => entry && entry.selected !== null && !entry.isCorrect).length,
    [answers]
  );

  const answeredCount = useMemo(
    () => Object.values(answers).filter((entry) => entry && entry.selected !== null).length,
    [answers]
  );

  const progressPercent = totalQuestions > 0 ? ((currentPosition + 1) / totalQuestions) * 100 : 0;

  function resetQuizState(newOrder, nextMode, nextTopic = '') {
    setMode(nextMode);
    setSelectedTopic(nextTopic || topicNames[0] || '');
    setQuestionOrder(newOrder);
    setCurrentPosition(0);
    setAnswers({});
    setWrongStreak(0);
    setShowFahhBanner(false);
    setScreen(newOrder.length > 0 ? 'quiz' : 'home');
  }

  function startGeneralQuiz() {
    const order = shuffleArray(questions.map((question) => question.id));
    resetQuizState(order, 'general');
  }

  function startTopicQuiz(topic) {
    const order = getTopicQuestionOrder(questions, topic);
    resetQuizState(order, 'topic', topic);
  }

  function goHome() {
    setScreen('home');
    setShowFahhBanner(false);
  }

  function recordWrongStreak(nextIsCorrect) {
    if (nextIsCorrect) {
      setWrongStreak(0);
      setShowFahhBanner(false);
      return;
    }

    setWrongStreak((previous) => {
      const nextValue = previous + 1;

      if (nextValue >= 3) {
        setShowFahhBanner(true);

        if (fahhAudioRef.current) {
          fahhAudioRef.current.currentTime = 0;
          fahhAudioRef.current.play().catch(() => {
            // ignore autoplay failures
          });
        }
      }

      return nextValue;
    });
  }

  function handleOptionClick(optionIndex) {
    if (!currentQuestion) return;
    if (answers[currentQuestion.id]?.selected !== undefined) return;

    const isCorrect = optionIndex === currentQuestion.answer;

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: {
        selected: optionIndex,
        isCorrect,
      },
    }));

    recordWrongStreak(isCorrect);
  }

  function goToQuestion(position) {
    if (position < 0 || position >= totalQuestions) return;
    setCurrentPosition(position);
  }

  function handleNext() {
    if (currentPosition < totalQuestions - 1) {
      setCurrentPosition((previous) => previous + 1);
      return;
    }

    setScreen('results');
  }

  function handleBack() {
    if (currentPosition > 0) {
      setCurrentPosition((previous) => previous - 1);
    }
  }

  function handleSkip() {
    handleNext();
  }

  function restartCurrentMode() {
    if (mode === 'topic' && selectedTopic) {
      startTopicQuiz(selectedTopic);
      return;
    }

    startGeneralQuiz();
  }

  function jumpToQuestionId(questionId) {
    const position = questionOrder.findIndex((id) => id === Number(questionId));
    if (position >= 0) {
      setCurrentPosition(position);
    }
  }

  const alphabet = ['A', 'B', 'C', 'D'];

  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-[#131314] text-gray-100 flex flex-col font-sans">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8 bg-[#131314] border-b border-gray-800 gap-4">
          <div className="text-lg sm:text-xl font-medium tracking-wide text-gray-300">Quiz</div>
          <div className="text-xs sm:text-sm text-gray-400 shrink-0">
            Valid Question Database: {questions.length}
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <h1 className="text-3xl sm:text-4xl font-semibold mb-3">Choose a mode</h1>
            <p className="text-gray-400 text-sm sm:text-base">
              General quiz gives you a shuffled run across the cleaned question bank.
              Topic mode groups questions by inferred topic and lets you revise one area at a time.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-[#1e1f20] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="text-xl font-semibold mb-2">General Quiz</div>
              <p className="text-gray-400 mb-6">
                Random order across all valid questions.
              </p>
              <button
                onClick={startGeneralQuiz}
                className="bg-[#a8c7fa] hover:bg-[#b9d3fa] text-[#062e6f] font-medium py-3 px-6 rounded-full transition-colors"
              >
                Start General Quiz
              </button>
            </div>

            <div className="bg-[#1e1f20] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="text-xl font-semibold mb-2">Topic Based Quiz</div>
              <p className="text-gray-400 mb-4">
                Pick one topic and revise only those questions.
              </p>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(event) => setSelectedTopic(event.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-[#131314] px-4 py-3 text-gray-100 outline-none"
                >
                  {topicNames.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic} ({topicMap[topic].length})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => startTopicQuiz(selectedTopic)}
                className="bg-[#a8c7fa] hover:bg-[#b9d3fa] text-[#062e6f] font-medium py-3 px-6 rounded-full transition-colors"
              >
                Start Topic Quiz
              </button>
            </div>
          </div>

          <div className="mt-8 bg-[#1e1f20] border border-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="text-lg font-semibold mb-4">Detected topics</div>
            <div className="flex flex-wrap gap-2">
              {topicNames.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    startTopicQuiz(topic);
                  }}
                  className="rounded-full border border-gray-700 bg-[#131314] px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2b2c] transition-colors"
                >
                  {topic} · {topicMap[topic].length}
                </button>
              ))}
            </div>
          </div>
        </main>

        <footer className="px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-400">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <span>Made by:</span>
                <a
                  href={SOCIALS.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span>More work:</span>
                <a
                  href={SOCIALS.github}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Invalid and blank questions are auto-filtered out.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (screen === 'results') {
    const resultMessage = getResultMessage(correctCount, totalQuestions);

    return (
      <div className="min-h-screen bg-[#131314] text-gray-100 flex flex-col items-center justify-center font-sans px-4">
        <div className="bg-[#1e1f20] p-8 sm:p-10 rounded-2xl max-w-2xl w-full text-center shadow-xl border border-gray-800">
          <h1 className="text-3xl font-semibold mb-4">Quiz Completed</h1>
          <p className="text-gray-400 mb-6">{resultMessage}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-sm">
            <div className="bg-[#131314] rounded-xl p-4 border border-gray-800">
              <div className="text-gray-400 mb-1">Correct</div>
              <div className="text-green-400 text-xl font-semibold">{correctCount}</div>
            </div>
            <div className="bg-[#131314] rounded-xl p-4 border border-gray-800">
              <div className="text-gray-400 mb-1">Wrong</div>
              <div className="text-red-400 text-xl font-semibold">{incorrectCount}</div>
            </div>
            <div className="bg-[#131314] rounded-xl p-4 border border-gray-800">
              <div className="text-gray-400 mb-1">Answered</div>
              <div className="text-[#a8c7fa] text-xl font-semibold">{answeredCount}</div>
            </div>
            <div className="bg-[#131314] rounded-xl p-4 border border-gray-800">
              <div className="text-gray-400 mb-1">Total</div>
              <div className="text-white text-xl font-semibold">{totalQuestions}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={restartCurrentMode}
              className="bg-[#a8c7fa] hover:bg-[#b9d3fa] text-[#062e6f] font-medium py-3 px-6 rounded-full transition-colors"
            >
              Restart This Mode
            </button>

            <button
              onClick={goHome}
              className="bg-[#1a1b1c] hover:bg-[#2a2b2c] text-gray-200 font-medium py-3 px-6 rounded-full border border-gray-700 transition-colors"
            >
              Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#131314] text-gray-100 flex items-center justify-center px-4">
        <div className="bg-[#1e1f20] border border-gray-800 rounded-2xl p-8 text-center max-w-lg w-full">
          <h1 className="text-2xl font-semibold mb-3">No questions available</h1>
          <p className="text-gray-400 mb-6">This mode did not produce any valid questions.</p>
          <button
            onClick={goHome}
            className="bg-[#a8c7fa] hover:bg-[#b9d3fa] text-[#062e6f] font-medium py-3 px-6 rounded-full transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131314] text-gray-100 flex flex-col font-sans">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8 bg-[#131314] border-b border-gray-800 gap-4">
        <div className="text-lg sm:text-xl font-medium tracking-wide text-gray-300">
          {mode === 'topic' ? 'Topic Quiz' : 'General Quiz'}
        </div>
        <div className="text-xs sm:text-sm text-gray-400 shrink-0">
          {currentPosition + 1} / {totalQuestions}
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-4 max-w-6xl mx-auto w-full mt-6 mb-6">
        <div className="flex-1 min-w-[180px] bg-[#444746] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#a8c7fa] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <div className="bg-[#3c2a2a] text-[#f28b82] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span>✕</span> {incorrectCount}
          </div>
          <div className="bg-[#213524] text-[#81c995] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span>✓</span> {correctCount}
          </div>
        </div>
      </div>

      {showFahhBanner && (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="rounded-2xl border border-red-900 bg-[#301919] px-4 py-3 text-sm text-red-200">
            Fahh mode triggered. Three wrong in a row.
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="bg-transparent">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                onClick={goHome}
                className="rounded-full border border-gray-700 bg-[#1e1f20] px-4 py-2 text-sm text-gray-200 hover:bg-[#2a2b2c] transition-colors"
              >
                Home
              </button>

              <button
                onClick={handleBack}
                disabled={currentPosition === 0}
                className="rounded-full border border-gray-700 bg-[#1e1f20] px-4 py-2 text-sm text-gray-200 hover:bg-[#2a2b2c] transition-colors disabled:opacity-40"
              >
                Back
              </button>

              <button
                onClick={handleSkip}
                className="rounded-full border border-gray-700 bg-[#1e1f20] px-4 py-2 text-sm text-gray-200 hover:bg-[#2a2b2c] transition-colors"
              >
                Skip
              </button>

              <button
                onClick={handleNext}
                className="rounded-full bg-[#a8c7fa] px-4 py-2 text-sm font-medium text-[#062e6f] hover:bg-[#b9d3fa] transition-colors"
              >
                {currentPosition === totalQuestions - 1 ? 'Finish' : 'Next'}
              </button>
            </div>

            <div className="bg-[#1e1f20] border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="rounded-full bg-[#131314] border border-gray-700 px-3 py-1 text-xs text-gray-300">
                  TOPIC: {currentQuestion.topic}
                </span>
                <span className="rounded-full bg-[#131314] border border-gray-700 px-3 py-1 text-xs text-gray-300">
                  Question ID: {currentQuestion.id}
                </span>
                {currentAnswerState && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs border ${
                      currentAnswerState.isCorrect
                        ? 'bg-[#213524] border-[#2d6b39] text-[#81c995]'
                        : 'bg-[#3c2a2a] border-[#7f3d3d] text-[#f28b82]'
                    }`}
                  >
                    {currentAnswerState.isCorrect ? 'Answered correctly' : 'Answered incorrectly'}
                  </span>
                )}
              </div>

              <div className="flex gap-3 sm:gap-4 text-lg sm:text-xl text-gray-200 mb-8">
                <div className="font-medium shrink-0 text-[#a8c7fa]">
                  Q{currentQuestion.id}.
                </div>
                <div className="font-medium leading-relaxed">{currentQuestion.text}</div>
              </div>

              <div className="flex flex-col gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const answerState = answers[currentQuestion.id];
                  const isLocked = answerState?.selected !== undefined;
                  const isSelected = answerState?.selected === idx;
                  const isCorrectOption = idx === currentQuestion.answer;

                  let btnClasses =
                    'w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 ';
                  let letterClasses = 'text-gray-400 font-medium';

                  if (!isLocked) {
                    btnClasses +=
                      'border-transparent bg-[#131314] hover:bg-[#2a2b2c] cursor-pointer';
                  } else if (isCorrectOption) {
                    btnClasses += 'bg-[#213524] border-[#81c995] text-[#81c995]';
                    letterClasses = 'text-[#81c995]';
                  } else if (isSelected) {
                    btnClasses += 'bg-[#3c2a2a] border-[#f28b82] text-[#f28b82]';
                    letterClasses = 'text-[#f28b82]';
                  } else {
                    btnClasses += 'bg-[#131314] border-transparent opacity-50';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isLocked}
                      className={btnClasses}
                    >
                      <div className={letterClasses}>{alphabet[idx]}.</div>
                      <div className="flex-1">{option}</div>

                      {isLocked && isCorrectOption && (
                        <div className="ml-auto text-[#81c995]">✓</div>
                      )}

                      {isLocked && isSelected && !isCorrectOption && (
                        <div className="ml-auto text-[#f28b82]">✕</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="bg-[#1e1f20] border border-gray-800 rounded-2xl p-5 shadow-xl h-fit">
            <div className="text-lg font-semibold mb-3">
              {mode === 'topic' ? 'Topic Navigator' : 'Question Navigator'}
            </div>

            {mode === 'topic' && (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(event) => startTopicQuiz(event.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-[#131314] px-4 py-3 text-gray-100 outline-none"
                >
                  {topicNames.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic} ({topicMap[topic].length})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Jump to question</label>
              <select
                value={currentQuestion.id}
                onChange={(event) => jumpToQuestionId(event.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-[#131314] px-4 py-3 text-gray-100 outline-none"
              >
                {questionOrder.map((questionId) => {
                  const question = questionById.get(questionId);
                  return (
                    <option key={questionId} value={questionId}>
                      Q{questionId} — {question?.topic}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="text-sm text-gray-400 mb-3">
              {mode === 'topic'
                ? `Questions under ${selectedTopic}`
                : 'All questions in current run'}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
              {questionOrder.map((questionId, position) => {
                const answerState = answers[questionId];
                const isCurrent = position === currentPosition;

                let classes =
                  'rounded-lg px-3 py-2 text-xs font-medium border transition-colors ';

                if (isCurrent) {
                  classes += 'bg-[#a8c7fa] text-[#062e6f] border-[#a8c7fa]';
                } else if (!answerState) {
                  classes += 'bg-[#131314] text-gray-300 border-gray-700 hover:bg-[#2a2b2c]';
                } else if (answerState.isCorrect) {
                  classes += 'bg-[#213524] text-[#81c995] border-[#2d6b39]';
                } else {
                  classes += 'bg-[#3c2a2a] text-[#f28b82] border-[#7f3d3d]';
                }

                return (
                  <button
                    key={questionId}
                    onClick={() => goToQuestion(position)}
                    className={classes}
                  >
                    {questionId}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </main>

      <footer className="px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-400">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <span>Made by:</span>
              <a
                href={SOCIALS.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
            </div>

            <div className="flex items-center gap-2">
              <span>More work:</span>
              <a
                href={SOCIALS.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Answered {answeredCount} of {totalQuestions}
          </div>
        </div>
      </footer>
    </div>
  );
}