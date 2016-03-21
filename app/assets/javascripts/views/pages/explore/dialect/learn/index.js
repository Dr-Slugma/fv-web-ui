/*
Copyright 2016 First People's Cultural Council

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import provide from 'react-redux-provide';

import RaisedButton from 'material-ui/lib/raised-button';
import CircularProgress from 'material-ui/lib/circular-progress';

// Models
import Word from 'models/Word';
import Words from 'models/Words';
import Phrase from 'models/Phrase';
import Phrases from 'models/Phrases';

// Operations
import DocumentOperations from 'operations/DocumentOperations';
import DirectoryOperations from 'operations/DirectoryOperations';

import EditableComponent from 'views/components/Editor/EditableComponent';
import StatsPanel from 'views/components/Dashboard/StatsPanel';

/**
* Learn portion of the dialect portal
*/
@provide
export default class DialectLearn extends Component {

  static propTypes = {
    properties: PropTypes.object.isRequired,
    navigateTo: PropTypes.func.isRequired,
    windowPath: PropTypes.string.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    fetchDialect: PropTypes.func.isRequired,
    updateDialect: PropTypes.func.isRequired,
    computeDialect: PropTypes.object.isRequired,
    fetchPortal: PropTypes.func.isRequired,
    computePortal: PropTypes.object.isRequired,
    fetchDialectStats: PropTypes.func.isRequired,
    computeDialectStats: PropTypes.object.isRequired    
  };

  constructor(props, context){
    super(props, context);

    this.state = {
      wordCount: null,
      phraseCount: null
    };

    // Pre-fetch words and phrases to speed up display and extract count
    //this._getPhrasesAndSetResultSize(props);
    //this._getWordsAndSetResultSize(props);

    //this._handlePhrasesDataRequest = this._handlePhrasesDataRequest.bind(this);
    //this._handleWordsDataRequest = this._handleWordsDataRequest.bind(this);
    
    // Bind methods to 'this'
    ['_onNavigateRequest'].forEach( (method => this[method] = this[method].bind(this)) );
  }

  _onNavigateRequest(path) {
    const destination = this.props.navigateTo(path);
    const newPathArray = this.props.splitWindowPath.slice();

    newPathArray.push(destination.path);

    this.props.pushWindowPath('/' + newPathArray.join('/'));
  }

  fetchData(newProps) {
    let path = newProps.splitWindowPath.slice(1, newProps.splitWindowPath.length - 1).join('/');

    // TODO: 
    Promise.all([
     newProps.fetchDialect('/' + path),
     newProps.fetchPortal('/' + path + '/Portal')
    ]).then((values) => {
    	console.log(values);
    	newProps.fetchDialectStats('/' + path)
    });
  }

  // Fetch data on initial render
  componentDidMount() {
    this.fetchData(this.props);
  }

  // Refetch data on URL change
  componentWillReceiveProps(nextProps) {
    if (nextProps.windowPath !== this.props.windowPath) {
      this.fetchData(nextProps);
    }
  }

  // Handle change of params when navigating within router
  // See https://github.com/rackt/react-router/blob/latest/docs/guides/advanced/ComponentLifecycle.md
  componentDidUpdate (prevProps) {
    let oldDialect = prevProps.dialect;
    let newDialect = this.props.dialect;

    if (newDialect !== oldDialect && newDialect != null) {
      if (this.state.wordCount == null) this._getWordsAndSetResultSize(this.props);
      if (this.state.phraseCount == null) this._getPhrasesAndSetResultSize(this.props);
    }
  }

  _getPhrasesAndSetResultSize(props){
    this._handlePhrasesDataRequest(props).then((function(phrases){
      this.setState({
        phraseCount: phrases.totalResultSize
      });
    }).bind(this));
  }

  _getWordsAndSetResultSize(props){
    this._handleWordsDataRequest(props).then((function(words){
      this.setState({
        wordCount: words.totalResultSize
      });
    }).bind(this));
  }

  _handlePhrasesDataRequest(childProps, page = 1, pageSize = 20) {
    return this.phraseOperations.getDocumentsByPath(
        '/sections/Data/' + this.state.dialectPath,
        {'X-NXproperties': 'dublincore, fv-phrase, fvcore'},
        {'currentPageIndex': (page - 1), 'pageSize': pageSize}
    );
  }

  _handleWordsDataRequest(childProps, page = 1, pageSize = 20) {
    return this.wordOperations.getDocumentsByPath(
        '/sections/Data/' + this.state.dialectPath,
        {'X-NXproperties': 'dublincore, fv-word, fvcore'},
        {'currentPageIndex': (page - 1), 'pageSize': pageSize}
    );
  }

  _navigate(page) {
    this.context.router.push('/explore/' + this.props.dialect.get('parentLanguageFamily').get('dc:title') + '/' + this.props.dialect.get('parentLanguage').get('dc:title') + '/' + this.props.dialect.get('dc:title') + '/learn/' + page );
  }
  
  render() {
    const { computeDialect, computePortal, computeDocument, computeDialectStats } = this.props;

    if (!computeDialectStats.success) {
        return <CircularProgress mode="indeterminate" size={5} />;
    }       
    
    let dialect = computeDialect.response;
    let portal = computePortal.response;
    let dialectStats = computeDialectStats.response;
    
    // Assign dialect prop, from parent, to all children
    let content = React.Children.map(this.props.children, function(child) {
        return React.cloneElement(child, {
          dialect: this.props.dialect,
          handlePhrasesDataRequest: this._handlePhrasesDataRequest,
          handleWordsDataRequest: this._handleWordsDataRequest
        });
    }, this);

    // If no children, render main content.
    if (!this.props.children) {
      content = <div className="row">
                
        <div className={classNames('col-xs-12', 'col-md-8')}>
          <h1>About our Language</h1>
          <EditableComponent computeEntity={this.props.computeDialect} updateEntity={this.props.updateDialect} property="dc:description" />

          <div className="row">
	          <div className={classNames('col-xs-12', 'col-md-6')}>
	            <h1>{(this.props.dialect) ? this.props.dialect.get('dc:title') : ''} Alphabet</h1>
	          	<p>First words here</p>
		      </div>	
		      <div className={classNames('col-xs-12', 'col-md-6')}>
		        <h1>Keyboards</h1>
		        <p>Keyboards go here</p>
		      </div> 
	      </div>
	      <div className="row">
		      <div className={classNames('col-xs-12', 'col-md-12')}>
		        <h1>Contact Info</h1>
		        <p>Status of our language here.</p>
		      </div>
	      </div>
        </div>
        <div className={classNames('col-xs-12', 'col-md-4')}>
          <StatsPanel data={dialectStats} childElementName="words" headerText="Words" />
          <StatsPanel data={dialectStats} childElementName="phrases" headerText="Phrases" />
        </div>
      </div>
    }

    return <div>
            <div className="row">
              <div className="col-xs-12">
                <div>
                  <RaisedButton onTouchTap={this._onNavigateRequest.bind(this, 'words')} label={(this.state.wordCount == null) ? "Words (0)" : "Phrases (" + this.state.wordCount + ")"} secondary={true} /> 
                  <RaisedButton onTouchTap={this._onNavigateRequest.bind(this, 'phrases')} label={(this.state.phraseCount == null) ? "Phrases (0)" : "Phrases (" + this.state.phraseCount + ")"} secondary={true} /> 
                  <RaisedButton onTouchTap={this._onNavigateRequest.bind(this, 'songs')} label="Songs" secondary={true} /> 
                  <RaisedButton onTouchTap={this._onNavigateRequest.bind(this, 'stories')} label="Stories" secondary={true} /> 
                </div>
              </div>
            </div>

            {content}
        </div>;
  }
}