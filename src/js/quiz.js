const NUMCOUNTRIES = 200;

// Smart question selector
let countryRecord = [];
for (let qIndex = 0; qIndex < NUMCOUNTRIES; qIndex++) {
  countryRecord[qIndex] = { index: qIndex, correct: 0, incorrect: 0 };
}

export class QuizRecord {
  constructor(numQuestions) {
    this.numQuestions = numQuestions;
    this.record = [];

    // Initialize the record
    for (let i = 0; i < numQuestions; i++) {
      this.record[i] = { index: i, correct: 0, incorrect: 0 };
    }
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
  update(index, result) {
    if (result === 'correct') {
      this.record[index].correct++;
    } else {
      this.record[index].incorrect++;
    }
  }

  // Optional: reset all records
  reset() {
    this.record = [];
    for (let i = 0; i < this.numQuestions; i++) {
      this.record[i] = { index: i, correct: 0, incorrect: 0 };
    }
  }
}
