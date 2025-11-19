// Replace your existing initApp() function with this diagnostic version
async function initApp() {
  try {
    console.info('Init start — firebaseConfig.projectId =', firebaseConfig && firebaseConfig.projectId);
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    setLogLevel('debug');

    let userCredential = null;
    try {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        console.info('Attempting signInWithCustomToken...');
        userCredential = await signInWithCustomToken(auth, __initial_auth_token);
        console.info('signInWithCustomToken result uid:', userCredential?.user?.uid);
      } else {
        console.info('Attempting signInAnonymously...');
        userCredential = await signInAnonymously(auth);
        console.info('signInAnonymously result uid:', userCredential?.user?.uid);
      }
    } catch (authErr) {
      console.error('Authentication error:', authErr);
      showMessage('Authentication failed. See console for details.', 'error');
      throw authErr;
    }

    if (!userCredential || !userCredential.user) {
      console.error('No user credential returned:', userCredential, 'auth.currentUser:', auth.currentUser);
      showMessage('Authentication did not return a user. Check Firebase Auth config.', 'error');
      throw new Error('no-auth-user');
    }

    userId = userCredential.user.uid;
    console.info('Authenticated as userId:', userId);
    accountUserIdEl.textContent = userId;

    loginContainer.classList.add('hidden');
    mainContent.classList.remove('hidden');

    // Extra debug: print accountRef path right before initializeAccount reads it
    try {
      accountRef = doc(getFirestore(app), 'artifacts', appId, 'users', userId, 'accountData', 'main');
      console.info('initializeAccount will read path:', accountRef.path);
    } catch (e) {
      console.error('Failed to build accountRef:', e);
    }

    try {
      await initializeAccount();
      console.info('initializeAccount succeeded.');
    } catch (fsErr) {
      console.error('initializeAccount error:', fsErr);
      showMessage('Failed to connect to database: ' + (fsErr?.code || fsErr?.message || 'firestore error'), 'error');
      throw fsErr;
    }

    // Attach UI listeners
    document.getElementById('deposit-btn').onclick = window.handleDeposit;
    document.getElementById('withdraw-btn').onclick = window.handleWithdraw;
    document.getElementById('transfer-submit-btn').onclick = window.handleBankTransfer;
    document.getElementById('otp-submit-btn').onclick = window.handleOtpSubmission;
    document.getElementById('otp-cancel-btn').onclick = window.hideOtpModal;

    window.navigateTo('dashboard-content');
    console.info('App initialized successfully.');
  } catch (error) {
    console.error('Firebase Initialization/Sign-In Error (full):', error);
    const code = error?.code || error?.message || 'init-failed';
    showMessage('Critical Error: Failed to initialize application (' + code + '). See console.', 'error');
    loginContainer.classList.remove('hidden');
    mainContent.classList.add('hidden');
  }
}
