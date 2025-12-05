const hallConfig = {
    totalRows: 12,
    occupied: [2, 5, 12, 15, 23, 34, 45, 56, 67, 78, 89, 100, 111, 122, 133, 144, 155, 166, 177, 188]
};

const prices = { usual: 440, comfort: 490 };
let selected = [];
let selectedDetails = [];
let comfortSeats = [];

// Функция для расчета индекса места
function calculateSeatIndex(row, col) {
    let index = 0;
    
    for (let r = 1; r < row; r++) {
        if (r === 1) {
            index += 16; // Первый ряд: 16 мест (8 + 8)
        } else if (r === 12) {
            index += 26; // Последний ряд: 26 мест
        } else {
            index += 22; // Остальные ряды: по 22 места
        }
    }
    
    index += col;
    return index;
}

// Функция для получения количества мест в ряду
function getSeatsInRow(row) {
    if (row === 1) return 16;
    if (row === 12) return 26;
    return 22;
}

// Функция для получения row и col из индекса (обратная calculateSeatIndex)
function getRowColFromIndex(index) {
    let row = 1;
    let remainingIndex = index;
    
    while (row <= 12) {
        const seatsInRow = getSeatsInRow(row);
        
        if (remainingIndex <= seatsInRow) {
            return { row, col: remainingIndex };
        }
        
        remainingIndex -= seatsInRow;
        row++;
    }
    
    return { row: 0, col: 0 }; // Не должно произойти
}

// Генерация комфортных мест
function generateComfortSeats() {
    comfortSeats = [];
    
    // Ряды 6-11: места 5-18
    for (let row = 6; row <= 11; row++) {
        for (let col = 5; col <= 18; col++) {
            comfortSeats.push(calculateSeatIndex(row, col));
        }
    }
    
    // Ряд 12: места 7-20
    for (let col = 7; col <= 20; col++) {
        comfortSeats.push(calculateSeatIndex(12, col));
    }
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    generateComfortSeats();
    initHall();
    updateDateTime(); // Добавлен вызов этой функции
    setupEventListeners();
});

// Инициализация зала
function initHall() {
    const seats = document.getElementById("seats");
    const rowLeft = document.getElementById("row-left");
    const rowRight = document.getElementById("row-right");

    seats.innerHTML = '';
    rowLeft.innerHTML = '';
    rowRight.innerHTML = '';

    // Номера рядов
    for (let i = 1; i <= hallConfig.totalRows; i++) {
        const l = document.createElement("div");
        l.className = "row-number";
        l.textContent = i;
        rowLeft.appendChild(l);

        const r = document.createElement("div");
        r.className = "row-number";
        r.textContent = i;
        rowRight.appendChild(r);
    }

    // Создание мест
    for (let row = 1; row <= hallConfig.totalRows; row++) {
        const rowContainer = document.createElement("div");
        rowContainer.className = "seat-row";
        
        let seatsInThisRow = 22;
        if (row === 12) seatsInThisRow = 26;
        
        for (let col = 1; col <= seatsInThisRow; col++) {
            // Для первого ряда: пропускаем места 9-14
            if (row === 1 && col >= 9 && col <= 14) {
                const emptySpace = document.createElement("div");
                emptySpace.className = "empty-space";
                rowContainer.appendChild(emptySpace);
                continue;
            }
            
            const seat = createSeat(row, col);
            rowContainer.appendChild(seat);
        }
        
        seats.appendChild(rowContainer);
    }
}

// Создание места
function createSeat(row, col) {
    const seat = document.createElement("div");
    seat.classList.add("seat");
    seat.dataset.row = row;
    seat.dataset.col = col;
    
    const index = calculateSeatIndex(row, col);
    seat.dataset.index = index;
    
    const isOccupied = hallConfig.occupied.includes(index);
    const isComfort = comfortSeats.includes(index);
    
    seat.dataset.type = isOccupied ? "occupied" : (isComfort ? "comfort" : "usual");

    // Иконка места
    const img = document.createElement("img");
    img.className = "seat-svg";
    
    if (isOccupied) {
        img.src = "Images/charm.svg";
    } else if (isComfort) {
        img.src = "Images/charmVIP.svg";
    } else {
        img.src = "Images/charmFREE.svg";
    }
    
    img.alt = `Место ${col}, Ряд ${row}`;
    seat.appendChild(img);

    // Номер места
    const seatNumber = document.createElement("div");
    seatNumber.className = "seat-number";
    
    if (row === 1) {
        if (col <= 8) {
            seatNumber.textContent = col;
        } else {
            seatNumber.textContent = col + 6; // col 9-16 → 15-22
        }
    } else {
        seatNumber.textContent = col;
    }
    
    seat.appendChild(seatNumber);

    // События
    if (!isOccupied) {
        seat.addEventListener("mouseenter", () => handleMouseEnter(seat, img));
        seat.addEventListener("mouseleave", () => handleMouseLeave(seat, img));
        seat.addEventListener("click", () => handleSeatClick(seat, index, row, col));
    }

    return seat;
}

// Наведение мыши
function handleMouseEnter(seat, img) {
    if (seat.classList.contains("selected")) {
        // Для выбранного места показываем стандартную иконку
        if (seat.dataset.type === "comfort") {
            img.src = "Images/charmVIP.svg";
        } else {
            img.src = "Images/charmFREE.svg"; // Исправлено с charm.svg на charmFREE.svg
        }
    } else {
        if (seat.dataset.type === "comfort") {
            // Для VIP мест показываем специальную иконку
            img.src = "Images/DubleVIP.svg"; // Ваша новая иконка для VIP
        } else {
            // Для обычных мест стандартная иконка билета
            img.src = "Images/lets-icons_ticket-alt-light.svg";
        }
    }
}

// Уход мыши
function handleMouseLeave(seat, img) {
    if (seat.classList.contains("selected")) {
        img.src = "Images/charmSELECT.svg";
    } else {
        // Возвращаем исходную иконку
        if (seat.dataset.type === "comfort") {
            img.src = "Images/charmVIP.svg";
        } else if (seat.dataset.type === "usual") {
            img.src = "Images/charmFREE.svg";
        }
        // Для occupied не обрабатываем - у них нет событий
    }
}

// Клик по месту
function handleSeatClick(seat, index, row, col) {
    const img = seat.querySelector("img");
    
    if (seat.classList.contains("selected")) {
        // Снятие выбора
        seat.classList.remove("selected");
        selected = selected.filter(x => x !== index);
        selectedDetails = selectedDetails.filter(d => d.index !== index);
        // Возвращаем стандартную иконку
        if (seat.dataset.type === "comfort") {
            img.src = "Images/charmVIP.svg";
        } else {
            img.src = "Images/charmFREE.svg";
        }
    } else {
        // Выбор места
        seat.classList.add("selected");
        selected.push(index);
        
        const seatType = seat.dataset.type;
        const seatPrice = prices[seatType];
        selectedDetails.push({ 
            index, 
            type: seatType, 
            price: seatPrice, 
            row, 
            col 
        });
        
        // Проверка на промежутки
        if (checkForGapsInRow()) {
            showError();
            seat.classList.remove("selected");
            selected = selected.filter(x => x !== index);
            selectedDetails = selectedDetails.filter(d => d.index !== index);
            // Возвращаем исходную иконку
            if (seat.dataset.type === "comfort") {
                img.src = "Images/charmVIP.svg";
            } else {
                img.src = "Images/charmFREE.svg";
            }
            return;
        }
        
        img.src = "Images/charmSELECT.svg";
    }
    
    updateUI();
}

// Проверка промежутков (исправленная версия)
function checkForGapsInRow() {
    if (selected.length < 2) return false;
    
    // Группируем выбранные места по рядам
    const seatsByRow = {};
    
    selectedDetails.forEach(detail => {
        if (!seatsByRow[detail.row]) seatsByRow[detail.row] = [];
        seatsByRow[detail.row].push(detail.col);
    });
    
    // Проверяем каждый ряд на наличие промежутков
    for (const row in seatsByRow) {
        if (seatsByRow[row].length > 1) {
            const cols = seatsByRow[row].sort((a, b) => a - b);
            for (let i = 1; i < cols.length; i++) {
                if (cols[i] - cols[i - 1] > 1) {
                    return true; // Найден промежуток
                }
            }
        }
    }
    
    return false; // Промежутков нет
}

// Показать ошибку
function showError() {
    const errorMsg = document.getElementById("error-message");
    if (errorMsg) {
        errorMsg.style.display = "block";
        setTimeout(() => errorMsg.style.display = "none", 3000);
    }
}

// Обновление UI (оптимизированная версия)
function updateUI() {
    const continueBtn = document.getElementById("continue-btn");
    const buyAllBtn = document.getElementById("buy-all-btn");
    const container = document.getElementById("selected-seats-container");
    const tbody = document.getElementById("selected-seats-tbody");
    
    // Создаем tbody если его нет
    if (!tbody) {
        const list = document.getElementById("selected-seats-list");
        if (list) {
            const table = document.createElement("table");
            table.className = "selected-seats-table";
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Ряд и место</th>
                        <th>Тип места</th>
                        <th>Взрослый и цена</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="selected-seats-tbody"></tbody>
            `;
            list.innerHTML = '';
            list.appendChild(table);
        }
    }
    
    const currentTbody = document.getElementById("selected-seats-tbody");
    
    // Кнопка продолжить
    if (selected.length > 0 && continueBtn) {
        continueBtn.classList.add("active");
        continueBtn.disabled = false;
        const totalPrice = selectedDetails.reduce((sum, d) => sum + d.price, 0);
        continueBtn.textContent = `ПРОДОЛЖИТЬ (${totalPrice} ₽)`;
        
        // Показываем контейнер с выбранными местами
        if (container) container.classList.add("visible");
        
        // Обновляем таблицу
        if (currentTbody) {
            currentTbody.innerHTML = '';
            selectedDetails.forEach(detail => {
                const row = document.createElement("tr");
                row.className = "selected-seat-row";
                row.innerHTML = `
                    <td class="seat-info">
                        Ряд ${detail.row}, Место ${detail.col}
                    </td>
                    <td class="seat-type">
                        ${detail.type === "comfort" ? "Комфорт" : "Обычное"}
                    </td>
                    <td class="seat-price">
                        <div>Взрослый</div>
                        <div class="price">${detail.price} ₽</div>
                    </td>
                    <td class="remove-cell">
                        <button class="remove-seat-btn" onclick="removeSeat(${detail.index})">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                <circle cx="12" cy="12" r="11" fill="none" stroke="white" stroke-width="2"/>
                            </svg>
                        </button>
                    </td>
                `;
                currentTbody.appendChild(row);
            });
        }
    } else {
        if (continueBtn) {
            continueBtn.classList.remove("active");
            continueBtn.disabled = true;
            continueBtn.textContent = "ПРОДОЛЖИТЬ";
        }
        if (container) container.classList.remove("visible");
    }
    
    // Кнопка выкупить зал (оставлена логика из оригинала)
    if (buyAllBtn) {
        // Рассчитываем количество свободных мест
        let totalSeats = 0;
        for (let row = 1; row <= 12; row++) {
            totalSeats += getSeatsInRow(row);
        }
        const freeSeats = totalSeats - hallConfig.occupied.length;
        buyAllBtn.disabled = selected.length === freeSeats;
    }
}

// Удалить место
function removeSeat(index) {
    const seat = document.querySelector(`[data-index="${index}"]`);
    if (seat) {
        seat.click();
    }
}

// Обновление даты и времени
function updateDateTime() {
    const times = ['10:40', '13:10', '15:40', '18:10', '20:35', '23:00'];
    const randomTime = times[Math.floor(Math.random() * times.length)];
    const timeElement = document.getElementById("session-time");
    if (timeElement) timeElement.textContent = randomTime;
    
    const now = new Date();
    const options = { day: '2-digit', month: 'long' };
    const formattedDate = now.toLocaleDateString('ru-RU', options);
    const dateElement = document.getElementById("current-date");
    if (dateElement) dateElement.textContent = formattedDate;
}

// Настройка слушателей событий
function setupEventListeners() {
    const buyAllBtn = document.getElementById("buy-all-btn");
    const continueBtn = document.getElementById("continue-btn");
    
    if (buyAllBtn) {
        buyAllBtn.addEventListener("click", () => {
            const dialog = document.getElementById("dialog-overlay");
            if (dialog) dialog.classList.add("visible");
        });
    }
    
    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            if (selected.length > 0) {
                alert("Переход к оплате...");
            }
        });
    }
}

// Закрыть диалог
function closeDialog() {
    const dialog = document.getElementById("dialog-overlay");
    if (dialog) dialog.classList.remove("visible");
}

// Подтвердить выкуп зала
function confirmBuyAll() {
    // Выбираем все свободные места
    for (let row = 1; row <= hallConfig.totalRows; row++) {
        const seatsInRow = getSeatsInRow(row);
        for (let col = 1; col <= seatsInRow; col++) {
            // Пропускаем пустые места в первом ряду
            if (row === 1 && col >= 9 && col <= 14) continue;
            
            const index = calculateSeatIndex(row, col);
            if (!hallConfig.occupied.includes(index) && !selected.includes(index)) {
                const seat = document.querySelector(`[data-index="${index}"]`);
                if (seat) seat.click();
            }
        }
    }
    closeDialog();
}