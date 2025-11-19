// Replace your existing initApp() with this version for better diagnostics
async function initApp() {
    try {
        console.info('Initializing Firebase app with projectId:', firebaseConfig && firebaseConfig.projectId);
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        setLogLevel('debug');

        let userCredential = null;
        try {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                console.info('Attempting signInWithCustomToken...');
                userCredential = await signInWithCustomToken(auth, __initial_auth_token);
                console.info('Signed in with custom token:', userCredential && userCredential.user && userCredential.user.uid);
            } else {
                console.info('Attempting signInAnonymously...');
                userCredential = await signInAnonymously(auth);
                console.info('Signed in anonymously:', userCredential && userCredential.user && userCredential.user.uid);
            }
        } catch (authErr) {
            console.error('Authentication error:', authErr);
            // Surface a clear message in the UI with code (if available)
            const code = authErr && authErr.code ? authErr.code : (authErr && authErr.message) || 'auth-failed';
            showMessage('Authentication failed: ' + code, 'error');
            throw authErr;
        }

        // Ensure we have a user
        if (!userCredential || !userCredential.user) {
            console.error('Auth returned no user credential:', userCredential, 'auth.currentUser:', auth.currentUser);
            showMessage('Authentication did not return a user. Check Firebase Auth config.', 'error');
            throw new Error('no-auth-user');
        }

        userId = userCredential.user.uid;
        console.info('Authenticated as userId:', userId);
        accountUserIdEl.textContent = userId;

        loginContainer.classList.add('hidden');
        mainContent.classList.remove('hidden');

        // initializeAccount will handle Firestore read/seed and subscription
        try {
            await initializeAccount();
        } catch (fsErr) {
            console.error('initializeAccount error:', fsErr);
            // If Firestore returned a FirebaseError with a code, show it
            const fsCode = fsErr && fsErr.code ? fsErr.code : (fsErr && fsErr.message) || 'firestore-error';
            showMessage('Failed to connect to database: ' + fsCode, 'error');
            // Re-throw so outer catch also receives it if needed
            throw fsErr;
        }

        // Attach UI event listeners (safe to re-attach even if already set)
        document.getElementById('deposit-btn').onclick = window.handleDeposit;
        document.getElementById('withdraw-btn').onclick = window.handleWithdraw;
        document.getElementById('transfer-submit-btn').onclick = window.handleBankTransfer;
        document.getElementById('otp-submit-btn').onclick = window.handleOtpSubmission;
        document.getElementById('otp-cancel-btn').onclick = window.hideOtpModal;

        // Navigate to initial page
        window.navigateTo('dashboard-content');
        console.info('App initialized successfully.');

    } catch (error) {
        // Final catch: log full object for debugging
        console.error('Firebase Initialization/Sign-In Error (full):', error);
        // If FirebaseError, it usually has code and message fields
        const code = error && error.code ? error.code : (error && error.message) || 'init-failed';
        showMessage('Critical Error: Failed to initialize application (' + code + '). See console.', 'error');
        loginContainer.classList.remove('hidden');
        mainContent.classList.add('hidden');
    }
}
