import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';
import SearchApiService from './search-service.js';


const searchForm = document.querySelector('.search-form');
const galleryItems = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const searchBtn = document.querySelector('.js-search-btn');

const picturesApiService = new SearchApiService();

searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

buttonHidden();

let simpleLightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
});

async function onSearch(e) {
    e.preventDefault();
    
    picturesApiService.query = e.target.elements.searchQuery.value;
    searchBtn.disabled = true;

    picturesApiService.resetPage();
    await picturesApiService.fetchPictures().then(response => {
    
        const responseHits = response.data.hits;
        const totalHits = response.data.totalHits;

        if (response.data.hits.length === 0) {
            Notiflix.Notify.info('Sorry, there are no images matching your search query. Please try again.');
            e.target.reset();
            galleryItems.innerHTML = '';
            return;
        }
    
        if (totalHits > 1) {
            buttonShow();
        }
    
        if (picturesApiService.query === '') {
                clearAll();
                buttonHidden();
                Notiflix.Notify.info('You cannot search by empty field, try again.');
                return;
        } else {
            Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
            buttonShow();
            
            clearPicturesContainer();
            
        galleryItems.innerHTML = createImageCards(responseHits);
        simpleLightbox.refresh();
    }})
    .catch(err => {
        console.log(err);
    })
    .finally(() => {
        searchBtn.disabled = false;
    });
}

function onLoadMore () {
    picturesApiService.page += 1;

    picturesApiService.fetchPictures().then(response => {
        const responseHits = response.data.hits;
        galleryItems.insertAdjacentHTML('beforeend', createImageCards(responseHits))
        simpleLightbox.refresh();
    });

    const totalPages = page * 40;

    if (response.data.totalHits <= totalPages) {
        buttonHidden();
        Notiflix.Report.info("We're sorry, but you've reached the end of search results.");
    }
    
    smoothScroll();
}

function createImageCards (responseHits) {
    const markup = responseHits.map(({ largeImageURL, webformatURL, tags, likes, views, comments, downloads }) => {
        return `<div class="photo-card">
                <a href="${largeImageURL}"><img class="photo" src="${webformatURL}" alt="${tags}" title="${tags}" loading="lazy"/></a>
                <div class="info">
                    <p class="info-item">
                        <b>Likes</b> <span class="info-item-api"> ${likes} </span>
                    </p>
                    <p class="info-item">
                        <b>Views</b> <span class="info-item-api">${views}</span>  
                    </p>
                    <p class="info-item">
                        <b>Comments</b> <span class="info-item-api">${comments}</span>  
                    </p>
                    <p class="info-item">
                        <b>Downloads</b> <span class="info-item-api">${downloads}</span> 
                    </p>
                </div>
                </div>`;
    }).join('');
    return markup;
}

function clearPicturesContainer() {
    galleryItems.innerHTML = '';
}




function buttonHidden() {
    loadMoreBtn.classList.add("visually-hidden");
};

function buttonShow() {
    setTimeout(() => {
        loadMoreBtn.classList.remove("visually-hidden");
        isBtnVisible = false;
    }, 3000);
};

function smoothScroll() {
    const { height: cardHeight } =
        document.querySelector(".photo-card").firstElementChild.getBoundingClientRect();
    window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
});
}
