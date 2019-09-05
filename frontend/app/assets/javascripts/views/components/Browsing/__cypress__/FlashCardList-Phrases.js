import 'cypress-testing-library/add-commands'
describe('FlashcardList-Phrases.js > FlashcardList', () => {
  it('Enter flashcard mode, confirm data, paginate, confirm data, leave flashcard mode', () => {
    cy.visit('/explore/FV/sections/Data/Athabascan/Dene/Dene/learn/phrases')

    cy.FlashcardList({
      confirmData: true,
      shouldPaginate: true,
      clearFilter: true,
    })
  })
})