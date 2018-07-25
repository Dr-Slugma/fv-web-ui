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
import Immutable, {List, Map} from 'immutable';
import classNames from 'classnames';
import selectn from 'selectn';

import DOMPurify from 'dompurify';

import ConfGlobal from 'conf/local.json';

import UIHelpers from 'common/UIHelpers';
import NavigationHelpers from 'common/NavigationHelpers';

import Preview from 'views/components/Editor/Preview';

import AVPlayArrow from 'material-ui/lib/svg-icons/av/play-arrow';
import AVStop from 'material-ui/lib/svg-icons/av/stop';

import Card from 'material-ui/lib/card/card';
import CardTitle from 'material-ui/lib/card/card-title';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardMedia from 'material-ui/lib/card/card-media';
import CardText from 'material-ui/lib/card/card-text';

import FlatButton from 'material-ui/lib/flat-button';
import IconButton from 'material-ui/lib/icon-button';

import Tabs from 'material-ui/lib/tabs/tabs';
import Tab from 'material-ui/lib/tabs/tab';
import IntlService from 'views/services/intl';

const intl = IntlService.instance;
const defaultStyle = {marginBottom: '20px'};

class Introduction extends Component {
    render() {

        const DEFAULT_LANGUAGE = this.props.defaultLanguage;
        const introTabStyle = {
            width: '99%',
            position: 'relative',
            overflowY: 'scroll',
            padding: '15px',
            height: '100px'
        };

        const introduction = selectn('properties.fvbook:introduction', this.props.item);
        const introductionTranslations = selectn('properties.fvbook:introduction_literal_translation', this.props.item);
        const introductionDiv = <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(introduction)}}
                                     style={Object.assign(introTabStyle, this.props.style)}></div>;

        if (!introductionTranslations || introductionTranslations.length == 0) {
            if (!introduction) {
                return null;
            }

            return <div style={{padding: '10px'}}>
                <div><h1 style={{
                    fontSize: '1.2em',
                    marginTop: 0
                }}>{intl.trans('introduction', 'Introduction', 'first')} {this.props.audio}</h1></div>
                {introductionDiv}</div>;
        }

        return <Tabs>
            <Tab label={intl.trans('introduction', 'Introduction', 'first')}>
                {introductionDiv}
            </Tab>
            <Tab label={intl.searchAndReplace(DEFAULT_LANGUAGE)}>
                <div style={Object.assign(introTabStyle, this.props.style)}>
                    {introductionTranslations.map(function (translation, i) {
                        if (translation.language == DEFAULT_LANGUAGE) {
                            return <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(translation.translation)}}
                                        key={i}></div>;
                        }
                    })}
                </div>
            </Tab>
        </Tabs>;
    }
}

class CardView extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            showIntro: false
        };
    }

    render() {

        // If action is not defined
        let action;

        let audioIcon = null;
        let audioCallback = null;

        if (this.props.hasOwnProperty('action') && typeof this.props.action === "function") {
            action = this.props.action;
        } else {
            action = () => {
            };
        }

        const DEFAULT_LANGUAGE = this.props.defaultLanguage;

        let mediumImage = selectn('contextParameters.book.related_pictures[0].views[2]', this.props.item);
        let coverImage = selectn('url', mediumImage) || '/assets/images/cover.png';
        let audioObj = selectn('contextParameters.book.related_audio[0].path', this.props.item);

        if (audioObj) {
            const stateFunc = function (state) {
                this.setState(state);
            }.bind(this);

            audioIcon = (decodeURIComponent(selectn('src', this.state.nowPlaying)) !== ConfGlobal.baseURL + audioObj) ?
                <AVPlayArrow style={{marginRight: '10px'}}/> : <AVStop style={{marginRight: '10px'}}/>;

            audioCallback = (decodeURIComponent(selectn('src', this.state.nowPlaying)) !== ConfGlobal.baseURL + audioObj) ? UIHelpers.playAudio.bind(this, this.state, stateFunc, ConfGlobal.baseURL + audioObj) : UIHelpers.stopAudio.bind(this, this.state, stateFunc);
        }

        // Translated 'continue' label
        let entryType = selectn('properties.fvbook:type', this.props.item);
        let translated_continue_label_key = "views.pages.explore.dialect.learn.songs_stories.continue_to_" + ((entryType) ? entryType : "x");
        
        const translated_continue_label = intl.trans(
            translated_continue_label_key,
            'Continue to ' + (entryType ? intl.searchAndReplace(entryType) : 'Entry'), 'first', [entryType ? intl.searchAndReplace(entryType) : intl.trans('entry', 'Entry', 'first')]);

        return <div style={Object.assign(defaultStyle, this.props.style)} key={this.props.item.uid}
                    className={classNames('col-xs-12', 'col-md-' + Math.ceil(12 / this.props.cols))}>
            <Card style={{minHeight: '260px'}}>

                <CardMedia
                    overlay={<CardTitle titleStyle={{fontSize: '19px'}} title={<span
                        dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(this.props.item.title)}}/>}
                                        subtitle={(selectn('properties.fvbook:title_literal_translation', this.props.item) || []).map(function (translation, i) {
                                            if (translation.language == DEFAULT_LANGUAGE) {
                                                return <span key={i}>{translation.translation}</span>;
                                            }
                                        })}/>}>

                    <div style={{
                        backgroundSize: (selectn('width', mediumImage) > 200) ? '100%' : 'cover',
                        minWidth: 'inherit',
                        width: '100%',
                        height: '180px',
                        textAlign: 'center',
                        backgroundImage: 'url(\'' + coverImage + '?inline=true\')'
                    }}>
                    </div>


                    <div style={{
                        position: 'absolute',
                        zIndex: (this.state.showIntro) ? 2 : -1,
                        top: '10px',
                        left: '10px',
                        width: '95%',
                        minWidth: 'auto',
                        padding: 0,
                        backgroundColor: '#fff',
                        height: '100%',
                        border: '1px solid #777777',
                        borderRadius: '0 0 10px 10px'
                    }}>

                        <IconButton iconClassName="material-icons"
                                    style={{position: 'absolute', right: 0, zIndex: 1000}}
                                    onTouchTap={() => this.setState({showIntro: false})}>clear</IconButton>

                        {(() => {
                            if (selectn('properties.fvbook:introduction', this.props.item)) {
                                return <Introduction {...this.props} audio={(audioIcon) ? <IconButton
                                    style={{verticalAlign: 'middle', padding: '0', width: '25px', height: '25px'}}
                                    iconStyle={{width: '25px', height: '25px'}}
                                    onTouchTap={audioCallback}>{audioIcon}</IconButton> : null}/>
                            }
                        })()}

                    </div>
                </CardMedia>

                <CardText style={{padding: '4px'}}>

                    <FlatButton
                        onTouchTap={this.props.action.bind(this, this.props.item)}
                        primary={true}
                        label={translated_continue_label}/>

                    {(() => {
                        if (selectn('properties.fvbook:introduction', this.props.item)) {

                            return <IconButton iconClassName="material-icons" style={{
                                verticalAlign: '-5px',
                                padding: '5px',
                                width: 'auto',
                                height: 'auto',
                                'float': 'right'
                            }} tooltipPosition="top-left"
                                               onTouchTap={() => this.setState({showIntro: !this.state.showIntro})}
                                               touch={true}>flip_to_front</IconButton>;
                        }
                    })()}

                </CardText>

            </Card>
        </div>;
    }
}

export {
    Introduction,
    CardView
}