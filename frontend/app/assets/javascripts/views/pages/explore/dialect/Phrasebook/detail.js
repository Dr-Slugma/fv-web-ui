import React from 'react'
import { PropTypes } from 'react'
import selectn from 'selectn'

// REDUX
import { connect } from 'react-redux'
// REDUX: actions/dispatch/func
import { fetchCategory, fetchCategories } from 'providers/redux/reducers/fvCategory'

import ProviderHelpers from 'common/ProviderHelpers'

import { STATE_UNAVAILABLE, STATE_DEFAULT, STATE_ERROR_BOUNDARY } from 'common/Constants'

import StateUnavailable from './states/unavailable'
import StateDetail from './states/detail'
import StateErrorBoundary from './states/errorBoundary'

import '!style-loader!css-loader!./Phrasebook.css'

const { element, func, number, object, string } = PropTypes

export class PhrasebookDetail extends React.Component {
  static propTypes = {
    className: string,
    copy: object,
    groupName: string,
    breadcrumb: element,
    DEFAULT_PAGE: number,
    DEFAULT_PAGE_SIZE: number,
    DEFAULT_LANGUAGE: string,
    DEFAULT_SORT_COL: string,
    DEFAULT_SORT_TYPE: string,
    onDocumentCreated: func,
    validator: object,
    // REDUX: reducers/state
    computeCategory: object.isRequired,
    routeParams: object.isRequired,
    // REDUX: actions/dispatch/func
    fetchCategory: func.isRequired,
    fetchCategories: func.isRequired,
  }
  static defaultProps = {
    className: 'Phrasebook',
  }

  state = {
    componentState: STATE_UNAVAILABLE,
  }
  async componentDidMount() {
    const copy = this.props.copy
      ? this.props.copy
      : await import(/* webpackChunkName: "PhrasebookDetailInternationalization" */ './internationalization').then(
          (_copy) => {
            return _copy.default
          }
        )

    await this._getData({ copy })
  }
  render() {
    let content = null
    switch (this.state.componentState) {
      case STATE_UNAVAILABLE: {
        content = this._stateGetUnavailable()
        break
      }

      case STATE_DEFAULT: {
        content = this._stateGetDetail()
        break
      }
      case STATE_ERROR_BOUNDARY: {
        content = this._stateGetErrorBoundary()
        break
      }
      default:
        content = <div>{/* Shouldn't get here */}</div>
    }
    return content
  }
  _getData = async (addToState = {}) => {
    // Do any loading here...
    const { routeParams } = this.props
    const { itemId } = routeParams
    await this.props.fetchCategory(itemId)
    const item = await this._getItem()

    if (item.isError) {
      this.setState({
        componentState: STATE_ERROR_BOUNDARY,
        errorMessage: item.message,
        ...addToState,
      })
    } else {
      this.setState({
        componentState: STATE_DEFAULT,
        valueName: item.name,
        valueDescription: item.description,
        isTrashed: item.isTrashed,
        item: item.data,
        ...addToState,
      })
    }
  }
  _stateGetUnavailable = () => {
    const { className } = this.props
    return <StateUnavailable className={className} copy={this.state.copy} />
  }
  _stateGetErrorBoundary = () => {
    return <StateErrorBoundary errorMessage={this.state.errorMessage} copy={this.state.copy} />
  }
  _stateGetDetail = () => {
    const { className, groupName } = this.props
    const { isBusy, valueDescription, valueName, isTrashed } = this.state
    return (
      <StateDetail
        copy={this.state.copy}
        className={className}
        groupName={groupName}
        isBusy={isBusy}
        isTrashed={isTrashed}
        valueName={valueName}
        valueDescription={valueDescription}
      />
    )
  }
  _getItem = async () => {
    const { computeCategory, routeParams } = this.props
    const { itemId } = routeParams
    // Extract data from immutable:
    const _computeCategory = await ProviderHelpers.getEntry(computeCategory, itemId)
    if (_computeCategory.success) {
      // Extract data from object:
      const name = selectn(['response', 'properties', 'dc:title'], _computeCategory)
      const description = selectn(['response', 'properties', 'dc:description'], _computeCategory)
      const isTrashed = selectn(['response', 'isTrashed'], _computeCategory) || false
      // Respond...
      return { isTrashed, name, description, data: _computeCategory }
    }
    return { isError: _computeCategory.isError, message: _computeCategory.message }
  }
}

// REDUX: reducers/state
const mapStateToProps = (state /*, ownProps*/) => {
  const { fvCategory, navigation } = state

  const { computeCategory } = fvCategory

  const { route } = navigation

  return {
    computeCategory,
    routeParams: route.routeParams,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {
  fetchCategory,
  fetchCategories,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PhrasebookDetail)