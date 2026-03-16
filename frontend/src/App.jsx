import React, { useState } from 'react';
import allQuestions from './questions.json';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const currentQuestion = allQuestions[currentIndex] || {
    text: 'Loading error',
    options: [],
    answer: 0,
  };

  const alphabet = ['A', 'B', 'C', 'D'];

  const handleOptionClick = (index) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.answer) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsQuizComplete(false);
  };

  if (isQuizComplete) {
    return (
      <div className="min-h-screen bg-[#131314] text-gray-100 flex flex-col items-center justify-center font-sans px-4">
        <div className="bg-[#1e1f20] p-8 sm:p-10 rounded-2xl max-w-lg w-full text-center shadow-xl border border-gray-800">
          <h1 className="text-3xl font-semibold mb-6">Quiz Completed!</h1>

          <div className="flex justify-center gap-8 mb-8 text-2xl">
            <div className="text-green-400 font-medium">✓ {correctCount}</div>
            <div className="text-red-400 font-medium">✕ {incorrectCount}</div>
          </div>

          <button
            onClick={handleRestart}
            className="bg-[#a8c7fa] hover:bg-[#b9d3fa] text-[#062e6f] font-medium py-3 px-8 rounded-full transition-colors"
          >
            Start Over
          </button>
        </div>

        <footer className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span>Made by:</span>
            <a
              href="https://www.instagram.com/aswinvktl/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.88 1.12a1.13 1.13 0 1 1 0 2.26 1.13 1.13 0 0 1 0-2.26ZM12 6.5A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 6.5Zm0 1.5A4 4 0 1 0 16 12a4 4 0 0 0-4-4Z" />
              </svg>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span>More work:</span>
            <a
              href="https://github.com/aswinvktl"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131314] text-gray-100 flex flex-col font-sans">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8 bg-[#131314] border-b border-gray-800 gap-4">
        <div className="text-lg sm:text-xl font-medium tracking-wide text-gray-300">
          Quiz
        </div>
        <div className="text-xs sm:text-sm text-gray-400 shrink-0">
          Question Database: {allQuestions.length} Items
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-4 max-w-6xl mx-auto w-full mt-6 mb-8">
        <div className="flex-1 min-w-[180px] bg-[#444746] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#a8c7fa] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / allQuestions.length) * 100}%` }}
          />
        </div>

        <div className="text-sm text-gray-400 font-medium shrink-0">
          {currentIndex + 1} / {allQuestions.length}
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

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative">
        <div className="flex gap-3 sm:gap-4 text-lg sm:text-xl text-gray-200 mb-8 mt-4">
          <div className="font-medium shrink-0 text-[#a8c7fa]">
            Q{currentQuestion.id || currentIndex + 1}.
          </div>
          <div className="font-medium leading-relaxed">{currentQuestion.text}</div>
        </div>

        <div className="flex flex-col gap-3">
          {currentQuestion.options &&
            currentQuestion.options.map((option, idx) => {
              let btnClasses =
                'w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 ';
              let letterClasses = 'text-gray-400 font-medium';

              if (!isAnswered) {
                btnClasses +=
                  'border-transparent bg-[#1e1f20] hover:bg-[#2a2b2c] cursor-pointer';
              } else {
                btnClasses += 'cursor-default ';
                if (idx === currentQuestion.answer) {
                  btnClasses += 'bg-[#213524] border-[#81c995] text-[#81c995]';
                  letterClasses = 'text-[#81c995]';
                } else if (idx === selectedOption) {
                  btnClasses += 'bg-[#3c2a2a] border-[#f28b82] text-[#f28b82]';
                  letterClasses = 'text-[#f28b82]';
                } else {
                  btnClasses += 'bg-[#1e1f20] border-transparent opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                  className={btnClasses}
                >
                  <div className={letterClasses}>{alphabet[idx]}.</div>
                  <div className="flex-1">{option}</div>

                  {isAnswered && idx === currentQuestion.answer && (
                    <div className="ml-auto text-[#81c995]">✓</div>
                  )}

                  {isAnswered &&
                    idx === selectedOption &&
                    idx !== currentQuestion.answer && (
                      <div className="ml-auto text-[#f28b82]">✕</div>
                    )}
                </button>
              );
            })}
        </div>
      </main>

      <footer className="px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mt-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span>Made by:</span>
              <a
                href="https://www.instagram.com/aswinvktl/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.88 1.12a1.13 1.13 0 1 1 0 2.26 1.13 1.13 0 0 1 0-2.26ZM12 6.5A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 6.5Zm0 1.5A4 4 0 1 0 16 12a4 4 0 0 0-4-4Z" />
                </svg>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <span>More work:</span>
              <a
                href="https://github.com/aswinvktl"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className={`py-3 px-6 sm:px-10 rounded-full font-medium transition-colors shadow-lg ${
              isAnswered
                ? 'bg-[#a8c7fa] hover:bg-[#b9d3fa] text-[#062e6f] cursor-pointer'
                : 'bg-[#1e1f20] text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            {currentIndex === allQuestions.length - 1 ? 'Finish' : 'Next Question'}
          </button>
        </div>
      </footer>
    </div>
  );
}