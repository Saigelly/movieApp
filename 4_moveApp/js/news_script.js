const API_KEY = '77327170-4af5-42d2-b14b-32d1a507b406';
const API_URL_NEWS = 'https://kinopoiskapiunofficial.tech/api/v1/media_posts?page=';


getNews(API_URL_NEWS);

async function getNews(url) {
    try{
        const resp = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY,
            },
        });

        const respData = await resp.json();
        
        showNews(respData);
    } catch (err){
        console.error('Произошла ошибка!', err);
    }
    
}


function showNews(data){
    const newsEl = document.querySelector('.news__feed');

    document.querySelector('.news__feed').innerHTML = '';

    data.items.forEach((newEx) => {
        const newEl = document.createElement('a');
        newEl.classList.add('feed');
        newEl.setAttribute('href', newEx.url)
        newEl.innerHTML = `
        
                            <div class="feed__img">
                                <img src="${newEx.imageUrl}" alt="${newEx.title}">
                            </div>
                            <div class="feed__content">
                                <h2 class="feed__title">${newEx.title}</h2>
                                <p class="feed__description">${newEx.description}</p>
                                
                                <p class="feed__published-info">${newEx.publishedAt}</p>
                            </div>

                        </div>
        `;
        newsEl.appendChild(newEl);
    });
}