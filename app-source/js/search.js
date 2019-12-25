'use strict'

const Store				= require( 'electron-store' )
const JsSearch			= require( 'js-search' )
const stemmer			= require( 'stemmer' )
const removeMarkdown	= require( 'remove-markdown' )
const $					= require( 'jquery' )
const log				= require( 'electron-log' )

const sanitize			= require( './sanitize-category.min' )

const store				= new Store()
const database			= new Store({name: 'database'})



module.exports.searchNotes = function( term, callback ) {
	
	let data	= database.get( 'notes' ),
		cat 	= store.get('categories.selected'),
		notes	= [],
		result	= []
	
	for( let item of data ) {
		
		item.content = removeMarkdown( item.content )
		let catClass = sanitize.sanitizeCategory( item.category )
		
		notes.push({
			id: item.id,
			content: item.content,
			category: catClass,
			favorite: item.favorite
		})
	}
	
	let search = new JsSearch.Search( 'id' )
	
	search.tokenizer = new JsSearch.StemmingTokenizer( stemmer, new JsSearch.SimpleTokenizer())
	
	search.addIndex( 'content' )
	search.addDocuments( notes )
	let filtered = search.search( term )
	
	for( let item of filtered ) {
		
		result.push( item.id )
	}
	
	callback( result )
}