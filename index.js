const html = require('yo-yo')
const redux = require('redux')
const clone = require('clone')
const request = require('superagent')

const beers = require('./test-beers').beers

function beersTemplate({beers}, dispatch) {
  return html`
    <ul class="beers">
      ${beers.map(beerTemplate)}  
    </ul> 
  ` 
}

function beerTemplate(beer, dispatch) {
  return html `
    <li class="beer"> 
      <div class="beer-name">${beer.name}</div>
      <div class="brewery">${beer.brewery}</div>
      <div class="country">${beer.country}</div>
      <div class="style">${beer.style}</div>
      <div class="abv">${beer.abv}</div>
    </li> 
  ` 
}

function appTemplate(state, dispatch) {
  return html`
    <div id="app"> 
      ${errorTemplate(state)} 
      ${loadingTemplate(state)} 
      ${beersTemplate(state, dispatch)}
      <button onclick=${() => loadBeers(dispatch)}>Refresh</button>
    </div> 
  ` 
}

function errorTemplate({error}) {
  return error 
    ? html`<h2 id="error">There was an error loading ze beersies: ${error}</h2>`
    : html ``
}

function loadingTemplate({loadingBeers}) {
  return loadingBeers 
    ? html`<h2 id="loading">Loading beers...</h2>`
    : html ``
}

function reducer(state, action) {
  const newState = clone(state) 
  switch(action.type){
    case 'BEERS_ADDED':
      newState.beers = action.payload
      newState.loadingBeers = false
      newState.error = ''
      return newState
    case 'LOADING_BEERS':
      newState.loadingBeers = true 
      newState.beers = []
      return newState
    case 'LOADING_ERROR':
      newState.loadingBeers = false 
      newState.error = action.payload
      return newState
    default:
      return newState
  }
}

const {dispatch, getState, subscribe} = redux.createStore(reducer, {beers: []})

const main = document.querySelector('main')
const app = document.createElement('div')
main.appendChild(app)

subscribe(() =>{
  const state = getState()
  html.update(app, appTemplate(state, dispatch))
})

function init() {
  loadBeers(dispatch)
}

const url = 'https://rogue-beers.herokuapp.com/api/v1/beers'

function loadBeers(dispatch) {
  dispatch({type: 'LOADING_BEERS'}) 
  request
    .get(url)
    .end((err, res) =>{
      if(err) return dispatch({type: 'LOADING_ERROR', payload: err.message}) 
      dispatch({type: 'BEERS_ADDED', payload: res.body.beers}) 
    })
}

init()
