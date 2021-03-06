import React from 'react'
import PropTypes from 'prop-types'

// REDUX
import { connect } from 'react-redux'

import ContributorEdit from 'views/pages/explore/dialect/Contributor/edit'
import validator from './validator'
import internationalization from './internationalization'
const { object, string } = PropTypes

export class RecorderEdit extends React.Component {
  static propTypes = {
    className: string,
    // REDUX: reducers/state
    routeParams: object.isRequired,
  }
  static defaultProps = {
    className: 'FormRecorder',
  }

  render() {
    const { routeParams } = this.props
    const { siteTheme, dialect_path } = routeParams
    const createUrl = `/${siteTheme}${dialect_path}/create/recorder`
    return (
      <ContributorEdit
        createUrl={createUrl}
        className={this.props.className}
        validator={validator}
        copy={internationalization}
      />
    )
  }
}

// REDUX: reducers/state
const mapStateToProps = (state) => {
  const { navigation } = state

  const { route } = navigation

  return {
    routeParams: route.routeParams,
  }
}
export default connect(
  mapStateToProps,
  null
)(RecorderEdit)
