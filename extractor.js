const fs = require('fs');
const { PdfReader } = require('pdfreader');

let leftColumn = [];
let rightColumn = [];
let database = [];

// Global state trackers to handle questions that wrap between columns/pages
let currentQ = null;
let currentMode = null; 

console.log("🚀 Running the flawless hybrid parser... This will take a moment.");

new PdfReader().parseFileItems("synergy.pdf", (err, item) => {
    if (err) console.error(err);
    else if (!item) {
        // End of file! Process the very last page
        processPage();
        
        // Push the very last question into the database
        if (currentQ) database.push(currentQ);
        
        // Save the perfect database to JSON
        fs.writeFileSync('questions.json', JSON.stringify(database, null, 2));
        console.log(`\n\n✅ Perfection achieved! Extracted ${database.length} questions flawlessly.`);
        console.log("💾 Saved to 'questions.json'. You can now run your React app!");
    }
    else if (item.page) {
        // We hit a new page. Process the PREVIOUS page's columns before resetting.
        processPage();
        leftColumn = [];
        rightColumn = [];
        process.stdout.write(`\rProcessing page ${item.page}...`);
    }
    else if (item.text) {
        // Strip out the "Page X" and headers at the top (Y < 4.5)
        if (item.y < 4.5) return;

        // Split the page directly down the middle (X = 13)
        if (item.x < 13) {
            leftColumn.push(item);
        } else {
            rightColumn.push(item);
        }
    }
});

function processPage() {
    if (leftColumn.length === 0 && rightColumn.length === 0) return;

    // The Fuzzy Sort: 
    // If Y difference is less than 0.2, they are on the same line, so sort left-to-right.
    // Otherwise, sort top-to-bottom.
    const sortSpatially = (a, b) => {
        if (Math.abs(a.y - b.y) < 0.2) {
            return a.x - b.x; 
        }
        return a.y - b.y;
    };

    leftColumn.sort(sortSpatially);
    rightColumn.sort(sortSpatially);

    // Read the left column first, then continue to the right column
    let pageItems = leftColumn.concat(rightColumn);

    pageItems.forEach(item => {
        let text = item.text.trim();
        if (!text) return;

        // Condition Matching Logic
        if (text.match(/^\d+$/)) {
            // New Question! Push the old one and start a new one
            if (currentQ) database.push(currentQ);
            currentQ = { id: parseInt(text), text: "", options: ["", "", "", ""], answer: null };
            currentMode = 'Q';
        } else if (text === 'A.') {
            currentMode = 0;
        } else if (text === 'B.') {
            currentMode = 1;
        } else if (text === 'C.') {
            currentMode = 2;
        } else if (text === 'D.') {
            currentMode = 3;
        } else if (text === 'Ans:') {
            currentMode = 'ANS';
        } else {
            // Append text to the correct property based on our current mode
            if (!currentQ) return; 
            
            if (currentMode === 'Q') {
                currentQ.text += (currentQ.text ? " " : "") + text;
            } else if (currentMode >= 0 && currentMode <= 3) {
                currentQ.options[currentMode] += (currentQ.options[currentMode] ? " " : "") + text;
            } else if (currentMode === 'ANS') {
                // Look for the single letter answer
                let match = text.match(/^[A-D]$/);
                if (match) {
                    currentQ.answer = match[0].charCodeAt(0) - 65; 
                }
            }
        }
    });
}