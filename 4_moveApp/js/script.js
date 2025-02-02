const API_KEY = '77327170-4af5-42d2-b14b-32d1a507b406';
const API_URL_POPULAR =
    'https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_POPULAR_MOVIES&page=';
const API_URL_SEARCH =
    'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=';
const API_URL_MOVIE_DETAILS = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';

//переменная для проверки типа запроса (Основной или поиск по ключевому слову)
let typeOfFetch = 'items';
//переменная для сохранения настоящего ключевого слова
let keywordSearch = '';

getMovies(API_URL_POPULAR);

//Функция которая получает фильмы от API
async function getMovies(url) {
    try {
        const resp = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY,
            },
        });

        const respData = await resp.json();

        showMovies(respData);

    } catch (err) {
        window.location.replace('index.html');
        console.error('Произошла ошибка!', err);
    }
};

//Функция которая окрашивает рамку оценки фильма
function getClassByRate(rate) {
    if (rate >= 7) {
        return 'green'
    }
    if (rate > 5) {
        return 'orange'
    }
    return 'red'
}

//Фнукция которая выводит фильмы 
function showMovies(data) {
    const moviesEl = document.querySelector('.film-list__movies');


    // console.log (`это данные которые пришли в showMovies - `);
    // console.log (data);


    //очищаем предыдущие фильмы и пагинацию
    document.querySelector('.film-list__movies').innerHTML = '';
    document.querySelector('.pagination').innerHTML = '';

    //У запроса популярных фильмоф свойство с рэтингом называется ratingKinopoisk
    //У поиска по ключевым словам свойство рэйтинга называется rating
    let arrName = 'items';
    let nameRate = 'ratingKinopoisk';
    

    if (data.films){
        arrName = 'films';
        nameRate = 'rating';
    }
    
    //Определяем тип запроса
    typeOfFetch = arrName;

    //Создаем карточки фильмов на основе полученных данных
    data[arrName].forEach((movie) => {
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
                        <div class="movie__cover-inner">
                            <img class="movie__cover"
                             src="${movie.posterUrlPreview}"
                             alt="${movie.nameRu}">
                            <div class="movie__cover--darkened"></div>
                        </div>
                        <div class="movie__info">
                            <div class="movie__title">${movie.nameRu}</div>
                            <div class="movie__category">${movie.genres.map(
            (genre) => ` ${genre.genre}`
        )}</div>
                            ${movie[nameRate] !== 'null' && movie[nameRate] ?
                `<div class="movie__average movie__average_${getClassByRate(movie[nameRate])}">
                            ${movie[nameRate]}</div>` : ''
            }
                        </div>        
            `;
        movieEl.addEventListener('click', () => openModal(movie.filmId || movie.kinopoiskId))
        moviesEl.appendChild(movieEl);
    });


    //Вызываем функцию для отрисовки пагинации
    //для API_URL_POPULAR
    if (data.totalPages) {
        displayPagination(data.totalPages);
        return;
    }
    //для API_URL_SEARCH
    data.pagesCount > 20
        ? displayPagination(20)
        : displayPagination(data.pagesCount)
}



//Реализация поиска по ключевым словам
const form = document.querySelector('form');
const search = document.querySelector('.header__search');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const apiSearchUrl = `${API_URL_SEARCH}${search.value}`;

    if (search.value) {
        getMovies(apiSearchUrl);
        keywordSearch = search.value;
        currentPage = 1;
        search.value = '';
    }
})


//Модальное окно

const modalEl = document.querySelector(".modal");

//Функция для открытия модального окна
async function openModal(id) {
    try {
        const resp = await fetch(API_URL_MOVIE_DETAILS + id, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY,
            },
        });
        const respData = await resp.json();

        modalEl.classList.add('modal--show');
        document.body.classList.add('stop-scrolling');

        // рисовка попапа
        modalEl.innerHTML = `
                    <div class="modal__card">
                        <img src="${respData.posterUrl}" alt="${respData.nameRu}" class="modal__movie-backdrop">
                            
                        <h2 class="modal__title">
                            <span class="modal__movie-title">${respData.nameRu},</span>
                            <span class="modal__movie-release-year"> ${respData.year}</span>
                        </h2>
                        <ul class="modal__movie-info">
                            <div class="loader"></div>
                            <li class="modal__movie-genre"><span class='modal__movie-info_grey'>
                                Жанр:</span> ${respData.genres.map((el) => `<span>${el.genre}</span> `)}
                            </li>
                            ${respData.filmLength ? `<li class="modal__movie-runtime"><span class='modal__movie-info_grey'>Время:</span> ${respData.filmLength} минут</li>` : ''}
                            <li><span class='modal__movie-info_grey'>Сайт:</span> <a href="${respData.webUrl}" class="modal__movie-site">${respData.webUrl}</a></li>
                            <li class="modal__movie-overview"><span class='modal__movie-info_grey'>Описание:</span> ${respData.description}</li>
                        </ul>
                        <button type="button" class="modal__button-close">Закрыть</button>
                    </div>
                `

        const btnClose = document.querySelector('.modal__button-close')

        // Закрытие попапа по нажатию на кнопку
        btnClose.addEventListener('click', () => closeModal());
    } catch (err) {
        console.error('Произошла ошибка!', err.message);
        closeModal();
    }

}
// Функция дла закрытия попапа
function closeModal() {
    modalEl.classList.remove('modal--show');
    document.body.classList.remove('stop-scrolling');
}
//Зыкрытие попапа при нажатие на пустую область
window.addEventListener('click', (e) => {
    if (e.target === modalEl) {
        closeModal();
    }
})
//Зыкрытие попапа при нажатие на Esc
window.addEventListener('keydown', (e) => {
    if (e.keyCode === 27) {
        closeModal();
    }
})


//Реализация пагинации
//Первая страница
let currentPage = 1;

//фунцкия отрисовки пагинации
function displayPagination(pagesCount) {

    const paginationEl = document.querySelector('.pagination');
    const ulEl = document.createElement('ul');
    ulEl.classList.add('pagination__list');

    //Если страниц больше 5
    if (pagesCount > 5) {
        createArrDisplayPages(pagesCount, currentPage).forEach((page) => {
            const liEl = displayPaginationBtn(page);
            ulEl.appendChild(liEl);
        });
    }

    //Если страниц меньше 6, то просто отрисовываем все что есть
    if (pagesCount < 6) {
        for (let i = 0; i < pagesCount; i++) {
            const liEl = displayPaginationBtn(i + 1);
            ulEl.appendChild(liEl);
        }
    }
    paginationEl.appendChild(ulEl);
}




//функция которая принимает общее количестов страниц по запросу и активную страницу
//а возвращает массив со страницами которые нужно отрисовать в пагинации
function createArrDisplayPages(totalPages, selectedPage) {
    const pages = [];

    // Добавляем начальные страницы (если выбранная страница > 3)
    if (selectedPage > 3) {
        pages.push(1);
        pages.push('...');
        // Добавляем выбранную страницу и страницы вокруг неё (по 1 в каждую сторону),
        // только если это не последние 3 страницы
        if (selectedPage < totalPages - 2)
            for (let i = Math.max(1, selectedPage - 1); i <= Math.min(totalPages, selectedPage + 1); i++) {
                pages.push(i);
            }
    }
    // Добавляем начальные страницы (если выбранная страница < 4)
    if (selectedPage < 4) {
        for (i = 0; i < 4; i++) {
            pages.push(i + 1);
        }
    }
    // Добавляем конечные страницы (если выбранны не последние 3 страницы)
    if (selectedPage < totalPages - 2) {
        pages.push('...');
        pages.push(totalPages);
    }
    // Добавляем конечные страницы (если выбранны последние 3 страницы)
    if (selectedPage > totalPages - 3) {
        for (i = 3; i >= 0; i--) {
            pages.push(totalPages - i);
        }
    }

    return pages;
}

//Функция для заполнения пагинации страницами
function displayPaginationBtn(page) {
    const liEl = document.createElement('li');
    liEl.classList.add('pagination__item');
    liEl.innerText = page;

    //выделение активной страницы
    if (currentPage === page) {
        liEl.classList.add('pagination__item_active');
    }

    page !== '...'  
        //добавляем обработчик нажатия на страничку
        ? liEl.addEventListener('click', () => {
            currentPage = page;

            // в зависимости от типа запроса? вызываем нужный API_URL
            typeOfFetch === 'items'
                ? getMovies(API_URL_POPULAR + currentPage)
                : getMovies(API_URL_SEARCH + keywordSearch + '&page=' + currentPage)

            //удаляем предыдущую активную страницу
            let currentItemLi = document.querySelector('li.pagination__item_active');
            currentItemLi.classList.remove('pagination__item_active');

            //выделяем выбранную страницу
            liEl.classList.add('pagination__item_active');
        })

        //многоточию убираем курсор поинтер
        : liEl.classList.add('pagination__item_ellipsis')

    return liEl;
}



