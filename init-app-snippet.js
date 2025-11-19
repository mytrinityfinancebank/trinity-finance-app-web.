// Replace the existing initApp() function body with this snippet.
async function initApp() {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        setLogLevel('debug');

        // Sign in
        let userCredential;
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            try {
                userCredential = await signInWithCustomToken(auth, __initial_auth_token);
                console.info('Signed in with custom token.');
            } catch (err) {
                console.error('Custom token sign-in failed:', err);
                throw new Error('Authentication failed with custom token. Check token and project.');
            }
        } else {
            try {
                userCredential = await signInAnonymously(auth);
                console.info('Signed in anonymously.');
            } catch (err) {
                console.error('Anonymous sign-in failed:', err);
                throw new Error('Anonymous authentication failed. Ensure Anonymous sign-in is enabled in Firebase console.');
            }
        }

        if (!userCredential || !userCredential.user) {
            console.error('Auth returned no user credential:', userCredential, 'auth.currentUser:', auth.currentUser);
            throw new Error('Authentication did not return a valid user. Check Firebase Auth configuration.');
        }

        userId = userCredential.user.uid;
        console.info('Authenticated as userId:', userId);
        accountUserIdEl.textContent = userId;

        loginContainer.classList.add('hidden');
        mainContent.classList.remove('hidden');

        // Initialize account and attach listeners
        try {
            await initializeAccount();
        } catch (err) {
            // If initializeAccount throws, include error details in UI & console
            console.error('initializeAccount failed:', err);
            showMessage('Failed to connect to the database. Permissions issue likely. Check console for Firestore error.', 'error');
            // Leave login shown so user knows it's not connected
            loginContainer.classList.remove('hidden');
            mainContent.classList.add('hidden');
            return;
        }

        // Attach UI event listeners
        document.getElementById('deposit-btn').onclick = window.handleDeposit;
        document.getElementById('withdraw-btn').onclick = window.handleWithdraw;
        document.getElementById('transfer-submit-btn').onclick = window.handleBankTransfer;
        document.getElementById('otp-submit-btn').onclick = window.handleOtpSubmission;
        document.getElementById('otp-cancel-btn').onclick = window.hideOtpModal;

        window.navigateTo('dashboard-content');

    } catch (error) {
        console.error("Firebase Initialization/Sign-In Error:", error);
        showMessage("Critical Error: Failed to initialize application data. Check Firebase Auth and Security Rules. See console for details.", 'error');
        loginContainer.classList.remove('hidden');
        mainContent.classList.add('hidden');
    }
}
