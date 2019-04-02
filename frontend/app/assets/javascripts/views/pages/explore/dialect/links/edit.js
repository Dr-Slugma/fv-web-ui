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
import Immutable, { List, Map } from 'immutable'
import classNames from 'classnames'
import provide from 'react-redux-provide'
import selectn from 'selectn'
import t from 'tcomb-form'

import ProviderHelpers from 'common/ProviderHelpers'
import NavigationHelpers from 'common/NavigationHelpers'
import PromiseWrapper from 'views/components/Document/PromiseWrapper'

// Models
import { Document } from 'nuxeo'

// Views
import RaisedButton from 'material-ui/lib/raised-button'
import Paper from 'material-ui/lib/paper'
import CircularProgress from 'material-ui/lib/circular-progress'

import fields from 'models/schemas/fields'
import options from 'models/schemas/options'

import withForm from 'views/hoc/view/with-form'
import IntlService from 'views/services/intl'

const intl = IntlService.instance
const EditViewWithForm = withForm(PromiseWrapper, true)

@provide
export default class Edit extends Component {
  static propTypes = {
    splitWindowPath: PropTypes.array.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    replaceWindowPath: PropTypes.func.isRequired,
    fetchLink: PropTypes.func.isRequired,
    computeLink: PropTypes.object.isRequired,
    updateLink: PropTypes.func.isRequired,
    fetchDialect2: PropTypes.func.isRequired,
    computeDialect2: PropTypes.object.isRequired,
    dialect: PropTypes.object,
    routeParams: PropTypes.object.isRequired,
    link: PropTypes.object,
    value: PropTypes.string,
    onDocumentCreated: PropTypes.func,
    cancelMethod: PropTypes.func,
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      link: null,
      linkPath: !props.value ? props.routeParams.dialect_path + '/Dictionary/' + props.routeParams.link : props.value,
      formValue: null,
    }

    // Bind methods to 'this'
    ;['_handleSave', '_handleCancel'].forEach((method) => (this[method] = this[method].bind(this)))
  }

  fetchData(newProps) {
    if (!newProps.dialect) {
      newProps.fetchDialect2(this.props.routeParams.dialect_path)
    }

    newProps.fetchLink(this.state.linkPath)
  }

  // Fetch data on initial render
  componentDidMount() {
    this.fetchData(this.props)
  }

  // Refetch data on URL change
  componentWillReceiveProps(nextProps) {
    let currentLink, nextLink

    if (this.state.linkPath != null) {
      currentLink = ProviderHelpers.getEntry(this.props.computeLink, this.state.linkPath)
      nextLink = ProviderHelpers.getEntry(nextProps.computeLink, this.state.linkPath)
    }

    // Complete on success
    if (
      selectn('wasUpdated', currentLink) != selectn('wasUpdated', nextLink) &&
      selectn('wasUpdated', nextLink) === true
    ) {
      if (nextProps.onDocumentCreated) {
        nextProps.onDocumentCreated(selectn('response', nextLink))
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    let previousLink = this.props.computeLink
    let nextLink = newProps.computeLink

    let previousDialect = this.props.computeDialect2
    let nextDialect = newProps.computeDialect2

    switch (true) {
      case newProps.routeParams.link != this.props.routeParams.link:
        return true
        break

      case newProps.routeParams.dialect_path != this.props.routeParams.dialect_path:
        return true
        break

      case typeof nextLink.equals === 'function' && nextLink.equals(previousLink) === false:
        return true
        break

      case typeof nextDialect.equals === 'function' && nextDialect.equals(previousDialect) === false:
        return true
        break
    }

    return false
  }

  _handleSave(link, formValue) {
    let newDocument = new Document(link.response, {
      repository: link.response._repository,
      nuxeo: link.response._nuxeo,
    })

    // Set new value property on document
    newDocument.set(formValue)

    // Save document
    this.props.updateLink(newDocument, null, null)

    if (this.props.onDocumentCreated) {
      this.props.onDocumentCreated(newDocument)
    }

    this.setState({ formValue: formValue })
  }

  _handleCancel() {
    if (this.props.cancelMethod) {
      this.props.cancelMethod()
    } else {
      NavigationHelpers.navigateUp(this.props.splitWindowPath, this.props.replaceWindowPath)
    }
  }

  render() {
    let context

    const computeEntities = Immutable.fromJS([
      {
        id: this.state.linkPath,
        entity: this.props.computeLink,
      },
      {
        id: this.props.routeParams.dialect_path,
        entity: this.props.computeDialect2,
      },
    ])

    const computeLink = ProviderHelpers.getEntry(this.props.computeLink, this.state.linkPath)
    const computeDialect2 = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path)

    // Additional context (in order to store origin), and initial filter value
    if (selectn('response', computeDialect2) && selectn('response', computeLink)) {
      let providedFilter =
        selectn('response.properties.fv-link:definitions[0].translation', computeLink) ||
        selectn('response.properties.fv:literal_translation[0].translation', computeLink)
      context = Object.assign(selectn('response', computeDialect2), {
        otherContext: {
          parentId: selectn('response.uid', computeLink),
          providedFilter: providedFilter,
        },
      })
    }

    return (
      <div>
        <h1>
          {intl.trans(
            'views.pages.explore.dialect.links.edit_x_link',
            'Edit ' + selectn('response.properties.dc:title', computeLink) + ' Link',
            'first',
            [selectn('response.properties.dc:title', computeLink)]
          )}
        </h1>

        <EditViewWithForm
          computeEntities={computeEntities}
          initialValues={context}
          itemId={this.state.linkPath}
          fields={fields}
          options={options}
          saveMethod={this._handleSave}
          cancelMethod={this._handleCancel}
          currentPath={this.props.splitWindowPath}
          navigationMethod={() => {}}
          type="FVLink"
          routeParams={this.props.routeParams}
        />
      </div>
    )
  }
}
