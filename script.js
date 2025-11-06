// script.js

// --- Global State ---
let currentDate = new Date();
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthYearDisplay = document.getElementById('currentMonthYear');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');
const dailyTasksList = document.getElementById('dailyTasks');

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Set a default selected date to today for the task form display
let selectedDate = new Date(); 
selectedDateDisplay.textContent = selectedDate.toDateString(); 

// --- Helper Functions ---

// Formats a Date object into the LocalStorage key date string (YYYY-MM-DD)
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to load the tasks for a specific date from LocalStorage
function getTasksForDate(dateString) {
    const key = `todo-${dateString}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// script.js (continued)

function renderCalendar() {
    calendarGrid.innerHTML = ''; // Clear existing days

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed month
    
    // Set the navigation header text
    currentMonthYearDisplay.textContent = `${MONTHS[month]} ${year}`;

    // 1. Render Weekday Headers (Semantic HTML from the CSS plan)
    WEEKDAYS.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('day-header');
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    // 2. Calculate Dates
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // Day of week (0=Sun, 6=Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Last day of the current month

    // 3. Render Blank Days (Padding for the start of the month)
    for (let i = 0; i < firstDayOfMonth; i++) {
        const blankDay = document.createElement('div');
        blankDay.classList.add('day-cell', 'blank');
        calendarGrid.appendChild(blankDay);
    }

    // 4. Render Actual Days
    const today = new Date();
    const todayString = formatDate(today);

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        dayCell.textContent = day;
        
        // Create the date object for the current cell
        const cellDate = new Date(year, month, day);
        const cellDateString = formatDate(cellDate);
        
        // Data Attributes (Crucial for click handling and data loading)
        dayCell.dataset.date = cellDateString;
        
        // Highlight Today
        if (cellDateString === todayString) {
            dayCell.classList.add('current-day');
        }

        // Highlight Days with Tasks (Checking LocalStorage)
        const tasks = getTasksForDate(cellDateString);
        if (tasks.length > 0) {
            dayCell.classList.add('has-task');
        }

        calendarGrid.appendChild(dayCell);
    }
    
    // After rendering, ensure the task list is populated for the current selected date
    updateDailyTasksView(formatDate(selectedDate)); 
}

// script.js (continued)

// --- Task/Date View Functions ---

function updateDailyTasksView(dateString) {
    const tasks = getTasksForDate(dateString);
    dailyTasksList.innerHTML = ''; // Clear previous tasks
    
    // Update the header of the task form
    const displayDate = new Date(dateString); // Convert back to Date for display
    selectedDateDisplay.textContent = displayDate.toDateString();
    selectedDate = displayDate; // Update the global selectedDate state
    
    if (tasks.length === 0) {
        dailyTasksList.innerHTML = '<li class="no-tasks">No tasks scheduled. Go add one!</li>';
        return;
    }

    // Render tasks
    tasks.sort((a, b) => a.time.localeCompare(b.time)); // Sort by time
    tasks.forEach(task => {
        const listItem = document.createElement('li');
        // Example output: (16:00) Kid A: Soccer Practice 
        listItem.innerHTML = `
            <strong>(${task.time}) ${task.familyMember}:</strong> ${task.title}
            <button class="delete-task" data-id="${task.id}" data-date="${dateString}">🗑️</button>
        `;
        dailyTasksList.appendChild(listItem);
    });
}

// --- Event Listeners for Navigation & Day Selection ---

document.getElementById('prevMonth').addEventListener('click', () => {
    // Go to the previous month
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    // Go to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Event listener for clicking a day on the calendar grid
calendarGrid.addEventListener('click', (event) => {
    const target = event.target;
    // Check if the click was on an actual day cell (not a header or blank space)
    if (target.classList.contains('day-cell') && target.dataset.date) {
        // Remove 'selected' class from all cells (optional, but good for UX)
        document.querySelectorAll('.day-cell').forEach(cell => cell.classList.remove('selected'));
        // Add 'selected' class to the clicked cell
        target.classList.add('selected');
        
        const dateString = target.dataset.date;
        updateDailyTasksView(dateString);
    }
});


// --- Initial Load ---
renderCalendar();