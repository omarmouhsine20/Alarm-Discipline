const currentTime = document.getElementById("currentTime");
const currentDate = document.getElementById("currentDate");

const alarmTimeInput = document.getElementById("alarmTime");
const setAlarmBtn = document.getElementById("setAlarmBtn");
const alarmStatus = document.getElementById("alarmStatus");

const challenge = document.getElementById("challenge");
const targetWord = document.getElementById("targetWord");
const wordInput = document.getElementById("wordInput");
const stopAlarmBtn = document.getElementById("stopAlarmBtn");
const errorMessage = document.getElementById("errorMessage");

let alarmTime = null;
let alarmActive = false;
let alarmRinging = false;
let alarmInterval = null;
let audioContext = null;
let soundInterval = null;

const words = [
    "MORNING",
    "WAKEUP",
    "COFFEE",
    "SUNRISE",
    "ENERGY"
    
];

// Display current time and date
function updateClock() {
    const now = new Date();

    currentTime.textContent = now.toLocaleTimeString("en-US", {
        hour24: true
    });

    currentDate.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric" ,
    });

    if (!alarmActive || alarmRinging) return;

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const nowTime = `${hours}:${minutes}`;

    if (nowTime === alarmTime) {
        startRinging();
    }
}

// Play alarm sound using Web Audio API
function playAlarmSound() {
    try {
        audioContext = audioContext || new (
            window.AudioContext || window.webkitAudioContext
        )();

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "square";
        oscillator.frequency.value = 880;

        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.25,
            audioContext.currentTime + 0.05
        );
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + 0.7
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.7);

    } catch (error) {
        console.error("Audio error:", error);
    }
}

// Start ringing
function startRinging() {
    if (alarmRinging) return;

    alarmRinging = true;
    alarmActive = false;

    challenge.classList.remove("hidden");

    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];

    targetWord.textContent = selectedWord;

    wordInput.value = "";
    errorMessage.textContent = "";

    playAlarmSound();

    soundInterval = setInterval(playAlarmSound, 1200);

    alarmStatus.textContent = "Alarm is ringing!";
}

// Set alarm
setAlarmBtn.addEventListener("click", () => {
    const selectedTime = alarmTimeInput.value;

    if (!selectedTime) {
        alarmStatus.textContent = "Please choose an alarm time.";
        return;
    }

    const now = new Date();
    const [hours, minutes] = selectedTime.split(":").map(Number);

    const alarmDate = new Date();
    alarmDate.setHours(hours, minutes, 0, 0);

    if (alarmDate <= now) {
        alarmDate.setDate(alarmDate.getDate() + 1);
    }

    alarmTime = selectedTime;
    alarmActive = true;
    alarmRinging = false;

    alarmStatus.textContent =
        `Alarm set for ${alarmDate.toLocaleString()}`;

    challenge.classList.add("hidden");
});

// Stop alarm only if word is correct
stopAlarmBtn.addEventListener("click", () => {
    const typedWord = wordInput.value.trim().toUpperCase();
    const correctWord = targetWord.textContent;

    if (typedWord === correctWord) {
        clearInterval(soundInterval);

        if (audioContext && audioContext.state !== "closed") {
            audioContext.close();
        }

        soundInterval = null;
        audioContext = null;

        alarmRinging = false;
        challenge.classList.add("hidden");

        alarmStatus.textContent = "Good morning! You did it! 🎉";

        wordInput.value = "";

    } else {
        errorMessage.textContent =
            "Wrong word! Try again. Wake up! 😴";

        wordInput.value = "";
        wordInput.focus();
    }
});

// Allow Enter key to submit
wordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        stopAlarmBtn.click();
    }
});

// Start the clock
updateClock();
setInterval(updateClock, 1000);