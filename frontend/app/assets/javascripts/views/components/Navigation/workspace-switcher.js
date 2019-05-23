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

import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'
import selectn from 'selectn'

// REDUX
import { connect } from 'react-redux'
// REDUX: actions/dispatch/func
import { pushWindowPath, replaceWindowPath } from 'providers/redux/reducers/windowPath'
import { fetchSourceDocument, fetchResultSet } from 'providers/redux/reducers/document'

import ProviderHelpers from 'common/ProviderHelpers'
import StringHelpers from 'common/StringHelpers'

import IntlService from 'views/services/intl'

const intl = IntlService.instance

const { array, func, object, string } = PropTypes

export class WorkspaceSwitcher extends Component {
  static propTypes = {
    area: string.isRequired,
    // REDUX: reducers/state
    computeSourceDocument: object.isRequired,
    computeResultSet: object.isRequired,
    splitWindowPath: array.isRequired,
    windowPath: string.isRequired,
    // REDUX: actions/dispatch/func
    pushWindowPath: func.isRequired,
    replaceWindowPath: func.isRequired,
    fetchSourceDocument: func.isRequired,
    fetchResultSet: func.isRequired,
  }

  constructor(props, context) {
    super(props, context)

    // Bind methods to 'this'
    ;['_isSection', '_getSourceDocument', '_getPublishedDocument', '_getPotentialUUID'].forEach(
      (method) => (this[method] = this[method].bind(this))
    )
  }

  _getPotentialUUID() {
    return this.props.splitWindowPath[this.props.splitWindowPath.length - 1]
  }

  _getSourceDocument() {
    if (StringHelpers.isUUID(this._getPotentialUUID())) {
      this.props.fetchSourceDocument(this._getPotentialUUID())
    } else {
      window.location.href = this._toggleWorkspaceSections(this.props.windowPath)
    }
  }

  _getPublishedDocument() {
    if (StringHelpers.isUUID(this._getPotentialUUID())) {
      this.props.fetchResultSet('published_for_' + this._getPotentialUUID(), {
        query: "SELECT ecm:uuid FROM Document WHERE ecm:proxyVersionableId = '" + this._getPotentialUUID() + "'",
        language: 'nxql',
        pageSize: 1,
      })
    } else {
      window.location.href = this._toggleWorkspaceSections(this.props.windowPath)
    }
  }

  _isSection() {
    return this.props.area == 'sections'
  }

  _toggleWorkspaceSections(path) {
    return this._isSection() ? path.replace('sections', 'Workspaces') : path.replace('Workspaces', 'sections')
  }

  componentWillReceiveProps(nextProps) {
    // Moving from Workspaces to sections
    if (this._isSection()) {
      const prev_source_doc = ProviderHelpers.getEntry(this.props.computeSourceDocument, this._getPotentialUUID())
      const next_source_doc = ProviderHelpers.getEntry(nextProps.computeSourceDocument, this._getPotentialUUID())

      const next_uuid = selectn('response.uid', next_source_doc)

      // 'Redirect' on success
      if (selectn('response.uid', prev_source_doc) != next_uuid && StringHelpers.isUUID(next_uuid)) {
        window.location.href = this._toggleWorkspaceSections(nextProps.windowPath).replace(
          this._getPotentialUUID(),
          next_uuid
        )
      }
    } else {
      // Moving from sections to Workspaces
      const prev_result_set = ProviderHelpers.getEntry(
        this.props.computeResultSet,
        'published_for_' + this._getPotentialUUID()
      )
      const next_result_set = ProviderHelpers.getEntry(
        nextProps.computeResultSet,
        'published_for_' + this._getPotentialUUID()
      )

      const next_uuid = selectn('response.entries[0].ecm:uuid', next_result_set)

      // 'Redirect' on success
      if (selectn('response.entries[0].ecm:uuid', prev_result_set) != next_uuid && StringHelpers.isUUID(next_uuid)) {
        window.location.href = this._toggleWorkspaceSections(nextProps.windowPath).replace(
          this._getPotentialUUID(),
          next_uuid
        )
      }
    }
  }

  // Fetch if missing

  render() {
    let noPublishedDocFound = ''

    if (
      selectn(
        'response.resultsCount',
        ProviderHelpers.getEntry(this.props.computeResultSet, 'published_for_' + this._getPotentialUUID())
      ) === 0
    ) {
      noPublishedDocFound = ' (N/A) '
    }

    return (
      <ul
        className={classNames('workspace-switcher', 'nav', 'nav-pills', 'pull-right')}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          paddingTop: '10px',
        }}
      >
        <li role="presentation" className={!this._isSection() ? 'active' : ''}>
          <a onClick={() => (this._isSection() ? this._getSourceDocument() : null)}>
            {intl.translate({
              key: 'workspace',
              default: 'Workspace',
              case: 'words',
            })}
          </a>
        </li>
        <li className={this._isSection() ? 'active' : ''} role="presentation">
          <a onClick={() => (!this._isSection() ? this._getPublishedDocument() : null)}>
            {intl.translate({
              key: 'public_view',
              default: 'Public View',
              case: 'words',
            })}
            {noPublishedDocFound}
          </a>
        </li>
      </ul>
    )
  }
}

// REDUX: reducers/state
const mapStateToProps = (state /*, ownProps*/) => {
  const { document, windowPath } = state

  const { computeResultSet, computeSourceDocument } = document
  const { splitWindowPath, _windowPath } = windowPath

  return {
    computeResultSet,
    computeSourceDocument,
    splitWindowPath,
    windowPath: _windowPath,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {
  pushWindowPath,
  replaceWindowPath,
  fetchSourceDocument,
  fetchResultSet,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkspaceSwitcher)
