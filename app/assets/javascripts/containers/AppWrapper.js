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
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import provide from 'react-redux-provide';

import Nuxeo from 'nuxeo';

import classNames from 'classnames';

import ConfGlobal from 'conf/local.json';

// Stores
import ClientStore from 'stores/ClientStore';
import UserStore from 'stores/UserStore';

// Actions
import ClientActions from 'actions/ClientActions';

// Components & Themes
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import ThemeDecorator from 'material-ui/lib/styles/theme-decorator';

import FirstVoicesTheme from 'views/themes/FirstVoicesTheme.js';
import NavigationCont from './Navigation';
import Footer from 'views/components/Navigation/Footer';

const mapStateToProps = (state) => {
  return { todos: state.todos };
}

const mapDispatchToProps = (dispatch) => {
  return {
    onTodoClick: (id) => {
      dispatch(toggleTodo(id))
    }
  }
}


//@connect(mapStateToProps, mapDispatchToProps)
@ThemeDecorator(ThemeManager.getMuiTheme(FirstVoicesTheme))
@provide
export default class AppWrapper extends Component {

  static propTypes = {
    list: PropTypes.arrayOf(PropTypes.object).isRequired,
    pushItem: PropTypes.func.isRequired
  };

  static childContextTypes = {
    client: React.PropTypes.object,
    muiTheme: React.PropTypes.object,
    siteProps: React.PropTypes.object
  };

  /**
  * Pass essential context to all children
  */
  getChildContext() {
    return {
      client: ClientStore.getState().client,
      muiTheme: ThemeManager.getMuiTheme(FirstVoicesTheme),
      siteProps: this.state.siteProps
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      siteProps: {
        title: ConfGlobal.title,
        domain: ConfGlobal.domain
      }
    };

    ClientActions.connect();
  }

  /**
  * Wrap render in AltContainer to have seamless access to stores
  */
  render() {
    return this.props.list.map(
      item => (
        <li key={item.time}>
          {new Date(item.time).toString()}
        </li>
      )
    );
  }
}