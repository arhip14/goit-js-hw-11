
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const API_KEY = '38252879-889a9619e4dc8706c4a00f455';
const BASE_URL = 'https://pixabay.com/api/';
const ITEMS_PER_PAGE = 40;

let page = 1;
let currentSearchQuery = '';

const lightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearGallery();
  page = 1;
  currentSearchQuery = form.elements.searchQuery.value.trim();

  if (currentSearchQuery === '') {
    return;
  }

  searchImages();
});

loadMoreBtn.addEventListener('click', () => {
  searchImages();
});

async function searchImages() {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: currentSearchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: ITEMS_PER_PAGE,
      },
    });

    const { hits, totalHits } = response.data;

    if (hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    renderImages(hits);

    if (page === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    page += 1;

    if (page > Math.ceil(totalHits / ITEMS_PER_PAGE)) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    } else {
      loadMoreBtn.style.display = 'block';
    }

    lightbox.refresh();
    scrollToNextGroup();
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
  }
}

function renderImages(images) {
  const imageCards = images.map((image) => createImageCard(image));
  gallery.insertAdjacentHTML('beforeend', imageCards.join(''));
}

function createImageCard(image) {
  const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = image;

  return `
    <div class="photo-card">
      <a href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${likes}</p>
        <p class="info-item"><b>Views:</b> ${views}</p>
        <p class="info-item"><b>Comments:</b> ${comments}</p>
        <p class="info-item"><b>Downloads:</b> ${downloads}</p>
      </div>
    </div>
  `;
}

function clearGallery() {
  gallery.innerHTML = '';
}

function scrollToNextGroup() {
  const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
