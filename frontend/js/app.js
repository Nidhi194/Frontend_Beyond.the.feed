// Project Manager of whole project

import {
  renderAboutPage,
  renderArticlePage,
  renderCategoryPage,
  renderHomePage,
  renderShell
} from './render.js';

document.addEventListener('DOMContentLoaded', () => {
  renderShell();

  const page = document.body.dataset.page || 'home'; //page type is identified using this data attribute in the body tag of each page

  if (page === 'home') renderHomePage();
  if (page === 'category') renderCategoryPage();
  if (page === 'article') renderArticlePage();
  if (page === 'about') renderAboutPage();
});