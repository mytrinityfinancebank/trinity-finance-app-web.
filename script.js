// 1. Get references to the key elements
const balanceElement = document.getElementById('available-balance');
const transferForm = document.getElementById('transfer-form');
const transactionTypeSelect = document.getElementById('transaction-type'); 

// 2. Define the initial balance (71,800,000.00 * 100 = 7,180,000,000 cents)
// We will use the displayed value for display purposes, but the script can handle this large number.
let currentBalanceCents = 7180000000; // Represents $71,800,000.00

// Function to format cents into a displayable dollar string
function formatBalance(cents) {
    const dollars = (cents / 100).toFixed(2);
    // Use toLocaleString for proper comma separation (e.g., 71,800,000.00)
    return '$' + parseFloat(dollars).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Function to update the display
function updateDisplay() {
    balanceElement.textContent = formatBalance(currentBalanceCents);
}

// Function to handle the transaction submission
function handleTransaction(event) {
    event.preventDefault();

    const amountInput = transferForm.querySelector('input[type="number"]');
    const recipientInput = transferForm.querySelector('input[type="text"]');
    const type = transactionTypeSelect.value; 

    const transactionAmountDollars = parseFloat(amountInput.value);
    
    // Check for valid input
    if (isNaN(transactionAmountDollars) || transactionAmountDollars <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    
    // Convert to cents (Multiply by 100 and round)
    const transactionAmountCents = Math.round(transactionAmountDollars * 100);
    
    let message = "";
    
    if (type === 'withdrawal') {
        // --- WITHDRAWAL (Transfer) LOGIC ---
        if (transactionAmountCents > currentBalanceCents) {
            alert("🚨 Transaction Failed: Insufficient funds for this transfer.");
            return;
        }

        currentBalanceCents -= transactionAmountCents;
        message = `✅ Success! Transferred ${formatBalance(transactionAmountCents)} to account ${recipientInput.value}.`;

    } else if (type === 'deposit') {
        // --- DEPOSIT LOGIC ---
        currentBalanceCents += transactionAmountCents;
        message = `🎉 Deposit Successful! You added ${formatBalance(transactionAmountCents)} to your account.`;
    }

    updateDisplay(); 
    alert(message);
    transferForm.reset();
}

// Replace the old event listener with the new one
transferForm.addEventListener('submit', handleTransaction);

// Set the initial balance display when the page loads
updateDisplay();
