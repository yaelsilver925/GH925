// ייבוא Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";


// הגדרות חיבור ל-Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAGKZ_OuzlpjmQ_7nZloxf5rgTV42r1eg8",
    authDomain: "mypro-77fad.firebaseapp.com",
    databaseURL: "https://mypro-77fad-default-rtdb.firebaseio.com",
    projectId: "mypro-77fad",
    storageBucket: "mypro-77fad.firebasestorage.app",
    messagingSenderId: "163596788623",
    appId: "1:163596788623:web:dfdcec18d32f97fcf1a1fa",
    measurementId: "G-Z31V5EEH3K"
  };

// אתחול Firebase
const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getDatabase(app);


let totalCount = 0;
let isSubmitting = false; // דגל למניעת שליחה כפולה

// התחברות אנונימית
// signInAnonymously(auth)
//   .then((userCredential) => {
//     // התחברות מוצלחת
//     const user = userCredential.user;
//     console.log("User ID:", user.uid);
//     alert("Signed in anonymously!");
//   })
//   .catch((error) => {
//     // טיפול בשגיאות
//     console.error("Error signing in:", error.code, error.message);
//     alert("Failed to sign in anonymously.");
//   });


// // פונקציה להציג את הקבלות
// const displayComments = (comments) => {
//     const commentsContainer = document.getElementById('comments');
    
//     // ניקוי הקבלות הישנות
//     commentsContainer.innerHTML = '';

//     // הצגת הקבלות החדשות
//     comments.forEach(comment => {
//         const commentElement = document.createElement('div');
//         commentElement.textContent = comment.comment; // רק את הקבלה עצמה
//         commentsContainer.appendChild(commentElement);
//     });
// };

// פונקציה להציג את הקבלות
const displayComments = (comments) => {
    const commentsContainer = document.getElementById('comments');
    
    // ניקוי הקבלות הישנות
    commentsContainer.innerHTML = '';

    // הצגת הקבלות החדשות רק אם יש תוכן בקבלה
    comments.forEach(comment => {
        if (comment.comment && comment.comment.trim() !== '') { // בדיקה אם הקבלה אינה ריקה
            const commentElement = document.createElement('div');
            commentElement.textContent = comment.comment; // רק את הקבלה עצמה
            commentsContainer.appendChild(commentElement);
        }
    });
};


// פונקציה לעדכון הקבלות מהדאטהבייס
const fetchComments = () => {
    const dbRef = ref(db, "users");
    
    // לוודא שאתה לא קורא את הנתונים מחדש
    onValue(dbRef, (snapshot) => {
        const comments = [];
        
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            comments.push(data);
        });

        // הצגת הקבלות החדשות
        displayComments(comments);
    });
};

// קריאה לפונקציה כדי להציג את הקבלות
fetchComments();

// פונקציה לעדכון המונה מהדאטהבייס
const updateCounterFromDatabase = () => {
    const dbRef = ref(db, "users");
    totalCount = 0;

    onValue(dbRef, (snapshot) => {
        totalCount = 0;
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            totalCount += parseInt(data.chapters || 0, 10);
        });
        document.getElementById('counter').innerText = totalCount;
    });
};

// טיפול בלחיצה על כפתור ההצטרפות
document.getElementById('addButton').addEventListener('click', () => {
    document.getElementById('formSection').classList.remove('hidden');
});

// פונקציה לשליחת הטופס
function submitFormData() {
    if (isSubmitting) return;  // אם כבר שולחים, אל תבצע שוב

    isSubmitting = true;  // עדכון הדגל לפני שליחה
    const name = document.getElementById("nameInput").value.trim() || "אנונימי";
    const chaptersInput = document.getElementById("chaptersInput").value.trim();
    const comment = document.getElementById("commentInput").value.trim() || "";

    if (!chaptersInput || isNaN(chaptersInput) || parseInt(chaptersInput, 10) <= 0) {
        alert("אנא הזן מספר פרקים חוקי (1 ומעלה).");
        isSubmitting = false;  // החזרת הדגל אם לא תקבל ערך חוקי
        return;
    }

    const chapters = parseInt(chaptersInput, 10);
    const data = {
        name: name,
        chapters: chapters,
        comment: comment,
        timestamp: Date.now(),
    };

    const dbRef = ref(db, "users");
    push(dbRef, data)
        .then(() => {
            console.log("Data saved successfully");
            clearForm();
            showThankYouMessage();
        })
        .catch((error) => {
            console.error("Error saving data:", error);
            alert("שגיאה בשמירת הנתונים. אנא נסה שוב.");
        })
        .finally(() => {
            isSubmitting = false;  // החזרת הדגל לאחר סיום
        });
}

// ניקוי טופס לאחר שליחה
const clearForm = () => {
    document.getElementById('nameInput').value = '';
    document.getElementById('chaptersInput').value = '';
    document.getElementById('commentInput').value = '';
    document.getElementById('formSection').classList.add('hidden');
};

// הצגת הודעת תודה
const showThankYouMessage = () => {
    document.getElementById('thankYouMessage').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('thankYouMessage').classList.add('hidden');
    }, 3000);
};

// חיבור פונקציות לכפתורים
document.getElementById('submitButton').addEventListener('click', submitFormData, { once: true });

// עדכון ראשוני של המונה
updateCounterFromDatabase();
console.log("Firebase connected successfully:", db);

window.submitFormData = submitFormData;

console.log("Script.js נטען בהצלחה!");
