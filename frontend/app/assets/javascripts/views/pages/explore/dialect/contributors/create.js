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
import provide from 'react-redux-provide'
import selectn from 'selectn'
import t from 'tcomb-form'

// Views
import RaisedButton from 'material-ui/lib/raised-button'
import Paper from 'material-ui/lib/paper'
import CircularProgress from 'material-ui/lib/circular-progress'

import StatusBar from 'views/components/StatusBar'

import ProviderHelpers from 'common/ProviderHelpers'

import fields from 'models/schemas/fields'
import options from 'models/schemas/options'
import IntlService from 'views/services/intl'

const intl = IntlService.instance
/**
 * Create contributor
 */
@provide
export default class PageDialectContributorsCreate extends Component {
  static propTypes = {
    windowPath: PropTypes.string.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    fetchDialect: PropTypes.func.isRequired,
    computeDialect: PropTypes.object.isRequired,
    createContributor: PropTypes.func.isRequired,
    computeContributor: PropTypes.object.isRequired,
    embedded: PropTypes.bool,
    onDocumentCreated: PropTypes.func,
  }

  static defaultProps = {
    embedded: false,
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      formValue: null,
      dialectPath: null,
      contributorPath: null,
    }

    // Bind methods to 'this'
    ;['_onRequestSaveForm'].forEach((method) => (this[method] = this[method].bind(this)))
  }

  fetchData(newProps) {
    let dialectPath = ProviderHelpers.getDialectPathFromURLArray(newProps.splitWindowPath)
    this.setState({ dialectPath: dialectPath })

    if (!this.props.computeDialect.success) {
      newProps.fetchDialect('/' + dialectPath)
    }
  }

  // Fetch data on initial render
  componentDidMount() {
    this.fetchData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.onDocumentCreated &&
      this.state.contributorPath &&
      selectn('success', ProviderHelpers.getEntry(nextProps.computeContributor, this.state.contributorPath))
    ) {
      this.props.onDocumentCreated(
        ProviderHelpers.getEntry(nextProps.computeContributor, this.state.contributorPath).response
      )
    }
  }

  shouldComponentUpdate(newProps, newState) {
    switch (true) {
      case newProps.windowPath != this.props.windowPath:
        return true
        break

      case newProps.computeDialect.response != this.props.computeDialect.response:
        return true
        break

      case newProps.computeContributor != this.props.computeContributor:
        return true
        break
    }

    return false
  }

  _onNavigateRequest(path) {
    //this.props.pushWindowPath('/' + path);
  }

  _onRequestSaveForm(e) {
    // Prevent default behaviour
    e.preventDefault()

    let formValue = this.refs['form_contributor_create'].getValue()

    let properties = {}

    for (let key in formValue) {
      if (formValue.hasOwnProperty(key) && key) {
        if (formValue[key] && formValue[key] != '') {
          properties[key] = formValue[key]
        }
      }
    }

    this.setState({
      formValue: properties,
    })

    // Passed validation
    if (formValue) {
      let now = Date.now()
      this.props.createContributor(
        '/' + this.state.dialectPath + '/Contributors',
        {
          type: 'FVContributor',
          name: formValue['dc:title'],
          properties: properties,
        },
        null,
        now
      )

      this.setState({
        contributorPath: '/' + this.state.dialectPath + '/Contributors/' + formValue['dc:title'] + '.' + now,
      })
    } else {
      //let firstError = this.refs["form_word_create"].validate().firstError();
      if (!this.props.embedded) window.scrollTo(0, 0)
    }
  }

  render() {
    const { computeDialect, computeContributor } = this.props

    let dialect = computeDialect.response
    let contributor = ProviderHelpers.getEntry(computeContributor, this.state.contributorPath)

    if (computeDialect.isFetching || !computeDialect.success) {
      return <CircularProgress mode="indeterminate" size={2} />
    }

    return (
      <div>
        <h1>
          {intl.trans(
            'views.pages.explore.dialect.contributors.add_new_contributor_to_x',
            'Add New Contributor to ' + dialect.get('dc:title'),
            null,
            [dialect.get('dc:title')]
          )}
        </h1>

        {contributor && contributor.message && contributor.action.includes('CREATE') ? (
          <StatusBar message={contributor.message} />
        ) : (
          ''
        )}

        <div className="row" style={{ marginTop: '15px' }}>
          <div className={classNames('col-xs-8', 'col-md-10')}>
            <form onSubmit={this._onRequestSaveForm}>
              <t.form.Form
                ref="form_contributor_create"
                type={t.struct(selectn('FVContributor', fields))}
                context={dialect}
                value={this.state.formValue}
                options={selectn('FVContributor', options)}
              />
              <div className="form-group">
                <button type="submit" className="btn btn-primary">
                  {intl.trans('save', 'Save', 'first')}
                </button>
              </div>
            </form>
          </div>

          <div className={classNames('col-xs-4', 'col-md-2')}>
            <Paper style={{ padding: '15px', margin: '20px 0' }} zDepth={2}>
              <div className="subheader">{intl.trans('metadata', 'Metadata', 'first')}</div>
            </Paper>
          </div>
        </div>
      </div>
    )
  }
}
