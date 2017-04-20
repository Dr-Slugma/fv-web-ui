import React, {Component, PropTypes} from 'react';
import Immutable, { List, Map } from 'immutable';

import selectn from 'selectn';
import DOMPurify from 'dompurify';

import GridTile from 'material-ui/lib/grid-list/grid-tile';

import UIHelpers from 'common/UIHelpers';

export default class SearchResultTile extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      showInfo: false
    }
  }

  _getSubtitle() {
	  return 'test';
  }

  render() {

    let tile = this.props.tile;

	let type = selectn('type', tile);
	let desc = selectn('properties.dc:description', tile);
	let title = selectn('properties.dc:title', tile);
	let subtitle = '';
	let path = [selectn('contextParameters.ancestry.family.dc:title', tile), selectn('contextParameters.ancestry.language.dc:title', tile), selectn('contextParameters.ancestry.dialect.dc:title', tile)];
	let imgObj = null;
	let targetPath = this.props.tile;

	switch (type) {
		case 'FVWord': 
			imgObj = selectn('contextParameters.word.related_pictures[0]', tile);

			let literal_translations = selectn('properties.fv:literal_translation', tile) || [];
			let lt_s = (selectn('length', literal_translations) > 0) ? 'Translation(s): ' : '';

			subtitle = lt_s + (literal_translations.map((v, k) => v.translation).join(', '));

			let output = [];

			let definitions = selectn('properties.fv:definitions', tile) || [];
			(definitions.length > 0) ? output.push('<em>Definition(s)</em>: ' + definitions.map((v, k) => v.translation ).join(', ')) : null;
			
			let part_of_speech = selectn('properties.fv-word:part_of_speech', tile);
			(part_of_speech) ? output.push('<em>Part of Speech</em>: ' + part_of_speech) : null;

			let pronunciation = selectn('properties.fv-word:pronunciation', tile);
			(pronunciation) ? output.push('<em>Pronunciation</em>: ' + pronunciation) : null;

			let categories = selectn('contextParameters.word.categories', tile) || [];
			(categories.length > 0) ? output.push('<em>Categories</em>: ' + (categories.map((v, k) => selectn('dc:title', v) ).join(', '))) : null;

			desc = output.join(', ');
			targetPath = selectn('path', tile).replace('/Dictionary/', '/learn/words/');
		break;

		case 'FVPhrase':
			imgObj = selectn('contextParameters.phrase.related_pictures[0]', tile);

			let p_literal_translations = selectn('properties.fv:literal_translation', tile) || [];
			let p_lt_s = (selectn('length', p_literal_translations) > 0) ? 'Translation(s): ' : '';

			subtitle = p_lt_s + (p_literal_translations.map((v, k) => v.translation).join(', '));

			let p_output = [];

			let p_definitions = selectn('properties.fv:definitions', tile) || [];
			(p_definitions.length > 0) ? p_output.push('<em>Definition(s)</em>: ' + p_definitions.map((v, k) => v.translation ).join(', ')) : null;

			let p_categories = selectn('contextParameters.phrase.phrase_books', tile) || [];
			(p_categories.length > 0) ? p_output.push('<em>Phrase Books</em>: ' + (p_categories.map((v, k) => selectn('dc:title', v) ).join(', '))) : null;

			desc = p_output.join(', ');

			targetPath = selectn('path', tile).replace('/Dictionary/', '/learn/phrases/');
		break;

		case 'FVPortal':
			type = 'Dialect';
			title = selectn('contextParameters.ancestry.dialect.dc:title', tile);
			imgObj = selectn('contextParameters.portal.fv-portal:logo', tile);

			desc = DOMPurify.sanitize(selectn('properties.fv-portal:about', tile), {ALLOWED_TAGS: []});
			desc = (desc.length > 300) ? '...' + desc.substr(desc.indexOf(this.props.searchTerm) - 50, 250) + '...' : desc;

			targetPath = selectn('contextParameters.ancestry.dialect.path', tile);
		break;
	}

	if (desc) {
		desc = desc.replace(new RegExp(this.props.searchTerm, 'gi'), '<strong>' + this.props.searchTerm + '</strong>');
	}

    return <GridTile
			  style={{borderBottom: '1px solid #e0e0e0', margin: '20px 0', paddingTop: '65px'}}
              key={selectn('uid', tile)}
              title={<a onClick={(this.props.action) ? this.props.action.bind(this, targetPath) : null} style={{fontSize: '1.2em', cursor: 'pointer'}}>{title}<strong style={{fontSize: '0.6em'}}> [{type.replace('FV', '')}]</strong></a>}
              actionPosition="right"
			  titlePosition="top" 
              //actionIcon={actionIcon}
			  titleBackground="#ffffff"
			  subtitle={<span style={{color: 'gray', fontSize: '1.2em'}}>{subtitle}</span>}
			  >
			  <div style={{marginLeft: '16px', width: '80%'}}>
				<p><span>{(imgObj) ? <img className="pull-right" src={UIHelpers.getThumbnail(imgObj, 'Thumbnail')} alt={selectn('properties.dc:title', tile)} style={{maxHeight: '75px', marginLeft: '25px'}} /> : ''} <span dangerouslySetInnerHTML={{__html: desc}}></span></span></p>
				<p><span style={{color: 'gray'}} dangerouslySetInnerHTML={{__html: path.join(' &raquo; ')}}></span></p>
			  </div>

          </GridTile>;
  }
}