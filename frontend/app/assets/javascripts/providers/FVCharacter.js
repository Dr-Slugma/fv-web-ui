import RESTActions from 'providers/rest-actions'
import RESTReducers from 'providers/rest-reducers'

// Middleware
import thunk from 'redux-thunk'

const fetchCharacter = RESTActions.fetch('FV_CHARACTER', 'FVCharacter', {
  headers: { 'enrichers.document': 'ancestry,character,permissions' },
})
const updateCharacter = RESTActions.update('FV_CHARACTER', 'FVCharacter', {
  headers: { 'enrichers.document': 'ancestry,character,permissions' },
})
const fetchCharacters = RESTActions.query('FV_CHARACTERS', 'FVCharacter', {
  headers: { 'enrichers.document': 'character' },
})
const publishCharacter = RESTActions.execute('FV_CHARACTER_PUBLISH', 'FVPublish', {
  headers: { 'enrichers.document': 'ancestry,character,permissions' },
})

const computeCharacterFetchFactory = RESTReducers.computeFetch('character')
const computeCharactersQueryFactory = RESTReducers.computeQuery('characters')

const actions = { fetchCharacter, fetchCharacters, publishCharacter, updateCharacter }

const reducers = {
  computeCharacter: computeCharacterFetchFactory.computeCharacter,
  computeCharacters: computeCharactersQueryFactory.computeCharacters,
}

const middleware = [thunk]

export default { actions, reducers, middleware }
