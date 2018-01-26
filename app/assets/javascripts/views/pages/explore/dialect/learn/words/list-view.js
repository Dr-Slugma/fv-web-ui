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
import Immutable, { List, Map } from 'immutable';
import classNames from 'classnames';
import provide from 'react-redux-provide';
import selectn from 'selectn';

import PromiseWrapper from 'views/components/Document/PromiseWrapper';

import ProviderHelpers from 'common/ProviderHelpers';
import NavigationHelpers from 'common/NavigationHelpers';
import UIHelpers from 'common/UIHelpers';

import DocumentListView from 'views/components/Document/DocumentListView';

import DataListView from 'views/pages/explore/dialect/learn/base/data-list-view';

import Preview from 'views/components/Editor/Preview';

/**
* List view for words
*/
@provide
export default class ListView extends DataListView {
  
  static defaultProps = {
    DISABLED_SORT_COLS: ['state', 'fv-word:categories', 'related_audio', 'related_pictures'],
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_LANGUAGE: 'english',
    DEFAULT_SORT_COL: 'fv:definitions/0/translation', // 'fv:custom_order',
    DEFAULT_SORT_TYPE: 'asc',
    dialect: null,
    filter: new Map(),
    gridListView: false
  }

  static propTypes = {
    properties: PropTypes.object.isRequired,
    windowPath: PropTypes.string.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    computeLogin: PropTypes.object.isRequired, 
    fetchDialect2: PropTypes.func.isRequired,
    computeDialect2: PropTypes.object.isRequired,
    dialect: PropTypes.object,
    fetchWords: PropTypes.func.isRequired,
    computeWords: PropTypes.object.isRequired,
    routeParams: PropTypes.object.isRequired,
    filter: PropTypes.object,
    data: PropTypes.string,
    gridListView: PropTypes.bool,
    action: PropTypes.func,

    DISABLED_SORT_COLS: PropTypes.array,
    DEFAULT_PAGE: PropTypes.number,
    DEFAULT_PAGE_SIZE: PropTypes.number,
    DEFAULT_SORT_COL: PropTypes.string,
    DEFAULT_SORT_TYPE: PropTypes.string
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      columns : [
        { name: 'title', title: 'Word', render: function(v, data, cellProps){
          //return <a key={data.id} onTouchTap={_this._handleNavigate.bind(this, data.id)}>{v}</a>
          return v;
        }, sortName: 'fv:custom_order'},
        /*{ name: 'fv:definitions', title: 'Definitions', render: function(v, data, cellProps) {
            return UIHelpers.renderComplexArrayRow(selectn('properties.' + cellProps.name, data), function (entry, i) {
              if (entry.language == DEFAULT_LANGUAGE && i < 2) {
                return <li key={i}>{entry.translation}</li>;
              }
            });
          }.bind(this), sortName: 'fv:definitions/0/translation'
        },*/
        { name: 'related_pictures', width: 72, textAlign: 'center', title: 'Picture', render: function(v, data, cellProps) {
            let firstPicture = selectn('contextParameters.word.' + cellProps.name + '[0]', data);
            if (firstPicture)
              return <img style={{maxWidth: '62px', maxHeight: '45px'}} key={selectn('uid', firstPicture)} src={UIHelpers.getThumbnail(firstPicture, 'Thumbnail')} />;
          }.bind(this)
        },
        { name: 'related_audio', title: 'Audio', render: function(v, data, cellProps) {
            let firstAudio = selectn('contextParameters.word.' + cellProps.name + '[0]', data);
            if (firstAudio)
              return <Preview minimal={true} tagStyles={{width: '300px', maxWidth:'100%'}} key={selectn('uid', firstAudio)} expandedValue={firstAudio} type="FVAudio" />;
          }.bind(this)
        },
        { name: 'fv:definitions', title: 'Definition', render: function(v, data, cellProps) {
            return UIHelpers.renderComplexArrayRow(selectn('properties.' + cellProps.name, data), function (entry, i) {
              if (entry.language == this.props.DEFAULT_LANGUAGE && i < 2) {
                return <li key={i}>{entry.translation}</li>;
              }
            }.bind(this));
          }.bind(this),
          sortName: 'fv:definitions/0/translation'
        },
        { name: 'fv-word:pronunciation', title: 'Pronunciation', render: function(v, data, cellProps) { return selectn('properties.fv-word:pronunciation', data); } },
        { name: 'fv-word:categories', title: 'Categories', render: function(v, data, cellProps) {
            return UIHelpers.renderComplexArrayRow(selectn('contextParameters.word.categories', data), function (entry, i) {
                return <li key={i}>{selectn('dc:title', entry)}</li>;
            });
          }.bind(this)
        },
        { name: 'fv-word:part_of_speech', title: 'Part of Speech', render: function(v, data, cellProps) { return selectn('contextParameters.word.part_of_speech', data); } }
      ],
      sortInfo: {
        uiSortOrder: [], 
        currentSortCols: this.props.DEFAULT_SORT_COL,
        currentSortType: this.props.DEFAULT_SORT_TYPE
      },
      pageInfo: {
        page: this.props.DEFAULT_PAGE,
        pageSize: this.props.DEFAULT_PAGE_SIZE
      }
    };

    // Reduce the number of columns displayed for mobile
    if (UIHelpers.isViewSize('xs')) {
      this.state.columns = this.state.columns.filter((v,k) => ['title', 'fv:literal_translation'].indexOf(v.name) != -1);
      this.state['hideStateColumn'] = true;
    }

    // Bind methods to 'this'
    ['_onNavigateRequest', '_onEntryNavigateRequest', '_handleRefetch', '_handleSortChange', '_handleColumnOrderChange', '_resetColumns'].forEach( (method => this[method] = this[method].bind(this)) );
  }

  fetchData(newProps) {
    if (newProps.dialect == null && !this.getDialect(newProps)) {
      newProps.fetchDialect2(newProps.routeParams.dialect_path);
    }

    this._fetchListViewData(newProps, newProps.DEFAULT_PAGE, newProps.DEFAULT_PAGE_SIZE, newProps.DEFAULT_SORT_TYPE, newProps.DEFAULT_SORT_COL);
  }

  _onEntryNavigateRequest(item) {
    if (this.props.action) {
      this.props.action(item);
    } else {
      let itemPath = item.path.replace('Dictionary', 'learn/words');
      NavigationHelpers.navigate('/' + this.props.routeParams.theme + itemPath, this.props.pushWindowPath, true);
    }
  }

  _fetchListViewData(props, pageIndex, pageSize, sortOrder, sortBy) {

    let currentAppliedFilter = '';

    if (props.filter.has('currentAppliedFilter')) {
      currentAppliedFilter = Object.values(props.filter.get('currentAppliedFilter').toJS()).join('')
    }

    props.fetchWords(props.routeParams.dialect_path + '/Dictionary',
    currentAppliedFilter + 
    '&currentPageIndex=' + (pageIndex - 1) + 
    '&pageSize=' + pageSize + 
    '&sortOrder=' + sortOrder +
    '&sortBy=' + sortBy
    );
  }

  getDialect(props = this.props) {
    return ProviderHelpers.getEntry(props.computeDialect2, props.routeParams.dialect_path);
  }

  render() {

    const computeEntities = Immutable.fromJS([{
      'id': this.props.routeParams.dialect_path + '/Dictionary',
      'entity': this.props.computeWords
    }]);

    // If dialect not supplied, promise wrapper will need to wait for compute dialect
    if (!this.props.dialect) {
      computeEntities.push(new Map({
        'id': this.props.routeParams.dialect_path,
        'entity': this.props.computeDialect2
      }));
    }

    const computeWords = ProviderHelpers.getEntry(this.props.computeWords, this.props.routeParams.dialect_path + '/Dictionary');
    const computeDialect2 = this.props.dialect || this.getDialect();

    return <PromiseWrapper renderOnError={true} computeEntities={computeEntities}>
                {(() => {
                if (selectn('response.entries', computeWords)) {

                    return <DocumentListView
                                objectDescriptions="words" 
                                type="FVWord"
                                data={computeWords}
                                gridListView={this.props.gridListView}
                                refetcher={this._handleRefetch}
                                onSortChange={this._handleSortChange}
                                onSelectionChange={this._onEntryNavigateRequest}
                                page={this.state.pageInfo.page}
                                pageSize={this.state.pageInfo.pageSize}
                                onColumnOrderChange={this._handleColumnOrderChange}
                                columns={this.state.columns}
                                sortInfo={this.state.sortInfo.uiSortOrder}
                                className="browseDataGrid" 
                                dialect={selectn('response', computeDialect2)} />;
                }
                })()}
        </PromiseWrapper>;
  }
}