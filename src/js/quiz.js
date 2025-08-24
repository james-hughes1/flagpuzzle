import { COUNTRIES } from '../assets/countries.js';

export class QuizRecord {
  constructor() {
    this.numCountries = COUNTRIES.length;
    this.countries = COUNTRIES; // store country data
    this.record = [];

    // Initialize record
    for (let i = 0; i < this.numCountries; i++) {
      this.record[i] = { index: i, correct: 0, incorrect: 0 };
    }
    this.currentIndex = Math.floor(Math.random() * this.numCountries); // track the current question
  }

  // Select the next question intelligently
  smartIndex() {
    const seenIndices = [];
    const unseenIndices = [];

    this.record.forEach((entry, idx) => {
      if (entry.correct + entry.incorrect > 0) {
        for (let i = 0; i < 1 + entry.incorrect; i++) {
          seenIndices.push(idx);
        }
      } else {
        unseenIndices.push(idx);
      }
    });

    let qIndex = 0;

    if (seenIndices.length === 0) {
      const i = Math.floor(Math.random() * unseenIndices.length);
      qIndex = unseenIndices[i];
    } else if (unseenIndices.length === 0) {
      const i = Math.floor(Math.random() * seenIndices.length);
      qIndex = seenIndices[i];
    } else {
      // Favor unseen questions at the start
      let newRate = 0.0;
      if (seenIndices.length > 50) newRate = 0.2;
      else if (seenIndices.length > 5) newRate = 0.4;
      else newRate = 0.8;

      const seenAgain = Math.random() > newRate;
      if (seenAgain) {
        const i = Math.floor(Math.random() * seenIndices.length);
        qIndex = seenIndices[i];
      } else {
        const i = Math.floor(Math.random() * unseenIndices.length);
        qIndex = unseenIndices[i];
      }
    }

    return qIndex;
  }

  // Update the record after a question is answered
  update(result) {
    if (result === 'correct') {
      this.record[this.currentIndex].correct++;
    } else {
      this.record[this.currentIndex].incorrect++;
    }
  }

  // Update the record after a question is answered
  updateIndex() {
    this.currentIndex = this.smartIndex();
  }

  // Get current question/answer
  getCurrentQA() {
    if (this.currentIndex === null) return null;
    const country = this.countries[this.currentIndex];
    return {
      question: country.question,
      answer: country.answer,
    };
  }

  // Optional: reset all records
  reset() {
    this.record = [];
    for (let i = 0; i < this.numQuestions; i++) {
      this.record[i] = { index: i, correct: 0, incorrect: 0 };
    }
  }
}
